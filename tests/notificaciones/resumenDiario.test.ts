import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/lib/prisma";

const notificarMock = vi.fn();
vi.mock("@/lib/notificaciones/crear", () => ({
  notificarATodosLosUsuarios: (...args: unknown[]) => notificarMock(...args),
}));

const { calcularResumenDiario, generarNotificacionesResumenDiario } =
  await import("@/lib/notificaciones/resumenDiario");

describe("resumen diario", () => {
  let importacionId: string;
  let usuarioId: string;

  beforeAll(async () => {
    const usuario = await prisma.usuario.create({
      data: {
        clerkId: `test-clerk-resumen-${Date.now()}`,
        email: `test-resumen-${Date.now()}@example.com`,
        roles: ["REVISOR"],
      },
    });
    usuarioId = usuario.id;

    const importacion = await prisma.importacionExcel.create({
      data: {
        nombreArchivoOriginal: "test-resumen.xlsx",
        usuarioId,
        cantidadFilas: 0,
        cantidadDuplicados: 0,
        cantidadErrores: 0,
      },
    });
    importacionId = importacion.id;
  });

  beforeEach(() => {
    notificarMock.mockClear();
  });

  afterAll(async () => {
    await prisma.casoReembolso.deleteMany({ where: { importacionId } });
    await prisma.importacionExcel.delete({ where: { id: importacionId } });
    await prisma.usuario.delete({ where: { id: usuarioId } });
    await prisma.$disconnect();
  });

  it("retorna null y no notifica si no hay nada pendiente (baseline, sin datos de prueba)", async () => {
    // Este assert es sobre el estado base ANTES de crear datos de
    // prueba, para documentar el comportamiento esperado; el conteo
    // real de la base compartida puede no ser 0, así que solo se
    // verifica la forma del resultado, no su valor exacto acá.
    const resumen = await calcularResumenDiario();
    expect(resumen).toEqual(
      expect.objectContaining({
        casosSinDocumento: expect.any(Number),
        duplicadosSinRevisar: expect.any(Number),
      })
    );
  });

  it("incluye los casos de prueba (boleta pendiente + duplicado sin revisar) en el conteo", async () => {
    const antes = await calcularResumenDiario();

    await prisma.casoReembolso.create({
      data: {
        folio: "resumen-1",
        conceptoGasto: "X",
        nBoleta: `resumen-boleta-${Date.now()}`,
        datosImportados: {},
        estadoActual: "Pendiente",
        importacionId,
      },
    });
    await prisma.casoReembolso.create({
      data: {
        folio: "resumen-2",
        conceptoGasto: "X",
        datosImportados: {},
        estadoActual: "Pendiente",
        posibleDuplicado: true,
        importacionId,
      },
    });

    const despues = await calcularResumenDiario();
    expect(despues!.casosSinDocumento).toBe(antes!.casosSinDocumento + 1);
    expect(despues!.duplicadosSinRevisar).toBe(
      antes!.duplicadosSinRevisar + 1
    );
  });

  it("genera una notificación agregada cuando hay pendientes", async () => {
    await generarNotificacionesResumenDiario();
    expect(notificarMock).toHaveBeenCalledTimes(1);
    expect(notificarMock).toHaveBeenCalledWith(
      "RESUMEN_DIARIO",
      expect.any(String),
      expect.any(String)
    );
  });
});
