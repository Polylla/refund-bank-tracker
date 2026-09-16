import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export interface ResultadoAccionRevision {
  ok: boolean;
  mensaje?: string;
}

export async function aprobarFila(
  filaId: string,
  usuarioId: string
): Promise<ResultadoAccionRevision> {
  const fila = await prisma.filaEnRevision.findUnique({ where: { id: filaId } });
  if (!fila) return { ok: false, mensaje: "Fila no encontrada" };
  if (fila.estado !== "PENDIENTE") {
    return { ok: false, mensaje: "Esta fila ya fue revisada" };
  }

  const caso = await prisma.casoReembolso.findUnique({
    where: { id: fila.casoExistenteId },
  });
  if (!caso) return { ok: false, mensaje: "El caso asociado ya no existe" };

  await prisma.$transaction(async (tx) => {
    await tx.casoReembolso.update({
      where: { id: fila.casoExistenteId },
      data: {
        datosImportados: fila.datosNuevos as Prisma.InputJsonValue,
      },
    });

    await tx.historialEstado.create({
      data: {
        casoId: fila.casoExistenteId,
        estadoAnterior: caso.estadoActual,
        estadoNuevo: caso.estadoActual,
        usuarioId,
      },
    });

    await tx.filaEnRevision.update({
      where: { id: filaId },
      data: {
        estado: "APROBADA",
        revisadoPorId: usuarioId,
        fechaRevision: new Date(),
      },
    });
  });

  return { ok: true };
}

export async function descartarFila(
  filaId: string,
  usuarioId: string
): Promise<ResultadoAccionRevision> {
  const fila = await prisma.filaEnRevision.findUnique({ where: { id: filaId } });
  if (!fila) return { ok: false, mensaje: "Fila no encontrada" };
  if (fila.estado !== "PENDIENTE") {
    return { ok: false, mensaje: "Esta fila ya fue revisada" };
  }

  await prisma.filaEnRevision.update({
    where: { id: filaId },
    data: {
      estado: "DESCARTADA",
      revisadoPorId: usuarioId,
      fechaRevision: new Date(),
    },
  });

  return { ok: true };
}
