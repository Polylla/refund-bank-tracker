import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { marcarDuplicadoRevisado } from "@/lib/notificaciones/marcarDuplicadoRevisado";

describe("marcarDuplicadoRevisado", () => {
  let importacionId: string;
  let usuarioId: string;
  let casoDuplicadoId: string;
  let casoNormalId: string;

  beforeAll(async () => {
    const usuario = await prisma.usuario.create({
      data: {
        clerkId: `test-clerk-dup-${Date.now()}`,
        email: `test-dup-${Date.now()}@example.com`,
        roles: ["REVISOR"],
      },
    });
    usuarioId = usuario.id;

    const importacion = await prisma.importacionExcel.create({
      data: {
        nombreArchivoOriginal: "test-dup.xlsx",
        usuarioId,
        cantidadFilas: 2,
        cantidadDuplicados: 1,
        cantidadErrores: 0,
      },
    });
    importacionId = importacion.id;

    const duplicado = await prisma.casoReembolso.create({
      data: {
        folio: "dup-1",
        conceptoGasto: "X",
        datosImportados: {},
        estadoActual: "Pendiente",
        posibleDuplicado: true,
        importacionId,
      },
    });
    casoDuplicadoId = duplicado.id;

    const normal = await prisma.casoReembolso.create({
      data: {
        folio: "dup-2",
        conceptoGasto: "X",
        datosImportados: {},
        estadoActual: "Pendiente",
        posibleDuplicado: false,
        importacionId,
      },
    });
    casoNormalId = normal.id;
  });

  afterAll(async () => {
    await prisma.casoReembolso.deleteMany({ where: { importacionId } });
    await prisma.importacionExcel.delete({ where: { id: importacionId } });
    await prisma.usuario.delete({ where: { id: usuarioId } });
    await prisma.$disconnect();
  });

  it("marca el duplicado como revisado", async () => {
    const resultado = await marcarDuplicadoRevisado(casoDuplicadoId, usuarioId);
    expect(resultado.ok).toBe(true);

    const caso = await prisma.casoReembolso.findUnique({
      where: { id: casoDuplicadoId },
    });
    expect(caso!.duplicadoRevisadoPorId).toBe(usuarioId);
    expect(caso!.duplicadoRevisadoEn).not.toBeNull();
  });

  it("rechaza un caso que no está marcado como posible duplicado", async () => {
    const resultado = await marcarDuplicadoRevisado(casoNormalId, usuarioId);
    expect(resultado.ok).toBe(false);
  });

  it("rechaza marcar dos veces el mismo caso (idempotencia)", async () => {
    const resultado = await marcarDuplicadoRevisado(casoDuplicadoId, usuarioId);
    expect(resultado.ok).toBe(false);
  });
});
