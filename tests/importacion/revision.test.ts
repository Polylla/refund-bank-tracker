import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { procesarImportacion } from "@/lib/importacion/procesar";

// Folios únicos por corrida (no depende del fixture compartido con
// tests/importacion/procesar.test.ts) para no pisarse con otros tests
// que corren contra la misma base Neon real de desarrollo.
const OT_BASE = 80000000 + (Date.now() % 1000000);

const HEADERS =
  "OT,Nombre cliente,RUT,Tribunal,N° de Rol,Año Rol,Nombre receptor,Conceptos gasto de receptor,Costo de diligencia,Fecha pago,Estudio/Abogado,Fecha envío a pago,Estado reembolso";

function csvDeDosFilas(): string {
  const filas = [
    `${OT_BASE},CLIENTE UNO,1.111.111-1,TRIBUNAL TEST,1000,2026,RECEPTOR TEST,NOTIF. TEST,40000,,ESTUDIO TEST,,`,
    `${OT_BASE + 1},CLIENTE DOS,2.222.222-2,TRIBUNAL TEST,1001,2026,RECEPTOR TEST,NOTIF. TEST,50000,,ESTUDIO TEST,,`,
  ];
  return [HEADERS, ...filas].join("\n");
}

describe("procesarImportacion — reimportación (coincidencia contra la base)", () => {
  let usuarioId: string;
  const importacionIds: string[] = [];

  beforeAll(async () => {
    const usuario = await prisma.usuario.create({
      data: {
        clerkId: `test-clerk-rev-${Date.now()}`,
        email: `test-rev-${Date.now()}@example.com`,
        roles: ["IMPORTADOR"],
      },
    });
    usuarioId = usuario.id;
  });

  afterAll(async () => {
    const casos = await prisma.casoReembolso.findMany({
      where: { importacionId: { in: importacionIds } },
      select: { id: true },
    });
    const casoIds = casos.map((c) => c.id);

    await prisma.filaEnRevision.deleteMany({
      where: { importacionId: { in: importacionIds } },
    });
    await prisma.historialEstado.deleteMany({
      where: { casoId: { in: casoIds } },
    });
    await prisma.casoReembolso.deleteMany({
      where: { importacionId: { in: importacionIds } },
    });
    await prisma.importacionExcel.deleteMany({
      where: { id: { in: importacionIds } },
    });
    await prisma.usuario.delete({ where: { id: usuarioId } });
    await prisma.$disconnect();
  });

  it("la primera importación crea los casos; reimportar el mismo archivo no duplica, va a revisión", async () => {
    const buffer = Buffer.from(csvDeDosFilas(), "utf-8");

    const primera = await procesarImportacion(
      buffer,
      "reembolsos-revision-test.csv",
      usuarioId
    );
    expect(primera.ok).toBe(true);
    expect(primera.resumen?.filasImportadas).toBe(2);
    expect(primera.resumen?.filasEnRevision).toBe(0);

    const primeraImportacion = await prisma.importacionExcel.findFirst({
      where: { usuarioId },
      orderBy: { fecha: "desc" },
    });
    importacionIds.push(primeraImportacion!.id);

    const segunda = await procesarImportacion(
      buffer,
      "reembolsos-revision-test.csv",
      usuarioId
    );
    expect(segunda.ok).toBe(true);
    expect(segunda.resumen?.filasImportadas).toBe(0);
    expect(segunda.resumen?.filasEnRevision).toBe(2);
    expect(segunda.resumen?.filasDuplicadas).toBe(0);

    const segundaImportacion = await prisma.importacionExcel.findFirst({
      where: { usuarioId, id: { not: primeraImportacion!.id } },
      orderBy: { fecha: "desc" },
    });
    importacionIds.push(segundaImportacion!.id);

    const totalCasos = await prisma.casoReembolso.count({
      where: { importacionId: { in: importacionIds } },
    });
    expect(totalCasos).toBe(2); // no se duplicaron

    const filasEnRevision = await prisma.filaEnRevision.findMany({
      where: { importacionId: segundaImportacion!.id },
    });
    expect(filasEnRevision).toHaveLength(2);
    expect(filasEnRevision.every((f) => f.estado === "PENDIENTE")).toBe(true);
  }, 60000);
});
