import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/blob", () => ({
  uploadFile: vi.fn(async (pathname: string) => ({
    url: `https://blob.test/${pathname}`,
    pathname,
  })),
}));

const { subirDocumento } = await import("@/lib/documentos/subirDocumento");

describe("subirDocumento", () => {
  let importacionId: string;
  let usuarioId: string;
  let casoA: string;
  let casoB: string;
  let casoSinBoleta: string;
  let boletaCompartida: string;
  const documentoIds: string[] = [];

  beforeAll(async () => {
    const usuario = await prisma.usuario.create({
      data: {
        clerkId: `test-clerk-doc-${Date.now()}`,
        email: `test-doc-${Date.now()}@example.com`,
        roles: ["IMPORTADOR"],
      },
    });
    usuarioId = usuario.id;

    const importacion = await prisma.importacionExcel.create({
      data: {
        nombreArchivoOriginal: "test.xlsx",
        usuarioId,
        cantidadFilas: 3,
        cantidadDuplicados: 0,
        cantidadErrores: 0,
      },
    });
    importacionId = importacion.id;

    boletaCompartida = `999${Date.now() % 100000}`;

    const a = await prisma.casoReembolso.create({
      data: {
        folio: "1",
        conceptoGasto: "NOTIF A",
        nBoleta: boletaCompartida,
        datosImportados: {},
        estadoActual: "Pendiente",
        importacionId,
      },
    });
    casoA = a.id;

    const b = await prisma.casoReembolso.create({
      data: {
        folio: "1",
        conceptoGasto: "NOTIF B",
        nBoleta: boletaCompartida,
        datosImportados: {},
        estadoActual: "Pendiente",
        importacionId,
      },
    });
    casoB = b.id;

    const c = await prisma.casoReembolso.create({
      data: {
        folio: "2",
        conceptoGasto: "NOTIF C",
        nBoleta: null,
        datosImportados: {},
        estadoActual: "Pendiente",
        importacionId,
      },
    });
    casoSinBoleta = c.id;
  });

  afterAll(async () => {
    await prisma.documento.deleteMany({ where: { id: { in: documentoIds } } });
    await prisma.casoReembolso.deleteMany({ where: { importacionId } });
    await prisma.importacionExcel.delete({ where: { id: importacionId } });
    await prisma.usuario.delete({ where: { id: usuarioId } });
    await prisma.$disconnect();
  });

  it("matchea a los DOS casos que comparten la misma boleta", async () => {
    const buffer = Buffer.from("contenido-pdf");
    const documento = await subirDocumento(
      `${boletaCompartida}.pdf`,
      "application/pdf",
      buffer
    );
    documentoIds.push(documento.id);

    expect(documento.estadoMatching).toBe("MATCHEADO");
    expect(documento.nBoletaExtraido).toBe(boletaCompartida);

    const conCasos = await prisma.documento.findUnique({
      where: { id: documento.id },
      include: { casos: true },
    });
    const idsVinculados = conCasos!.casos.map((c) => c.id).sort();
    expect(idsVinculados).toEqual([casoA, casoB].sort());
    expect(idsVinculados).not.toContain(casoSinBoleta);
  });

  it("sin match si ninguna boleta coincide", async () => {
    const buffer = Buffer.from("contenido-pdf");
    const documento = await subirDocumento("000000nadie.pdf", "application/pdf", buffer);
    documentoIds.push(documento.id);

    expect(documento.estadoMatching).toBe("SIN_MATCH");
    expect(documento.nBoletaExtraido).toBe("000000");

    const conCasos = await prisma.documento.findUnique({
      where: { id: documento.id },
      include: { casos: true },
    });
    expect(conCasos!.casos).toHaveLength(0);
  });

  it("sin match si el nombre no tiene número reconocible", async () => {
    const buffer = Buffer.from("contenido-pdf");
    const documento = await subirDocumento("recibo-sin-numero.pdf", "application/pdf", buffer);
    documentoIds.push(documento.id);

    expect(documento.estadoMatching).toBe("SIN_MATCH");
    expect(documento.nBoletaExtraido).toBeNull();
  });
});
