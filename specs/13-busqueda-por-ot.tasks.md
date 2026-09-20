# Tasks — Spec 13: Búsqueda por OT y limpieza del dashboard

## Task 13.0 — Quitar "Importaciones recientes" del dashboard ✅ completada
- `app/dashboard/page.tsx`: eliminar la sección y su `import`/llamada a `importacionesRecientes`.
- `lib/reporteria/metricas.ts`: eliminar `importacionesRecientes()` (sin otros usos en la app).
- `tests/reporteria/metricas.test.ts`: eliminar el test correspondiente.
- **Verificación:** `npm run build` + `npm test` sin referencias rotas.

## Task 13.1 — Resumen por OT (TDD) ✅ completada
- Extraer `extraerMonto(datosImportados)` (hoy duplicado en `lib/reporteria/porEstudio.ts`) a `lib/reporteria/monto.ts`, reutilizado desde ambos lados.
- `lib/exportacion/exportarCasos.ts`: `FiltrosExportacion` gana `folio?: string` (coincidencia exacta en `construirWhere`).
- `lib/reporteria/porOt.ts`: `resumenPorOt(folio)` — `{ folio, cantidadTotal, cantidadPagadas, montoTotal, montoPagado }`.
- **Tests primero:** con 3 casos de la misma OT (2 pagados, 1 pendiente) los totales son exactos; una OT sin casos retorna todo en 0, no error.

## Task 13.2 — Caja de búsqueda + resumen en `/casos` ✅ implementada (verificación manual pendiente hasta Task 13.3)
(Se integró la búsqueda por OT como campo dentro del mismo form de filtros existente, en vez de un form separado, para que se pueda combinar con los demás filtros en un solo submit.)
- `app/casos/page.tsx`: nuevo campo de búsqueda `ot` (form GET separado del de filtros), que al enviarse agrega `folio` a los filtros de `obtenerCasosParaExportar` y muestra la tarjeta de resumen (`resumenPorOt`) arriba de la tabla.
- **Verificación:** manual en navegador — buscar una OT real muestra el resumen y filtra la tabla correctamente.

## Task 13.3 — Verificación end-to-end ✅ completada
Confirmado por el usuario en producción: el dashboard ya no muestra "Importaciones recientes", y buscar una OT real en /casos muestra el resumen correcto y filtra la tabla.
- En producción: confirmar que el dashboard ya no muestra importaciones recientes, y que buscar una OT real trae el resumen y el listado correctos.

---
**Orden de ejecución:** 13.0 → 13.1 → 13.2 → 13.3.
