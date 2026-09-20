import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { aprobarFila, descartarFila } from "@/lib/revision/acciones";

describe("acciones de revisión (aprobar / descartar)", () => {
  let usuarioId: string;
  let importacionId: string;
  let casoId: string;
  let filaAprobarId: string;
  let filaDescartarId: string;

  beforeAll(async () => {
    const usuario = await prisma.usuario.create({
      data: {
        clerkId: `test-clerk-acc-${Date.now()}`,
        email: `test-acc-${Date.now()}@example.com`,
        roles: ["REVISOR"],
      },
    });
    usuarioId = usuario.id;

    const importacion = await prisma.importacionExcel.create({
      data: {
        nombreArchivoOriginal: "test.xlsx",
        usuarioId,
        cantidadFilas: 1,
        cantidadDuplicados: 0,
        cantidadErrores: 0,
      },
    });
    importacionId = importacion.id;

    const caso = await prisma.casoReembolso.create({
      data: {
        folio: "12345",
        conceptoGasto: "NOTIF. TEST",
        datosImportados: { OT: "12345", "Costo de diligencia": 40000 },
        estadoActual: "Pendiente",
        estudioAbogado: "Estudio Test",
        importacionId,
      },
    });
    casoId = caso.id;

    const filaAprobar = await prisma.filaEnRevision.create({
      data: {
        importacionId,
        casoExistenteId: casoId,
        datosNuevos: { OT: "12345", "Costo de diligencia": 55000 },
      },
    });
    filaAprobarId = filaAprobar.id;

    const filaDescartar = await prisma.filaEnRevision.create({
      data: {
        importacionId,
        casoExistenteId: casoId,
        datosNuevos: { OT: "12345", "Costo de diligencia": 99999 },
      },
    });
    filaDescartarId = filaDescartar.id;
  });

  afterAll(async () => {
    await prisma.filaEnRevision.deleteMany({ where: { importacionId } });
    await prisma.historialEstado.deleteMany({ where: { casoId } });
    await prisma.casoReembolso.deleteMany({ where: { importacionId } });
    await prisma.importacionExcel.delete({ where: { id: importacionId } });
    await prisma.usuario.delete({ where: { id: usuarioId } });
    await prisma.$disconnect();
  });

  it("aprobar actualiza el caso con los datos nuevos y registra en el historial", async () => {
    const resultado = await aprobarFila(filaAprobarId, usuarioId);
    expect(resultado.ok).toBe(true);

    const caso = await prisma.casoReembolso.findUnique({ where: { id: casoId } });
    expect((caso!.datosImportados as Record<string, unknown>)["Costo de diligencia"]).toBe(
      55000
    );

    const fila = await prisma.filaEnRevision.findUnique({
      where: { id: filaAprobarId },
    });
    expect(fila!.estado).toBe("APROBADA");
    expect(fila!.revisadoPorId).toBe(usuarioId);
    expect(fila!.fechaRevision).not.toBeNull();

    const historial = await prisma.historialEstado.findMany({
      where: { casoId },
    });
    expect(historial.length).toBeGreaterThan(0);
  });

  it("descartar no modifica el caso, solo marca la fila como descartada", async () => {
    const resultado = await descartarFila(filaDescartarId, usuarioId);
    expect(resultado.ok).toBe(true);

    const caso = await prisma.casoReembolso.findUnique({ where: { id: casoId } });
    // sigue con el valor que dejó la aprobación anterior, no el de esta fila descartada
    expect((caso!.datosImportados as Record<string, unknown>)["Costo de diligencia"]).toBe(
      55000
    );

    const fila = await prisma.filaEnRevision.findUnique({
      where: { id: filaDescartarId },
    });
    expect(fila!.estado).toBe("DESCARTADA");
    expect(fila!.revisadoPorId).toBe(usuarioId);
  });

  it("no permite volver a aprobar/descartar una fila ya revisada", async () => {
    const resultado = await aprobarFila(filaAprobarId, usuarioId);
    expect(resultado.ok).toBe(false);
  });
});
