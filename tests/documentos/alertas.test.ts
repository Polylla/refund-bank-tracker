import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { casosSinDocumento, documentosSinMatch } from "@/lib/documentos/alertas";

describe("alertas de documentos", () => {
  let importacionId: string;
  let usuarioId: string;
  let casoConBoletaSinDocumento: string;
  let casoConBoletaYDocumento: string;
  let casoSinBoleta: string;
  let documentoMatcheadoId: string;
  let documentoSinMatchId: string;

  beforeAll(async () => {
    const usuario = await prisma.usuario.create({
      data: {
        clerkId: `test-clerk-alertas-${Date.now()}`,
        email: `test-alertas-${Date.now()}@example.com`,
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

    const boleta1 = `111${Date.now() % 100000}`;
    const boleta2 = `222${Date.now() % 100000}`;

    const a = await prisma.casoReembolso.create({
      data: {
        folio: "1",
        conceptoGasto: "X",
        nBoleta: boleta1,
        datosImportados: {},
        estadoActual: "Pendiente",
        importacionId,
      },
    });
    casoConBoletaSinDocumento = a.id;

    const b = await prisma.casoReembolso.create({
      data: {
        folio: "2",
        conceptoGasto: "X",
        nBoleta: boleta2,
        datosImportados: {},
        estadoActual: "Pendiente",
        importacionId,
      },
    });
    casoConBoletaYDocumento = b.id;

    const c = await prisma.casoReembolso.create({
      data: {
        folio: "3",
        conceptoGasto: "X",
        nBoleta: null,
        datosImportados: {},
        estadoActual: "Pendiente",
        importacionId,
      },
    });
    casoSinBoleta = c.id;

    const documentoMatcheado = await prisma.documento.create({
      data: {
        nombreArchivo: `${boleta2}.pdf`,
        tipoArchivo: "application/pdf",
        urlBlob: "https://blob.test/x",
        estadoMatching: "MATCHEADO",
        nBoletaExtraido: boleta2,
        casos: { connect: [{ id: casoConBoletaYDocumento }] },
      },
    });
    documentoMatcheadoId = documentoMatcheado.id;

    const documentoSinMatch = await prisma.documento.create({
      data: {
        nombreArchivo: "sin-numero.pdf",
        tipoArchivo: "application/pdf",
        urlBlob: "https://blob.test/y",
        estadoMatching: "SIN_MATCH",
        nBoletaExtraido: null,
      },
    });
    documentoSinMatchId = documentoSinMatch.id;
  });

  afterAll(async () => {
    await prisma.documento.deleteMany({
      where: { id: { in: [documentoMatcheadoId, documentoSinMatchId] } },
    });
    await prisma.casoReembolso.deleteMany({ where: { importacionId } });
    await prisma.importacionExcel.delete({ where: { id: importacionId } });
    await prisma.usuario.delete({ where: { id: usuarioId } });
    await prisma.$disconnect();
  });

  it("documentosSinMatch incluye solo los documentos con estadoMatching SIN_MATCH", async () => {
    const resultado = await documentosSinMatch();
    const ids = resultado.map((d) => d.id);
    expect(ids).toContain(documentoSinMatchId);
    expect(ids).not.toContain(documentoMatcheadoId);
  });

  it("casosSinDocumento incluye solo casos con nBoleta y sin Documento vinculado", async () => {
    const resultado = await casosSinDocumento();
    const ids = resultado.map((c) => c.id);
    expect(ids).toContain(casoConBoletaSinDocumento);
    expect(ids).not.toContain(casoConBoletaYDocumento);
    expect(ids).not.toContain(casoSinBoleta);
  });
});
