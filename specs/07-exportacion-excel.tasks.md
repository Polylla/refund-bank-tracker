# Tasks — Spec 07: Exportación a Excel

## Diseño de filtros (interpretación concreta de la decisión #8)
- **Estado actual**: dropdown con los 4 estados cerrados.
- **Rango de fecha de creación**: desde / hasta.
- **Campo importado arbitrario**: dropdown con los nombres canónicos de columna (los mismos de `lib/importacion/columns.ts`) + un valor de texto a buscar (contiene, no exacto) dentro de `datosImportados` (JSON) usando filtrado nativo de Postgres/Prisma (`path` + `string_contains`). Cubre "cualquier campo importado" sin necesitar una columna dedicada por campo.
- Los filtros se reflejan como query params en `/casos` (`?estado=&desde=&hasta=&campo=&valor=`), y el link de exportación reutiliza los mismos params.

## Task 7.1 — Generación del Excel a partir de filtros (TDD) ✅ completada
- `lib/exportacion/exportarCasos.ts`: `obtenerCasosParaExportar(filtros)` (query Prisma) y `generarExcelCasos(filtros)` (arma el `.xlsx` con `exceljs`, columnas = todas las de `datosImportados` + estado actual + fecha creación + fecha última actualización).
- **Tests primero (integración contra la base real, con cleanup):** sin filtros exporta todos los casos de prueba; filtro por estado; filtro por rango de fechas; filtro por campo arbitrario (ej. RUT); el `.xlsx` generado se puede re-leer con `exceljs` y contiene las filas/columnas esperadas.

## Task 7.2 — Route Handler + filtros en `/casos` ✅ implementada (verificación manual pendiente, ver Task 7.3)
- `/api/exportar` (GET, protegido): lee los mismos query params que la vista, llama a `generarExcelCasos`, responde con `Content-Type` de xlsx y `Content-Disposition: attachment`.
- `/casos` agrega un formulario de filtros (estado, rango de fechas, campo+valor) vía query params (GET, sin JS) y un link "Exportar a Excel" que reutiliza los filtros activos.
- **Verificación:** manual en navegador — filtrar por estado "Pagado" y exportar, confirmar que el Excel descargado solo trae esos casos.

## Task 7.3 — Verificación end-to-end
- En producción: exportar sin filtros (63 casos), exportar filtrando por un campo arbitrario (ej. RUT de un cliente conocido), confirmar que el archivo abre bien en Excel/Sheets.

---
**Orden de ejecución:** 7.1 → 7.2 → 7.3.
