# Tasks — Spec 04: Estados del reembolso

## Task 4.0 — Migración: fechaPago/fechaEnvioPago como columnas de primera clase
- Prisma: agregar `CasoReembolso.fechaEnvioPago: DateTime?` y `CasoReembolso.fechaPago: DateTime?`.
- Backfill desde `datosImportados` para los 15 casos reales existentes (probablemente ambas quedan `null`, ya que en el Excel real llegaron vacías — verificar).
- **Verificación:** migración aplica sin pérdida de datos.

## Task 4.1 — Función de cambio de estado (TDD)
- `lib/estados/cambiarEstado.ts`: `cambiarEstado(casoId, nuevoEstado, usuarioId)`.
- Valida que `nuevoEstado` esté en la lista cerrada (`Pendiente`, `Enviado a pago`, `Pagado`, `Rechazado`); rechaza cualquier otro valor.
- Actualiza `CasoReembolso.estadoActual`, completa `fechaEnvioPago`/`fechaPago` según corresponda (ver spec 04), y crea la entrada en `HistorialEstado` (`estadoAnterior`, `estadoNuevo`, `usuarioId`), todo en una transacción.
- **Tests primero (integración contra la base real, con cleanup):** transición válida crea historial correcto; transición a `Enviado a pago` completa `fechaEnvioPago`; transición a `Pagado` completa `fechaPago`; transición a `Pendiente`/`Rechazado` no toca esas fechas; estado inválido se rechaza sin tocar la base.

## Task 4.2 — Server Action + control de rol
- `app/casos/actions.ts`: `cambiarEstadoAction(casoId, nuevoEstado)`, requiere rol `importador` **o** `revisor` (agregar `requireAnyRole` en `lib/usuarios.ts`).
- **Verificación:** un usuario sin ninguno de los dos roles no puede ejecutar la acción.

## Task 4.3 — UI: listado de casos + cambio de estado + historial
- Página `/casos` (protegida): lista todos los `CasoReembolso` con folio, concepto, monto, estado actual, y un selector para cambiar el estado inline.
- Página `/casos/[id]`: detalle del caso + línea de tiempo de su `HistorialEstado` en orden cronológico.
- **Verificación:** manual en navegador — cambiar el estado de un caso real y confirmar que se refleja en el listado y en el historial del detalle.

## Task 4.4 — Verificación end-to-end
- En producción: cambiar el estado de al menos un caso real a `Enviado a pago` y luego a `Pagado`, confirmar que las fechas se completan y el historial queda correcto.

---
**Orden de ejecución:** 4.0 → 4.1 → 4.2 → 4.3 → 4.4.
