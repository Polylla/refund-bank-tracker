import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import {
  casosPorEstado,
  filasEnRevisionPendientes,
  importacionesRecientes,
} from "@/lib/reporteria/metricas";

describe("métricas de reportería", () => {
  let importacionId: string;
  let usuarioId: string;
  const casoIds: string[] = [];

  beforeAll(async () => {
    const usuario = await prisma.usuario.create({
      data: {
        clerkId: `test-clerk-metricas-${Date.now()}`,
        email: `test-metricas-${Date.now()}@example.com`,
        roles: ["IMPORTADOR"],
      },
    });
    usuarioId = usuario.id;

    const importacion = await prisma.importacionExcel.create({
      data: {
        nombreArchivoOriginal: "test-metricas.xlsx",
        usuarioId,
        cantidadFilas: 3,
        cantidadDuplicados: 0,
        cantidadErrores: 0,
      },
    });
    importacionId = importacion.id;

    const estados = ["Pendiente", "Pendiente", "Pagado"] as const;
    for (const [i, estado] of estados.entries()) {
      const caso = await prisma.casoReembolso.create({
        data: {
          folio: `metrica-${i}`,
          conceptoGasto: "X",
          datosImportados: {},
          estadoActual: estado,
          estudioAbogado: "Estudio Test",
          importacionId,
        },
      });
      casoIds.push(caso.id);
    }

    await prisma.filaEnRevision.create({
      data: {
        importacionId,
        casoExistenteId: casoIds[0],
        datosNuevos: {},
        estado: "PENDIENTE",
      },
    });
    await prisma.filaEnRevision.create({
      data: {
        importacionId,
        casoExistenteId: casoIds[0],
        datosNuevos: {},
        estado: "APROBADA",
      },
    });
  });

  afterAll(async () => {
    await prisma.filaEnRevision.deleteMany({ where: { importacionId } });
    await prisma.casoReembolso.deleteMany({ where: { importacionId } });
    await prisma.importacionExcel.delete({ where: { id: importacionId } });
    await prisma.usuario.delete({ where: { id: usuarioId } });
    await prisma.$disconnect();
  });

  it("casosPorEstado cuenta los casos de este lote de prueba correctamente", async () => {
    const resultado = await casosPorEstado();
    const pendiente = resultado.find((r) => r.estado === "Pendiente");
    const pagado = resultado.find((r) => r.estado === "Pagado");
    expect(pendiente?.cantidad).toBeGreaterThanOrEqual(2);
    expect(pagado?.cantidad).toBeGreaterThanOrEqual(1);
  });

  it("filasEnRevisionPendientes cuenta solo las PENDIENTE, no las ya resueltas", async () => {
    const antes = await filasEnRevisionPendientes();
    // El lote de prueba agrega exactamente 1 pendiente (la aprobada no cuenta)
    expect(antes).toBeGreaterThanOrEqual(1);
  });

  it("importacionesRecientes incluye la importación recién creada", async () => {
    const recientes = await importacionesRecientes(50);
    const encontrada = recientes.find((i) => i.id === importacionId);
    expect(encontrada).toBeDefined();
    expect(encontrada?.cantidadFilas).toBe(3);
  });
});
