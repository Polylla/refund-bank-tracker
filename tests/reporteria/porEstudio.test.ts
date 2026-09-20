import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { resumenPorEstudio } from "@/lib/reporteria/porEstudio";

describe("resumenPorEstudio", () => {
  let importacionId: string;
  let usuarioId: string;
  const estudioA = `Estudio A ${Date.now()}`;
  const estudioB = `Estudio B ${Date.now()}`;

  beforeAll(async () => {
    const usuario = await prisma.usuario.create({
      data: {
        clerkId: `test-clerk-porestudio-${Date.now()}`,
        email: `test-porestudio-${Date.now()}@example.com`,
        roles: ["IMPORTADOR"],
      },
    });
    usuarioId = usuario.id;

    const importacion = await prisma.importacionExcel.create({
      data: {
        nombreArchivoOriginal: "test-porestudio.xlsx",
        usuarioId,
        cantidadFilas: 3,
        cantidadDuplicados: 0,
        cantidadErrores: 0,
      },
    });
    importacionId = importacion.id;

    await prisma.casoReembolso.create({
      data: {
        folio: "pe-1",
        conceptoGasto: "X",
        datosImportados: { "Costo de diligencia": 40000 },
        estadoActual: "Pendiente",
        estudioAbogado: estudioA,
        importacionId,
      },
    });
    await prisma.casoReembolso.create({
      data: {
        folio: "pe-2",
        conceptoGasto: "X",
        datosImportados: { "Costo de diligencia": 60000 },
        estadoActual: "Pagado",
        estudioAbogado: estudioA,
        importacionId,
      },
    });
    await prisma.casoReembolso.create({
      data: {
        folio: "pe-3",
        conceptoGasto: "X",
        datosImportados: { "Costo de diligencia": 10000 },
        estadoActual: "Pendiente",
        estudioAbogado: estudioB,
        importacionId,
      },
    });
  });

  afterAll(async () => {
    await prisma.casoReembolso.deleteMany({ where: { importacionId } });
    await prisma.importacionExcel.delete({ where: { id: importacionId } });
    await prisma.usuario.delete({ where: { id: usuarioId } });
    await prisma.$disconnect();
  });

  it("agrupa por estudio con totales y desglose por estado exactos", async () => {
    const resultado = await resumenPorEstudio();

    const resumenA = resultado.find((r) => r.estudio === estudioA)!;
    expect(resumenA.cantidadTotal).toBe(2);
    expect(resumenA.montoTotal).toBe(100000);
    expect(resumenA.porEstado["Pendiente"]).toEqual({ cantidad: 1, monto: 40000 });
    expect(resumenA.porEstado["Pagado"]).toEqual({ cantidad: 1, monto: 60000 });
    // Un estado sin casos para este estudio queda en 0, no undefined.
    expect(resumenA.porEstado["Rechazado"]).toEqual({ cantidad: 0, monto: 0 });

    const resumenB = resultado.find((r) => r.estudio === estudioB)!;
    expect(resumenB.cantidadTotal).toBe(1);
    expect(resumenB.montoTotal).toBe(10000);
    expect(resumenB.porEstado["Pendiente"]).toEqual({ cantidad: 1, monto: 10000 });
    expect(resumenB.porEstado["Pagado"]).toEqual({ cantidad: 0, monto: 0 });
  });
});
