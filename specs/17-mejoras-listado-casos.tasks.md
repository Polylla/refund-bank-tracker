# Tasks — Spec 17: Mejoras al listado de casos

## Task 17.0 — Filtro de búsqueda única + estadoIn (TDD) ✅ completada
- `lib/exportacion/exportarCasos.ts`: `FiltrosExportacion` gana `busqueda?: string` (OR entre `folio contains`, `estudioAbogado contains`, y `datosImportados` `string_contains` en `["Nombre cliente", "RUT", "Nombre receptor", "Tribunal"]`) y `estadoIn?: string[]` (alternativa a `estado` para filtrar por una lista, usado por "Pagos pendientes").
- **Tests primero:** buscar por un texto que solo aparece en RUT encuentra el caso; buscar por parte del nombre del cliente también; `estadoIn` filtra correctamente por múltiples estados a la vez.

## Task 17.1 — Paginación + total (TDD)
- `lib/exportacion/exportarCasos.ts`: `obtenerCasosPaginados(filtros, pagina, porPagina)` → `{ casos, total }` (usa `construirWhere` + `skip`/`take` + `count` en paralelo).
- `lib/reporteria/monto.ts` o `exportarCasos.ts`: `calcularMontoTotal(filtros)` — suma `extraerMonto` de TODOS los casos que cumplen el filtro (sin paginar).
- **Tests primero:** con un set de casos de prueba, `obtenerCasosPaginados` retorna la página correcta y el `total` real (no el de la página); `calcularMontoTotal` suma todos los filtrados, no solo los de una página.

## Task 17.2 — Componente de tabla compartido
- Extraer la tabla de `/casos` (incluyendo `EstadoSelector`, `MarcarDuplicadoRevisado`, link a detalle) a `app/casos/CasosTable.tsx`, reutilizable desde `/casos` y la nueva `/casos/pagos-pendientes`.
- **Verificación:** `/casos` se sigue viendo y comportando igual que antes de extraer el componente.

## Task 17.3 — UI: buscador único, total y paginación en `/casos`
- Reemplazar los campos "Campo"/"Valor contiene" por un único input de búsqueda.
- Fila de total al pie de la tabla (`CasosTable` o el contenedor de la página).
- Controles de paginación (anterior/siguiente, "X–Y de Z"), parámetro `pagina` en la URL, preservando el resto de los filtros.
- **Verificación:** manual en navegador.

## Task 17.4 — Página `/casos/pagos-pendientes`
- Mismo comportamiento que `/casos` (buscador, filtros de fecha, paginación, total) pero con `estadoIn: ["Pendiente", "Enviado a pago"]` fijo (sin selector de estado, ya que está implícito).
- Enlace "Pagos pendientes" en `NavLinks`.
- **Verificación:** manual — nunca aparecen casos Pagados ni Rechazados.

## Task 17.5 — Verificación end-to-end
- En producción: probar el buscador único con distintos campos, confirmar que el total y la paginación son correctos, y que "Pagos pendientes" excluye los casos que corresponde.

---
**Orden de ejecución:** 17.0 → 17.1 → 17.2 → 17.3 → 17.4 → 17.5.
