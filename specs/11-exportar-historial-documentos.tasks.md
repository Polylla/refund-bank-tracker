# Tasks — Spec 11: Exportar historial y documentos adjuntos

## Task 11.0 — Hoja "Historial" en el Excel (TDD) ✅ completada
- `lib/exportacion/exportarCasos.ts`: nueva función `obtenerHistorialParaExportar(filtros)` (mismo `construirWhere` ya existente, pero trayendo `HistorialEstado` de esos casos vía `include`, con `usuario` para el email).
- `generarExcelCasos` agrega la hoja `Historial` con columnas: OT, Concepto gasto, Fecha, Estado anterior, Estado nuevo, Usuario (email o "Sistema" si `usuarioId` es `null`).
- **Tests primero:** con un set de casos conocido (algunos con varios cambios de estado, uno con una entrada de corrección `usuarioId: null`), la hoja `Historial` tiene exactamente las filas esperadas; aplicar un filtro (ej. estado) excluye el historial de los casos que no cumplen el filtro.

## Task 11.1 — Armado del ZIP de documentos (TDD) ✅ completada
- Agregar dependencia `jszip`.
- `lib/exportacion/exportarDocumentos.ts`: `generarZipDocumentos(filtros): Promise<Buffer>` — obtiene los casos que cumplen los filtros (reutiliza `obtenerCasosParaExportar`), sus documentos asociados (`include: { documentos: true }` o el nombre real de la relación inversa en `CasoReembolso`), descarga cada blob (`@vercel/blob` `get`) y arma el zip con una carpeta por caso.
- **Tests primero (mockeando `@vercel/blob`):** un caso con 1 documento genera 1 carpeta con 1 archivo; un documento matcheado a 2 casos filtrados aparece en las 2 carpetas; un caso sin documentos no genera carpeta; sin casos filtrados, el zip resultante está vacío pero es válido.

## Task 11.2 — Endpoint `/api/exportar/documentos` + botón en `/casos`
- `app/api/exportar/documentos/route.ts` (GET, protegido por auth como `/api/exportar`): mismos query params, llama a `generarZipDocumentos`, retorna `Content-Type: application/zip`.
- Botón "Descargar documentos (ZIP)" en `app/casos/page.tsx`, junto al de "Exportar a Excel", con la misma `queryString` de filtros.
- **Verificación:** manual en navegador — descargar el ZIP con y sin filtros, confirmar que abre y contiene los documentos esperados.

## Task 11.3 — Verificación end-to-end
- En producción: exportar el Excel y confirmar la hoja `Historial`; descargar el ZIP de documentos con y sin filtros y confirmar el contenido.

---
**Orden de ejecución:** 11.0 → 11.1 → 11.2 → 11.3.
