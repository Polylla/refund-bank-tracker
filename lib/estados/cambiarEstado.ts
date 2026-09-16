import { prisma } from "@/lib/prisma";
import { esEstadoValido } from "./estados";

export interface ResultadoCambioEstado {
  ok: boolean;
  mensaje?: string;
}

export async function cambiarEstado(
  casoId: string,
  nuevoEstado: string,
  usuarioId: string
): Promise<ResultadoCambioEstado> {
  if (!esEstadoValido(nuevoEstado)) {
    return { ok: false, mensaje: `Estado inválido: ${nuevoEstado}` };
  }

  const caso = await prisma.casoReembolso.findUnique({ where: { id: casoId } });
  if (!caso) return { ok: false, mensaje: "Caso no encontrado" };

  const ahora = new Date();
  const fechaEnvioPago =
    nuevoEstado === "Enviado a pago" ? ahora : caso.fechaEnvioPago;
  const fechaPago = nuevoEstado === "Pagado" ? ahora : caso.fechaPago;

  await prisma.$transaction(async (tx) => {
    await tx.casoReembolso.update({
      where: { id: casoId },
      data: {
        estadoActual: nuevoEstado,
        fechaEnvioPago,
        fechaPago,
      },
    });

    await tx.historialEstado.create({
      data: {
        casoId,
        estadoAnterior: caso.estadoActual,
        estadoNuevo: nuevoEstado,
        usuarioId,
      },
    });
  });

  return { ok: true };
}
