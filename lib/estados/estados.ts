export const ESTADOS = [
  "Pendiente",
  "Enviado a pago",
  "Pagado",
  "Rechazado",
] as const;

export type Estado = (typeof ESTADOS)[number];

export function esEstadoValido(valor: string): valor is Estado {
  return (ESTADOS as readonly string[]).includes(valor);
}

export const MOTIVOS_RECHAZO = [
  "Duplicidad",
  "Sin documento",
  "Fuera de plazo",
  "Otro",
] as const;

export type MotivoRechazo = (typeof MOTIVOS_RECHAZO)[number];

export function esMotivoRechazoValido(valor: string): valor is MotivoRechazo {
  return (MOTIVOS_RECHAZO as readonly string[]).includes(valor);
}

/**
 * Estado inicial de un caso al importarse. En la práctica "Estado
 * reembolso" del Excel siempre viene vacío, pero "Fecha pago" /
 * "Fecha envío a pago" a veces ya vienen completadas — el estado se
 * infiere de esas fechas antes de caer en "Pendiente".
 * Ver specs/04-estados-reembolso.md.
 */
export function inferirEstadoInicial(
  fechaPago: Date | null,
  fechaEnvioPago: Date | null,
  estadoDelExcel: string | null
): Estado {
  if (fechaPago) return "Pagado";
  if (fechaEnvioPago) return "Enviado a pago";
  if (estadoDelExcel && esEstadoValido(estadoDelExcel)) return estadoDelExcel;
  return "Pendiente";
}
