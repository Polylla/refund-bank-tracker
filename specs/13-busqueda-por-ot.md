# Spec 13 — Búsqueda por OT y limpieza del dashboard

## Objetivo
Quitar la sección "Importaciones recientes" del dashboard (ya no aporta valor al día a día) y agregar una forma de buscar todas las diligencias asociadas a una OT específica, con un resumen de cuántas están pagadas.

## Alcance
- **Dashboard:** se elimina la sección "Importaciones recientes" de `/dashboard`. Como queda sin ningún otro uso en la app, se elimina también `importacionesRecientes()` de `lib/reporteria/metricas.ts` (código muerto).
- **Búsqueda por OT:** caja de búsqueda arriba del listado de `/casos` (además del filtro genérico ya existente). Al buscar una OT:
  - Se muestra un resumen: cantidad total de diligencias de esa OT, cuántas están en estado `Pagado`, monto total y monto pagado.
  - El listado de casos debajo queda filtrado a exactamente esa OT (coincidencia exacta de `folio`, no "contiene" como el filtro genérico), reutilizando la tabla ya existente (que ya muestra concepto, monto y estado por fila — cubre "ver los gastos asociados a esa OT" sin necesidad de una vista nueva).
- `FiltrosExportacion` (spec 07) gana un campo opcional `folio` (coincidencia exacta), reutilizable también para exportar a Excel/ZIP acotado a una OT si se combina con el link.

## Fuera de alcance
- No se agrega una página separada dedicada solo a esto — vive dentro de `/casos`, como pidió el usuario.
- No se muestra si cada diligencia tiene documento de respaldo cargado (el usuario no lo pidió en esta ronda).
- No se cambia el filtro genérico por campo importado (`campo`/`valor`) existente — la búsqueda por OT es un mecanismo aparte, de coincidencia exacta.

## Criterios de aceptación
- El dashboard ya no muestra "Importaciones recientes".
- Buscar una OT existente muestra el resumen correcto (cantidad total, cantidad pagada, montos) y el listado de abajo muestra solo las diligencias de esa OT.
- Buscar una OT que no existe muestra un resumen en cero, sin error.
- El filtro por OT se puede combinar con los filtros existentes (estado, fechas) si el usuario los usa juntos.

## Dependencias
- Spec 06 (dashboard/reportería existente), Spec 07 (filtros de exportación reutilizados).

## Notas
- Tests para `resumenPorOt` (dado un set de casos de prueba con la misma OT y estados mixtos, verificar cantidad total/pagada y montos exactos).
