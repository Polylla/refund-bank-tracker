# Spec 02 — Ingesta de Excel/CSV

## Objetivo
Permitir cargar un archivo `.xlsx`/`.csv` con el listado de casos de reembolso y registrar automáticamente cada fila como un `CasoReembolso`.

## ⚠️ Bloqueante
Esta spec **no se puede cerrar del todo** hasta que el usuario comparta el archivo de ejemplo (decisión #7 en [00-decisiones.md](00-decisiones.md)). Hasta entonces se trabaja con columnas placeholder:
`folio` (único), `rut`, `nombreCliente`, `monto`, `fechaSolicitud`, `estadoInicial`.

## Alcance
- Endpoint/acción para subir un archivo `.xlsx` o `.csv`.
- Parseo del archivo (librería a definir en la task de implementación, ej. `xlsx`/`exceljs` para Excel, parser nativo o `papaparse` para CSV).
- Mapeo de columnas del archivo a los campos del modelo `CasoReembolso`.
- Validación de formato **antes** de insertar nada:
  - Columnas requeridas presentes (incluyendo `folio`).
  - Tipos de dato correctos por columna (fechas parseables, montos numéricos, folio no vacío).
  - Si el archivo no pasa validación, se rechaza completo con un reporte de errores por fila/columna (no se hace inserción parcial).
- Registro de cada fila válida como un `CasoReembolso` nuevo, asociado a un registro `ImportacionExcel` (fecha, usuario, cantidad de filas, cantidad de errores).
- La detección de duplicados (spec 03) se ejecuta como parte de este flujo, pero su lógica vive en su propia spec.
- Resumen post-importación visible al usuario: filas importadas, duplicados detectados, errores.

## Fuera de alcance
- Reimportación con folios ya existentes en el sistema → spec 03 (cola de revisión manual).
- Matching de documentos → spec 05.
- Cambios de estado posteriores a la creación → spec 04.

## Criterios de aceptación
- Subir un archivo válido crea un `CasoReembolso` por fila y un `ImportacionExcel` con los contadores correctos.
- Subir un archivo con una columna requerida faltante rechaza el archivo completo con un mensaje claro de qué columna falta.
- Subir un archivo con una fila con tipo de dato inválido (ej. monto no numérico) reporta esa fila específica sin insertar nada del archivo.
- Subir un archivo `.csv` y uno `.xlsx` equivalentes producen el mismo resultado.

## Dependencias
- Spec 01 (modelo de datos, storage no aplica aquí — el Excel no se guarda en Blob, solo se parsea).

## Notas de TDD (obligatorio — lógica crítica)
Escribir tests **antes** de implementar para:
- Parser de Excel/CSV: casos con columnas correctas, columnas faltantes, tipos inválidos, filas vacías, archivo vacío.
- Mapeo de columnas → modelo: normalización de nombres de columna (mayúsculas/minúsculas, espacios, tildes).
- Generación correcta del resumen (`cantidadFilas`, `cantidadErrores`) para distintos escenarios mixtos (algunas filas válidas, otras no).
