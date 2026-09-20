import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { resumenPorOt } from "@/lib/reporteria/porOt";

describe("resumenPorOt", () => {
  let importacionId: string;
  let usuarioId: string;
  const folio = `ot-test-${Date.now()}`;

  beforeAll(async () => {
    const usuario = await prisma.usuario.create({
      data: {
        clerkId: `test-clerk-porot-${Date.now()}`,
        email: `test-porot-${Date.now()}@example.com`,
        roles: ["IMPORTADOR"],
      },
    });
    usuarioId = usuario.id;

    const importacion = await prisma.importacionExcel.create({
      data: {
        nombreArchivoOriginal: "test-porot.xlsx",
        usuarioId,
        cantidadFilas: 3,
        cantidadDuplicados: 0,
        cantidadErrores: 0,
      },
    });
    importacionId = importacion.id;

    await prisma.casoReembolso.create({
      data: {
        folio,
        conceptoGasto: "NOTIF. DEMANDA",
        datosImportados: { "Costo de diligencia": 40000 },
        estadoActual: "Pagado",
        estudioAbogado: "Estudio Test",
        importacionId,
      },
    });
    await prisma.casoReembolso.create({
      data: {
        folio,
        conceptoGasto: "NOTIF. SENTENCIA",
        datosImportados: { "Costo de diligencia": 60000 },
        estadoActual: "Pagado",
        estudioAbogado: "Estudio Test",
        importacionId,
      },
    });
    await prisma.casoReembolso.create({
      data: {
        folio,
        conceptoGasto: "NOTIF. TERCERO",
        datosImportados: { "Costo de diligencia": 10000 },
        estadoActual: "Pendiente",
        estudioAbogado: "Estudio Test",
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

  it("cuenta las diligencias pagadas y los montos exactos para una OT existente", async () => {
    const resumen = await resumenPorOt(folio);
    expect(resumen.cantidadTotal).toBe(3);
    expect(resumen.cantidadPagadas).toBe(2);
    expect(resumen.montoTotal).toBe(110000);
    expect(resumen.montoPagado).toBe(100000);
  });

  it("una OT sin casos retorna todo en 0, sin error", async () => {
    const resumen = await resumenPorOt("ot-que-no-existe-jamas");
    expect(resumen).toEqual({
      folio: "ot-que-no-existe-jamas",
      cantidadTotal: 0,
      cantidadPagadas: 0,
      montoTotal: 0,
      montoPagado: 0,
    });
  });
});
