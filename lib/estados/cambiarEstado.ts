import { prisma } from "@/lib/prisma";
import { esEstadoValido, esMotivoRechazoValido } from "./estados";

export interface ResultadoCambioEstado {
  ok: boolean;
  mensaje?: string;
}

export async function cambiarEstado(
  casoId: string,
  nuevoEstado: string,
  usuarioId: string,
  motivoRechazo?: string,
  motivoRechazoDetalle?: string
): Promise<ResultadoCambioEstado> {
  if (!esEstadoValido(nuevoEstado)) {
    return { ok: false, mensaje: `Estado inválido: ${nuevoEstado}` };
  }

  if (nuevoEstado === "Rechazado") {
    if (!motivoRechazo || !esMotivoRechazoValido(motivoRechazo)) {
      return { ok: false, mensaje: "Debes elegir un motivo de rechazo válido" };
    }
    if (motivoRechazo === "Otro" && !motivoRechazoDetalle?.trim()) {
      return { ok: false, mensaje: 'Debes especificar el detalle del motivo "Otro"' };
    }
  }

  const caso = await prisma.casoReembolso.findUnique({ where: { id: casoId } });
  if (!caso) return { ok: false, mensaje: "Caso no encontrado" };

  const ahora = new Date();
  const fechaEnvioPago =
    nuevoEstado === "Enviado a pago" ? ahora : caso.fechaEnvioPago;
  const fechaPago = nuevoEstado === "Pagado" ? ahora : caso.fechaPago;
  const motivoRechazoFinal =
    nuevoEstado === "Rechazado" ? motivoRechazo : caso.motivoRechazo;
  const motivoRechazoDetalleFinal =
    nuevoEstado === "Rechazado" ? motivoRechazoDetalle ?? null : caso.motivoRechazoDetalle;

  await prisma.$transaction(async (tx) => {
    await tx.casoReembolso.update({
      where: { id: casoId },
      data: {
        estadoActual: nuevoEstado,
        fechaEnvioPago,
        fechaPago,
        motivoRechazo: motivoRechazoFinal,
        motivoRechazoDetalle: motivoRechazoDetalleFinal,
      },
    });

    await tx.historialEstado.create({
      data: {
        casoId,
        estadoAnterior: caso.estadoActual,
        estadoNuevo: nuevoEstado,
        usuarioId,
        motivoRechazo: nuevoEstado === "Rechazado" ? motivoRechazo : null,
        motivoRechazoDetalle:
          nuevoEstado === "Rechazado" ? motivoRechazoDetalle ?? null : null,
      },
    });
  });

  return { ok: true };
}
