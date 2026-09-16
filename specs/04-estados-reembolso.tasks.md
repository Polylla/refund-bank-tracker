# Tasks — Spec 04: Estados del reembolso

## Task 4.0 — Migración + corrección retroactiva de estado inicial ✅ completada
(Los 15 casos reales se corrigieron con `scripts/corregir-estado-inicial.mjs`: todos pasaron de `Pendiente` a `Pagado`, con `fechaPago` backfilleada.)
- Prisma: agregar `CasoReembolso.fechaEnvioPago: DateTime?` y `CasoReembolso.fechaPago: DateTime?`.
- **Hallazgo real:** al revisar los datos, `Fecha pago` sí venía completada en varias filas del Excel real (no vacía como se asumió en spec 02), aunque `Estado reembolso` siempre viene vacío. Decisión del usuario: el estado inicial se infiere de las fechas (`Fecha pago` presente → `Pagado`; si no, `Fecha envío a pago` presente → `Enviado a pago`; si no, `Pendiente`), no queda fijo en `Pendiente`.
- `lib/estados/estados.ts`: lista cerrada de estados + `inferirEstadoInicial(fechaPago, fechaEnvioPago, estadoDelExcel)`.
- Actualizar `lib/importacion/procesar.ts` para usar `inferirEstadoInicial` y persistir `fechaPago`/`fechaEnvioPago` en el `CasoReembolso`.
- **Script de corrección** (una vez, sobre los 15 casos reales ya importados): backfillear `fechaPago`/`fechaEnvioPago` desde `datosImportados`, recalcular `estadoActual` con `inferirEstadoInicial`, y agregar una entrada en `HistorialEstado` documentando la corrección (`estadoAnterior: "Pendiente"`, `estadoNuevo: <inferido>`).
- **Verificación:** migración aplica sin pérdida de datos; los 15 casos reales quedan con el estado correcto (varios en `Pagado`).

## Task 4.1 — Función de cambio de estado (TDD) ✅ completada
- `lib/estados/cambiarEstado.ts`: `cambiarEstado(casoId, nuevoEstado, usuarioId)`.
- Valida que `nuevoEstado` esté en la lista cerrada (`Pendiente`, `Enviado a pago`, `Pagado`, `Rechazado`); rechaza cualquier otro valor.
- Actualiza `CasoReembolso.estadoActual`, completa `fechaEnvioPago`/`fechaPago` según corresponda (ver spec 04), y crea la entrada en `HistorialEstado` (`estadoAnterior`, `estadoNuevo`, `usuarioId`), todo en una transacción.
- **Tests primero (integración contra la base real, con cleanup):** transición válida crea historial correcto; transición a `Enviado a pago` completa `fechaEnvioPago`; transición a `Pagado` completa `fechaPago`; transición a `Pendiente`/`Rechazado` no toca esas fechas; estado inválido se rechaza sin tocar la base.

## Task 4.2 — Server Action + control de rol ✅ completada
- `app/casos/actions.ts`: `cambiarEstadoAction(casoId, nuevoEstado)`, requiere rol `importador` **o** `revisor` (agregar `requireAnyRole` en `lib/usuarios.ts`).
- **Verificación:** un usuario sin ninguno de los dos roles no puede ejecutar la acción.

## Task 4.3 — UI: listado de casos + cambio de estado + historial ✅ implementada (verificación manual pendiente, ver Task 4.4)
- Página `/casos` (protegida): lista todos los `CasoReembolso` con folio, concepto, monto, estado actual, y un selector para cambiar el estado inline.
- Página `/casos/[id]`: detalle del caso + línea de tiempo de su `HistorialEstado` en orden cronológico.
- **Verificación:** manual en navegador — cambiar el estado de un caso real y confirmar que se refleja en el listado y en el historial del detalle.

## Task 4.4 — Verificación end-to-end
- En producción: cambiar el estado de al menos un caso real a `Enviado a pago` y luego a `Pagado`, confirmar que las fechas se completan y el historial queda correcto.

---
**Orden de ejecución:** 4.0 → 4.1 → 4.2 → 4.3 → 4.4.
