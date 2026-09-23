import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { casosCreadosPorMes } from "@/lib/reporteria/evolucionMensual";

describe("casosCreadosPorMes", () => {
  let importacionId: string;
  let usuarioId: string;
  const casoIds: string[] = [];

  beforeAll(async () => {
    const usuario = await prisma.usuario.create({
      data: {
        clerkId: `test-clerk-evol-${Date.now()}`,
        email: `test-evol-${Date.now()}@example.com`,
        roles: ["IMPORTADOR"],
      },
    });
    usuarioId = usuario.id;

    const importacion = await prisma.importacionExcel.create({
      data: {
        nombreArchivoOriginal: "test-evol.xlsx",
        usuarioId,
        cantidadFilas: 3,
        cantidadDuplicados: 0,
        cantidadErrores: 0,
      },
    });
    importacionId = importacion.id;
  });

  afterAll(async () => {
    await prisma.casoReembolso.deleteMany({ where: { importacionId } });
    await prisma.importacionExcel.delete({ where: { id: importacionId } });
    await prisma.usuario.delete({ where: { id: usuarioId } });
    await prisma.$disconnect();
  });

  it("retorna exactamente 'meses' buckets ordenados cronológicamente", async () => {
    const resultado = await casosCreadosPorMes(6);
    expect(resultado).toHaveLength(6);
    for (let i = 1; i < resultado.length; i++) {
      expect(resultado[i].mes > resultado[i - 1].mes).toBe(true);
    }
  });

  it("cuenta los casos en el mes real de creación, sin afectar otros meses", async () => {
    const antes = await casosCreadosPorMes(6);
    const mapAntes = new Map(antes.map((b) => [b.mes, b.cantidad]));

    const ahora = new Date();
    const haceDosMeses = new Date(ahora.getFullYear(), ahora.getMonth() - 2, 15);

    const crear = (createdAt: Date) =>
      prisma.casoReembolso
        .create({
          data: {
            folio: `evol-${Date.now()}-${Math.random()}`,
            conceptoGasto: "X",
            datosImportados: {},
            estadoActual: "Pendiente",
            estudioAbogado: "Estudio Test",
            importacionId,
            createdAt,
          },
        })
        .then((c) => casoIds.push(c.id));

    await crear(ahora);
    await crear(ahora);
    await crear(haceDosMeses);

    const despues = await casosCreadosPorMes(6);
    const mapDespues = new Map(despues.map((b) => [b.mes, b.cantidad]));

    const clave = (f: Date) =>
      `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, "0")}`;

    expect(mapDespues.get(clave(ahora))).toBe((mapAntes.get(clave(ahora)) ?? 0) + 2);
    expect(mapDespues.get(clave(haceDosMeses))).toBe(
      (mapAntes.get(clave(haceDosMeses)) ?? 0) + 1
    );
  });
});
