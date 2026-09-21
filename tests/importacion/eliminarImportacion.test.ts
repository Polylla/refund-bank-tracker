import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import {
  resumenEliminarImportacion,
  eliminarImportacion,
} from "@/lib/importacion/eliminarImportacion";

describe("eliminar importación", () => {
  let usuarioId: string;
  let importacionAId: string;
  let importacionBId: string;
  let casoPendienteId: string;
  let casoConAvanceId: string;
  let documentoId: string;
  let filaExternaId: string;

  beforeAll(async () => {
    const usuario = await prisma.usuario.create({
      data: {
        clerkId: `test-clerk-elimimp-${Date.now()}`,
        email: `test-elimimp-${Date.now()}@example.com`,
        roles: ["IMPORTADOR"],
      },
    });
    usuarioId = usuario.id;

    const importacionA = await prisma.importacionExcel.create({
      data: {
        nombreArchivoOriginal: "test-elim-a.xlsx",
        usuarioId,
        cantidadFilas: 2,
        cantidadDuplicados: 0,
        cantidadErrores: 0,
      },
    });
    importacionAId = importacionA.id;

    const documento = await prisma.documento.create({
      data: {
        nombreArchivo: "999.pdf",
        tipoArchivo: "application/pdf",
        urlBlob: "https://blob.test/999-elim",
        estadoMatching: "MATCHEADO",
        nBoletaExtraido: "999",
      },
    });
    documentoId = documento.id;

    const casoPendiente = await prisma.casoReembolso.create({
      data: {
        folio: "elim-1",
        conceptoGasto: "X",
        nBoleta: "999",
        datosImportados: {},
        estadoActual: "Pendiente",
        estudioAbogado: "Estudio Test",
        importacionId: importacionAId,
        documentos: { connect: { id: documentoId } },
      },
    });
    casoPendienteId = casoPendiente.id;

    const casoConAvance = await prisma.casoReembolso.create({
      data: {
        folio: "elim-2",
        conceptoGasto: "X",
        datosImportados: {},
        estadoActual: "Pagado",
        estudioAbogado: "Estudio Test",
        importacionId: importacionAId,
      },
    });
    casoConAvanceId = casoConAvance.id;

    await prisma.historialEstado.create({
      data: {
        casoId: casoConAvanceId,
        estadoAnterior: "Pendiente",
        estadoNuevo: "Pagado",
        usuarioId,
      },
    });

    // Importación B (no se borra) que generó una FilaEnRevision apuntando
    // a casoPendiente (de la importación A) como "caso existente".
    const importacionB = await prisma.importacionExcel.create({
      data: {
        nombreArchivoOriginal: "test-elim-b.xlsx",
        usuarioId,
        cantidadFilas: 1,
        cantidadDuplicados: 0,
        cantidadErrores: 0,
      },
    });
    importacionBId = importacionB.id;

    const filaExterna = await prisma.filaEnRevision.create({
      data: {
        importacionId: importacionBId,
        casoExistenteId: casoPendienteId,
        datosNuevos: {},
      },
    });
    filaExternaId = filaExterna.id;
  });

  afterAll(async () => {
    await prisma.filaEnRevision.deleteMany({
      where: { importacionId: { in: [importacionAId, importacionBId] } },
    });
    await prisma.historialEstado.deleteMany({
      where: { casoId: { in: [casoPendienteId, casoConAvanceId] } },
    });
    await prisma.casoReembolso.deleteMany({
      where: { importacionId: { in: [importacionAId, importacionBId] } },
    });
    await prisma.documento.deleteMany({ where: { id: documentoId } });
    await prisma.importacionExcel.deleteMany({
      where: { id: { in: [importacionAId, importacionBId] } },
    });
    await prisma.usuario.delete({ where: { id: usuarioId } });
    await prisma.$disconnect();
  });

  it("resumenEliminarImportacion cuenta casos totales, con avance y con documento", async () => {
    const resumen = await resumenEliminarImportacion(importacionAId);
    expect(resumen).toEqual({
      cantidadCasos: 2,
      casosConAvance: 1,
      casosConDocumento: 1,
    });
  });

  it("eliminarImportacion borra todo sin error de FK y deja el documento en SIN_MATCH", async () => {
    const resultado = await eliminarImportacion(importacionAId);
    expect(resultado.ok).toBe(true);

    const importacion = await prisma.importacionExcel.findUnique({
      where: { id: importacionAId },
    });
    expect(importacion).toBeNull();

    const casos = await prisma.casoReembolso.findMany({
      where: { id: { in: [casoPendienteId, casoConAvanceId] } },
    });
    expect(casos).toHaveLength(0);

    const historial = await prisma.historialEstado.findMany({
      where: { casoId: casoConAvanceId },
    });
    expect(historial).toHaveLength(0);

    const filaExterna = await prisma.filaEnRevision.findUnique({
      where: { id: filaExternaId },
    });
    expect(filaExterna).toBeNull();

    const documento = await prisma.documento.findUnique({
      where: { id: documentoId },
    });
    expect(documento?.estadoMatching).toBe("SIN_MATCH");

    // La importación B (no eliminada) sigue existiendo.
    const importacionB = await prisma.importacionExcel.findUnique({
      where: { id: importacionBId },
    });
    expect(importacionB).not.toBeNull();
  }, 20000);

  it("retorna error si la importación no existe", async () => {
    const resultado = await eliminarImportacion("id-que-no-existe");
    expect(resultado.ok).toBe(false);
  });
});
