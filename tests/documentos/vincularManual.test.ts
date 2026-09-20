import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import {
  buscarCasosParaVincular,
  vincularDocumentoManualmente,
} from "@/lib/documentos/vincularManual";

describe("selección manual de documentos", () => {
  let importacionId: string;
  let usuarioId: string;
  let casoId: string;
  let documentoSinMatchId: string;
  let documentoMatcheadoId: string;
  const folioUnico = `manual-${Date.now()}`;

  beforeAll(async () => {
    const usuario = await prisma.usuario.create({
      data: {
        clerkId: `test-clerk-manual-${Date.now()}`,
        email: `test-manual-${Date.now()}@example.com`,
        roles: ["IMPORTADOR"],
      },
    });
    usuarioId = usuario.id;

    const importacion = await prisma.importacionExcel.create({
      data: {
        nombreArchivoOriginal: "test-manual.xlsx",
        usuarioId,
        cantidadFilas: 1,
        cantidadDuplicados: 0,
        cantidadErrores: 0,
      },
    });
    importacionId = importacion.id;

    const caso = await prisma.casoReembolso.create({
      data: {
        folio: folioUnico,
        conceptoGasto: "X",
        nBoleta: null,
        datosImportados: {},
        estadoActual: "Pendiente",
        estudioAbogado: "Estudio Test",
        importacionId,
      },
    });
    casoId = caso.id;

    const documentoSinMatch = await prisma.documento.create({
      data: {
        nombreArchivo: "sin-numero.pdf",
        tipoArchivo: "application/pdf",
        urlBlob: "https://blob.test/sin-numero",
        estadoMatching: "SIN_MATCH",
        nBoletaExtraido: null,
      },
    });
    documentoSinMatchId = documentoSinMatch.id;

    const documentoMatcheado = await prisma.documento.create({
      data: {
        nombreArchivo: "999.pdf",
        tipoArchivo: "application/pdf",
        urlBlob: "https://blob.test/999",
        estadoMatching: "MATCHEADO",
        nBoletaExtraido: "999",
      },
    });
    documentoMatcheadoId = documentoMatcheado.id;
  });

  afterAll(async () => {
    await prisma.documento.deleteMany({
      where: { id: { in: [documentoSinMatchId, documentoMatcheadoId] } },
    });
    await prisma.casoReembolso.deleteMany({ where: { importacionId } });
    await prisma.importacionExcel.delete({ where: { id: importacionId } });
    await prisma.usuario.delete({ where: { id: usuarioId } });
    await prisma.$disconnect();
  });

  it("busca casos por folio parcial", async () => {
    const resultados = await buscarCasosParaVincular(folioUnico.slice(0, 10));
    expect(resultados.map((c) => c.id)).toContain(casoId);
  });

  it("retorna vacío si no hay coincidencias", async () => {
    const resultados = await buscarCasosParaVincular("xxxxxxxxxxnadaquever");
    expect(resultados).toEqual([]);
  });

  it("vincula el documento sin match al caso elegido y lo marca MATCHEADO", async () => {
    const resultado = await vincularDocumentoManualmente(documentoSinMatchId, [
      casoId,
    ]);
    expect(resultado.ok).toBe(true);

    const documento = await prisma.documento.findUnique({
      where: { id: documentoSinMatchId },
      include: { casos: true },
    });
    expect(documento!.estadoMatching).toBe("MATCHEADO");
    expect(documento!.casos.map((c) => c.id)).toEqual([casoId]);
  });

  it("rechaza vincular con una lista vacía de casos", async () => {
    const resultado = await vincularDocumentoManualmente(
      documentoSinMatchId,
      []
    );
    expect(resultado.ok).toBe(false);
  });

  it("rechaza vincular un documento que ya está MATCHEADO", async () => {
    const resultado = await vincularDocumentoManualmente(
      documentoMatcheadoId,
      [casoId]
    );
    expect(resultado.ok).toBe(false);
  });
});
