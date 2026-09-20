# Spec 15 — Motivo de rechazo

## Objetivo
Registrar por qué se rechazó un caso, con una lista cerrada de motivos (+ "Otro" con texto libre), obligatoria al cambiar el estado a `Rechazado`.

## Alcance
- Lista cerrada de motivos: `Duplicidad`, `Sin documento`, `Fuera de plazo`, `Otro` (este último requiere un texto libre adicional).
- `CasoReembolso` gana `motivoRechazo: String?` y `motivoRechazoDetalle: String?` (solo relevante cuando `motivoRechazo` es `"Otro"`), completados automáticamente al cambiar el estado a `Rechazado` — mismo patrón que `fechaEnvioPago`/`fechaPago` (spec 04): no se limpian si el caso luego cambia a otro estado, quedan como el último motivo registrado.
- `HistorialEstado` gana los mismos dos campos, para que cada transición a `Rechazado` (si un caso se rechaza más de una vez en su vida) quede con su propio motivo en el historial, no solo el último.
- `cambiarEstado(casoId, nuevoEstado, usuarioId, motivoRechazo?, motivoRechazoDetalle?)`: si `nuevoEstado === "Rechazado"`, exige `motivoRechazo` de la lista cerrada (y `motivoRechazoDetalle` no vacío si es `"Otro"`); si no se cumple, rechaza el cambio sin tocar nada. Para cualquier otro estado, estos parámetros se ignoran.
- UI: `EstadoSelector` — al elegir "Rechazado" en el selector, aparece un segundo selector con la lista de motivos (+ campo de texto si se elige "Otro") y un botón de confirmar, en vez de aplicar el cambio de inmediato como con los demás estados.
- `/casos/[id]`: se muestra el motivo de rechazo actual (si el caso está rechazado) y, en la línea de tiempo de historial, el motivo de cada transición a "Rechazado".

## Fuera de alcance
- No se agrega el motivo como columna en el listado `/casos` (queda en el detalle del caso, igual que fechaPago/fechaEnvioPago).
- No se agrega un reporte agregado "casos rechazados por motivo" en esta spec (podría ser una spec futura si hace falta).
- No se permite editar el motivo de una transición ya ocurrida — se corrige rechazando de nuevo (transiciones libres, spec 04) si es necesario.

## Criterios de aceptación
- Cambiar el estado a `Rechazado` sin motivo (o con uno fuera de la lista) se rechaza, sin modificar el caso.
- Cambiar el estado a `Rechazado` con motivo `"Otro"` sin `motivoRechazoDetalle` se rechaza.
- Cambiar el estado a `Rechazado` con un motivo válido completa `motivoRechazo`/`motivoRechazoDetalle` en el caso y en la nueva entrada de `HistorialEstado`.
- Cambiar a cualquier otro estado no exige ni toca estos campos.
- El detalle del caso muestra el motivo actual y el historial muestra el motivo de cada rechazo pasado.

## Dependencias
- Spec 04 (`cambiarEstado`, `HistorialEstado`, transiciones libres).

## Notas
- Tests para `cambiarEstado`: rechazo sin motivo, rechazo con motivo inválido, rechazo con "Otro" sin detalle, rechazo válido (cada combinación), y que otros estados no exigen motivo.
