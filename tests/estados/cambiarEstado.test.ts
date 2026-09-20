import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { cambiarEstado } from "@/lib/estados/cambiarEstado";

describe("cambiarEstado", () => {
  let usuarioId: string;
  let importacionId: string;

  beforeAll(async () => {
    const usuario = await prisma.usuario.create({
      data: {
        clerkId: `test-clerk-estado-${Date.now()}`,
        email: `test-estado-${Date.now()}@example.com`,
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
  });

  afterAll(async () => {
    const casos = await prisma.casoReembolso.findMany({
      where: { importacionId },
      select: { id: true },
    });
    await prisma.historialEstado.deleteMany({
      where: { casoId: { in: casos.map((c) => c.id) } },
    });
    await prisma.casoReembolso.deleteMany({ where: { importacionId } });
    await prisma.importacionExcel.delete({ where: { id: importacionId } });
    await prisma.usuario.delete({ where: { id: usuarioId } });
    await prisma.$disconnect();
  });

  it("rechaza un estado fuera de la lista cerrada", async () => {
    const caso = await prisma.casoReembolso.create({
      data: {
        folio: "1",
        conceptoGasto: "X",
        datosImportados: {},
        estadoActual: "Pendiente",
        estudioAbogado: "Estudio Test",
        importacionId,
      },
    });

    const resultado = await cambiarEstado(caso.id, "Aprobado", usuarioId);
    expect(resultado.ok).toBe(false);

    const casoSinCambios = await prisma.casoReembolso.findUnique({
      where: { id: caso.id },
    });
    expect(casoSinCambios!.estadoActual).toBe("Pendiente");
  });

  it("cambiar a Enviado a pago completa fechaEnvioPago y registra historial", async () => {
    const caso = await prisma.casoReembolso.create({
      data: {
        folio: "2",
        conceptoGasto: "X",
        datosImportados: {},
        estadoActual: "Pendiente",
        estudioAbogado: "Estudio Test",
        importacionId,
      },
    });
    const resultado = await cambiarEstado(caso.id, "Enviado a pago", usuarioId);
    expect(resultado.ok).toBe(true);

    const actualizado = await prisma.casoReembolso.findUnique({
      where: { id: caso.id },
    });
    expect(actualizado!.estadoActual).toBe("Enviado a pago");
    expect(actualizado!.fechaEnvioPago).not.toBeNull();
    expect(actualizado!.fechaPago).toBeNull();

    const historial = await prisma.historialEstado.findMany({
      where: { casoId: caso.id },
    });
    expect(historial).toHaveLength(1);
    expect(historial[0].estadoAnterior).toBe("Pendiente");
    expect(historial[0].estadoNuevo).toBe("Enviado a pago");
    expect(historial[0].usuarioId).toBe(usuarioId);
  });

  it("cambiar a Pagado completa fechaPago", async () => {
    const caso = await prisma.casoReembolso.create({
      data: {
        folio: "3",
        conceptoGasto: "X",
        datosImportados: {},
        estadoActual: "Enviado a pago",
        estudioAbogado: "Estudio Test",
        importacionId,
      },
    });

    const resultado = await cambiarEstado(caso.id, "Pagado", usuarioId);
    expect(resultado.ok).toBe(true);

    const actualizado = await prisma.casoReembolso.findUnique({
      where: { id: caso.id },
    });
    expect(actualizado!.estadoActual).toBe("Pagado");
    expect(actualizado!.fechaPago).not.toBeNull();
  });

  it("cambiar a Pendiente o Rechazado no toca las fechas", async () => {
    const caso = await prisma.casoReembolso.create({
      data: {
        folio: "4",
        conceptoGasto: "X",
        datosImportados: {},
        estadoActual: "Pendiente",
        estudioAbogado: "Estudio Test",
        importacionId,
      },
    });

    await cambiarEstado(caso.id, "Rechazado", usuarioId, "Duplicidad");

    const actualizado = await prisma.casoReembolso.findUnique({
      where: { id: caso.id },
    });
    expect(actualizado!.estadoActual).toBe("Rechazado");
    expect(actualizado!.fechaPago).toBeNull();
    expect(actualizado!.fechaEnvioPago).toBeNull();
  });

  it("rechaza el cambio a Rechazado sin motivo, sin tocar el caso", async () => {
    const caso = await prisma.casoReembolso.create({
      data: {
        folio: "5",
        conceptoGasto: "X",
        datosImportados: {},
        estadoActual: "Pendiente",
        estudioAbogado: "Estudio Test",
        importacionId,
      },
    });

    const resultado = await cambiarEstado(caso.id, "Rechazado", usuarioId);
    expect(resultado.ok).toBe(false);

    const sinCambios = await prisma.casoReembolso.findUnique({ where: { id: caso.id } });
    expect(sinCambios!.estadoActual).toBe("Pendiente");
  });

  it("rechaza el cambio a Rechazado con un motivo fuera de la lista", async () => {
    const caso = await prisma.casoReembolso.create({
      data: {
        folio: "6",
        conceptoGasto: "X",
        datosImportados: {},
        estadoActual: "Pendiente",
        estudioAbogado: "Estudio Test",
        importacionId,
      },
    });

    const resultado = await cambiarEstado(
      caso.id,
      "Rechazado",
      usuarioId,
      "Motivo inventado"
    );
    expect(resultado.ok).toBe(false);
  });

  it('rechaza el cambio a Rechazado con motivo "Otro" sin detalle', async () => {
    const caso = await prisma.casoReembolso.create({
      data: {
        folio: "7",
        conceptoGasto: "X",
        datosImportados: {},
        estadoActual: "Pendiente",
        estudioAbogado: "Estudio Test",
        importacionId,
      },
    });

    const resultado = await cambiarEstado(caso.id, "Rechazado", usuarioId, "Otro");
    expect(resultado.ok).toBe(false);
  });

  it('acepta el cambio a Rechazado con motivo "Otro" y detalle, guardando ambos campos', async () => {
    const caso = await prisma.casoReembolso.create({
      data: {
        folio: "8",
        conceptoGasto: "X",
        datosImportados: {},
        estadoActual: "Pendiente",
        estudioAbogado: "Estudio Test",
        importacionId,
      },
    });

    const resultado = await cambiarEstado(
      caso.id,
      "Rechazado",
      usuarioId,
      "Otro",
      "Firma ilegible en el documento"
    );
    expect(resultado.ok).toBe(true);

    const actualizado = await prisma.casoReembolso.findUnique({ where: { id: caso.id } });
    expect(actualizado!.motivoRechazo).toBe("Otro");
    expect(actualizado!.motivoRechazoDetalle).toBe("Firma ilegible en el documento");

    const historial = await prisma.historialEstado.findFirst({
      where: { casoId: caso.id },
      orderBy: { fecha: "desc" },
    });
    expect(historial!.motivoRechazo).toBe("Otro");
    expect(historial!.motivoRechazoDetalle).toBe("Firma ilegible en el documento");
  });

  it("cambiar a un estado distinto de Rechazado no exige ni toca el motivo", async () => {
    const caso = await prisma.casoReembolso.create({
      data: {
        folio: "9",
        conceptoGasto: "X",
        datosImportados: {},
        estadoActual: "Pendiente",
        estudioAbogado: "Estudio Test",
        importacionId,
      },
    });

    const resultado = await cambiarEstado(caso.id, "Enviado a pago", usuarioId);
    expect(resultado.ok).toBe(true);

    const actualizado = await prisma.casoReembolso.findUnique({ where: { id: caso.id } });
    expect(actualizado!.motivoRechazo).toBeNull();
    expect(actualizado!.motivoRechazoDetalle).toBeNull();
  });
});
