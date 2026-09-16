/**
 * Clave de identidad de un caso de reembolso: OT + Concepto de gasto.
 * Una misma OT puede tener varias diligencias distintas (ej. notificación
 * de demanda vs. notificación de sentencia); solo cuando ambos campos
 * coinciden se considera el mismo caso (ver specs/03-deteccion-duplicados.md).
 */
export function claveIdentidad(folio: string, conceptoGasto: string): string {
  return `${folio.trim()}::${conceptoGasto.trim()}`;
}
