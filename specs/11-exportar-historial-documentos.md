# Spec 11 — Exportar historial y documentos adjuntos

## Objetivo
Ampliar la exportación (spec 07) para incluir el historial de estados de los casos exportados, y agregar una descarga en `.zip` de los documentos de respaldo asociados a los casos que cumplen los filtros actuales.

## Alcance
- **Historial en el Excel:** el archivo `.xlsx` generado por `generarExcelCasos` pasa a tener dos hojas:
  - `Casos`: igual que hoy (todos los campos importados + estado actual + fechas).
  - `Historial`: una fila por cada `HistorialEstado` de los casos incluidos en la exportación (respeta los mismos filtros), con columnas: OT, Concepto gasto, Fecha del cambio, Estado anterior, Estado nuevo, Usuario (email, o "Sistema" si `usuarioId` es `null` — ver corrección retroactiva de spec 04).
- **ZIP de documentos:** nuevo endpoint `/api/exportar/documentos` que genera un `.zip` con los documentos (`Documento`) matcheados a los casos que cumplen los filtros actuales (mismos query params que `/api/exportar`). Estructura interna: una carpeta por caso (`<OT>_<conceptoGasto>/`), con el archivo original dentro. Si un documento matchea a más de un caso (una boleta puede cubrir varias diligencias, ver decisión #1), aparece una vez por cada carpeta de caso correspondiente.
- Nuevo botón "Descargar documentos (ZIP)" junto al botón "Exportar a Excel" existente en `/casos`, respetando los mismos filtros aplicados.
- Sin documentos matcheados en el set filtrado: el ZIP se genera igual, vacío (no es un error).

## Fuera de alcance
- No se agrega un botón para exportar el historial de un solo caso por separado — ya existe la vista `/casos/[id]` para eso.
- No se incluyen documentos `SIN_MATCH` en el ZIP (solo los que están asociados a al menos un caso del set filtrado).
- No se comprime el Excel junto con el ZIP en un único archivo — son dos descargas separadas.
- No se cambia el modelo de filtros existente (spec 07, decisión #8) — el ZIP reutiliza exactamente los mismos filtros que ya soporta `/api/exportar`.

## Criterios de aceptación
- El Excel exportado (con o sin filtros) tiene la hoja `Historial` con las entradas correctas para los casos incluidos, y ninguna entrada de casos fuera del filtro.
- Descargar el ZIP sin filtros incluye todos los documentos matcheados a algún caso existente; con filtros, solo los de los casos que cumplen esos filtros.
- Un documento matcheado a 2 casos que ambos cumplen el filtro aparece en las 2 carpetas correspondientes dentro del ZIP.
- El ZIP generado abre correctamente y cada archivo dentro corresponde al documento correcto.

## Dependencias
- Spec 04 (`HistorialEstado`).
- Spec 05 (`Documento`, relación many-to-many con `CasoReembolso`, Vercel Blob).
- Spec 07 (filtros de exportación existentes, que se reutilizan tal cual).

## Notas
- No requiere TDD tan estricto como parseo/duplicados/matching, pero sí tests para la construcción de la hoja `Historial` (dado un set de casos con historial conocido, verificar filas exactas) y para el armado del ZIP (dado un set de documentos/casos, verificar la estructura de carpetas resultante) — mockeando la descarga de blobs reales.
- Requiere agregar una librería de compresión ZIP (`jszip`, sin dependencias nativas, funciona bien en el runtime de Vercel) — no hay ninguna en el proyecto todavía.
