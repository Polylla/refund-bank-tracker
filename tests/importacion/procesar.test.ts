import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import { procesarImportacion } from "@/lib/importacion/procesar";

const FIXTURE_XLSX = path.join(
  __dirname,
  "..",
  "fixtures",
  "reembolsos-ejemplo.xlsx"
);

describe("procesarImportacion (integración con base de datos real)", () => {
  let usuarioId: string;
  let importacionId: string | undefined;

  beforeAll(async () => {
    const usuario = await prisma.usuario.create({
      data: {
        clerkId: `test-clerk-${Date.now()}`,
        email: `test-${Date.now()}@example.com`,
        roles: ["IMPORTADOR"],
      },
    });
    usuarioId = usuario.id;
  });

  afterAll(async () => {
    if (importacionId) {
      const casos = await prisma.casoReembolso.findMany({
        where: { importacionId },
        select: { id: true },
      });
      const casoIds = casos.map((c) => c.id);
      await prisma.historialEstado.deleteMany({
        where: { casoId: { in: casoIds } },
      });
      await prisma.casoReembolso.deleteMany({ where: { importacionId } });
      await prisma.importacionExcel.delete({ where: { id: importacionId } });
    }
    await prisma.usuario.delete({ where: { id: usuarioId } });
    await prisma.$disconnect();
  });

  it("crea 15 CasoReembolso y 1 ImportacionExcel a partir del fixture, descartando la fila de totales", async () => {
    const buffer = readFileSync(FIXTURE_XLSX);
    const resultado = await procesarImportacion(
      buffer,
      "reembolsos-ejemplo.xlsx",
      usuarioId
    );

    expect(resultado.ok).toBe(true);
    expect(resultado.resumen?.filasImportadas).toBe(15);
    expect(resultado.resumen?.filasDescartadas).toBe(1);
    expect(resultado.resumen?.filasDuplicadas).toBe(0);

    const importacion = await prisma.importacionExcel.findFirst({
      where: { usuarioId, nombreArchivoOriginal: "reembolsos-ejemplo.xlsx" },
      orderBy: { fecha: "desc" },
    });
    expect(importacion).not.toBeNull();
    importacionId = importacion!.id;

    const casos = await prisma.casoReembolso.findMany({
      where: { importacionId },
    });
    expect(casos).toHaveLength(15);
    expect(casos.every((c) => c.estadoActual === "Pendiente")).toBe(true);

    const historial = await prisma.historialEstado.findMany({
      where: { casoId: { in: casos.map((c) => c.id) } },
    });
    expect(historial).toHaveLength(15);
    expect(historial.every((h) => h.estadoAnterior === null)).toBe(true);
  }, 30000);
});
