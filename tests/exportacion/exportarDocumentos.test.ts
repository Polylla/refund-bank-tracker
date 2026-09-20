import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import JSZip from "jszip";
import { prisma } from "@/lib/prisma";

function streamDeTexto(texto: string): ReadableStream<Uint8Array> {
  return new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(texto));
      controller.close();
    },
  });
}

const getMock = vi.fn();
vi.mock("@vercel/blob", () => ({
  get: (...args: unknown[]) => getMock(...args),
}));

const { generarZipDocumentos } = await import(
  "@/lib/exportacion/exportarDocumentos"
);

describe("generarZipDocumentos", () => {
  let importacionId: string;
  let usuarioId: string;
  const rutUnico = `test-rut-zip-${Date.now()}`;
  const documentoIds: string[] = [];
  const casoIds: string[] = [];

  beforeAll(async () => {
    const usuario = await prisma.usuario.create({
      data: {
        clerkId: `test-clerk-zip-${Date.now()}`,
        email: `test-zip-${Date.now()}@example.com`,
        roles: ["IMPORTADOR"],
      },
    });
    usuarioId = usuario.id;

    const importacion = await prisma.importacionExcel.create({
      data: {
        nombreArchivoOriginal: "test-zip.xlsx",
        usuarioId,
        cantidadFilas: 2,
        cantidadDuplicados: 0,
        cantidadErrores: 0,
      },
    });
    importacionId = importacion.id;

    const documentoCompartido = await prisma.documento.create({
      data: {
        nombreArchivo: "740.pdf",
        tipoArchivo: "application/pdf",
        urlBlob: "https://blob.test/740",
        estadoMatching: "MATCHEADO",
        nBoletaExtraido: "740",
      },
    });
    documentoIds.push(documentoCompartido.id);

    const casoConDoc1 = await prisma.casoReembolso.create({
      data: {
        folio: "zip-1",
        conceptoGasto: "NOTIF. DEMANDA",
        nBoleta: "740",
        datosImportados: { RUT: rutUnico },
        estadoActual: "Pendiente",
        estudioAbogado: "Estudio Test",
        importacionId,
        documentos: { connect: { id: documentoCompartido.id } },
      },
    });
    casoIds.push(casoConDoc1.id);

    const casoConDoc2 = await prisma.casoReembolso.create({
      data: {
        folio: "zip-2",
        conceptoGasto: "NOTIF. SENTENCIA",
        nBoleta: "740",
        datosImportados: { RUT: rutUnico },
        estadoActual: "Pendiente",
        estudioAbogado: "Estudio Test",
        importacionId,
        documentos: { connect: { id: documentoCompartido.id } },
      },
    });
    casoIds.push(casoConDoc2.id);

    const casoSinDoc = await prisma.casoReembolso.create({
      data: {
        folio: "zip-3",
        conceptoGasto: "NOTIF. TEST",
        datosImportados: { RUT: rutUnico },
        estadoActual: "Pendiente",
        estudioAbogado: "Estudio Test",
        importacionId,
      },
    });
    casoIds.push(casoSinDoc.id);
  });

  afterAll(async () => {
    await prisma.casoReembolso.deleteMany({ where: { importacionId } });
    await prisma.documento.deleteMany({ where: { id: { in: documentoIds } } });
    await prisma.importacionExcel.delete({ where: { id: importacionId } });
    await prisma.usuario.delete({ where: { id: usuarioId } });
    await prisma.$disconnect();
  });

  it("un documento matcheado a 2 casos filtrados aparece en las 2 carpetas; el caso sin documento no genera carpeta", async () => {
    getMock.mockResolvedValue({
      statusCode: 200,
      stream: streamDeTexto("contenido-pdf"),
      blob: { contentType: "application/pdf" },
    });

    const buffer = await generarZipDocumentos({
      campoImportado: "RUT",
      valorImportado: rutUnico,
    });

    const zip = await JSZip.loadAsync(buffer);
    const rutas = Object.values(zip.files)
      .filter((f) => !f.dir)
      .map((f) => f.name)
      .sort();

    expect(rutas).toContain("zip-1_NOTIF. DEMANDA/740.pdf");
    expect(rutas).toContain("zip-2_NOTIF. SENTENCIA/740.pdf");
    expect(rutas.some((r) => r.startsWith("zip-3_"))).toBe(false);
    expect(rutas).toHaveLength(2);

    const contenido = await zip.file("zip-1_NOTIF. DEMANDA/740.pdf")!.async("string");
    expect(contenido).toBe("contenido-pdf");
  });

  it("sin casos filtrados retorna un zip válido y vacío", async () => {
    const buffer = await generarZipDocumentos({
      campoImportado: "RUT",
      valorImportado: "rut-que-no-existe",
    });

    const zip = await JSZip.loadAsync(buffer);
    expect(Object.keys(zip.files)).toHaveLength(0);
  });
});
