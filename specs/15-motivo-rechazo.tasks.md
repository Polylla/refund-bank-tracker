# Tasks — Spec 15: Motivo de rechazo

## Task 15.0 — Modelo: motivoRechazo + motivoRechazoDetalle ✅ completada
- Prisma: `CasoReembolso.motivoRechazo: String?`, `CasoReembolso.motivoRechazoDetalle: String?`, y los mismos dos campos en `HistorialEstado`.
- `lib/estados/estados.ts`: `MOTIVOS_RECHAZO = ["Duplicidad", "Sin documento", "Fuera de plazo", "Otro"] as const` + `esMotivoRechazoValido`.
- **Verificación:** migración aplica sin pérdida de datos (todos los casos existentes quedan con estos campos en `null`, no rompe nada ya que solo importan cuando el estado es `Rechazado`).

## Task 15.1 — Validación en `cambiarEstado` (TDD)
- `cambiarEstado(casoId, nuevoEstado, usuarioId, motivoRechazo?, motivoRechazoDetalle?)`: si `nuevoEstado === "Rechazado"`, exige `motivoRechazo` válido (y `motivoRechazoDetalle` no vacío si es `"Otro"`); si no se cumple, retorna error sin tocar nada. Completa ambos campos en `CasoReembolso` y en la nueva entrada de `HistorialEstado`. Para cualquier otro estado, no los toca (igual que `fechaPago`/`fechaEnvioPago`, spec 04).
- **Tests primero:** rechazar sin motivo falla; rechazar con motivo fuera de la lista falla; rechazar con `"Otro"` sin detalle falla; rechazar con motivo válido completa ambos campos correctamente; cambiar a cualquier otro estado no exige ni toca estos campos.

## Task 15.2 — UI: selector de motivo en `EstadoSelector`
- Al elegir "Rechazado", aparece un segundo `<select>` con `MOTIVOS_RECHAZO` (+ un `<input>` de texto si se elige "Otro") y un botón "Confirmar rechazo" en vez de aplicar el cambio de inmediato; "Cancelar" vuelve al estado anterior sin llamar a la acción.
- `cambiarEstadoAction` pasa los nuevos parámetros a `cambiarEstado`.
- **Verificación:** manual en navegador — rechazar un caso sin elegir motivo no deja avanzar; con motivo válido, se aplica y aparece el toast de confirmación (spec de UI reciente).

## Task 15.3 — Mostrar motivo en `/casos/[id]`
- Se muestra el motivo de rechazo actual (si `estadoActual === "Rechazado"`) en la ficha del caso, y el motivo de cada transición a "Rechazado" en la línea de tiempo de historial.
- **Verificación:** manual en navegador.

## Task 15.4 — Verificación end-to-end
- En producción: rechazar un caso real de prueba con cada uno de los 4 motivos (incluyendo "Otro" con texto) y confirmar que queda registrado correctamente en el caso y en el historial.

---
**Orden de ejecución:** 15.0 → 15.1 → 15.2 → 15.3 → 15.4.
