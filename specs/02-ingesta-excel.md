# Spec 02 — Ingesta de Excel/CSV

## Objetivo
Permitir cargar un archivo `.xlsx`/`.csv` con el listado de casos de reembolso y registrar automáticamente cada fila como un `CasoReembolso`.

## Columnas reales (confirmado con archivo de ejemplo)
Archivo de referencia: `GASTOS RECEPTORES FRAUDE JUNIO 2026.xlsx` — una sola hoja, nombrada según el mes (ej. `JUNIO`). El parser debe leer **la primera hoja del archivo**, sin depender de su nombre (el nombre cambia cada mes).

| Columna en Excel | Campo interno | Tipo | Obligatoria al importar |
|---|---|---|---|
| `OT` | `folio` | número (tratado como string) | Sí — es el identificador único de caso (ver decisión #2) |
| `Nombre cliente` | `nombreCliente` | texto | Sí |
| `RUT` | `rut` | texto (formato `XX.XXX.XXX-X`) | Sí |
| `Tribunal` | `tribunal` | texto | Sí |
| `N° de Rol` | `numeroRol` | número | Sí |
| `Año Rol` | `anoRol` | número (año) | Sí |
| `Nombre receptor` | `nombreReceptor` | texto | Sí |
| `Conceptos gasto de receptor` | `conceptoGasto` | texto | Sí |
| `Costo de diligencia` | `monto` | número (CLP, sin decimales) | Sí |
| `Fecha pago` | `fechaPago` | fecha | No — viene vacía al importar, se llena durante el ciclo de vida del caso |
| `Estudio/Abogado` | `estudioAbogado` | texto | Sí |
| `Fecha envío a pago` | `fechaEnvioPago` | fecha | No — igual que `fechaPago` |
| `Estado reembolso` | `estadoInicial` | texto | No — viene vacía; si está vacía, el estado inicial del caso es `Pendiente` |

Estos 13 campos se guardan en `CasoReembolso.datosImportados` (JSON) tal como vienen del Excel, más el mapeo normalizado de arriba para los que sí son campos de primera clase del modelo (`folio`, `estadoActual`, fechas usadas en reportería).

### Fila de totales
El archivo de ejemplo trae una fila final tipo resumen (`Conceptos gasto de receptor: "TOTAL"`, `Costo de diligencia: <suma>`, el resto de columnas vacías). **Regla de filtrado:** cualquier fila con `OT` vacío se descarta silenciosamente antes de validar (no cuenta como error ni como caso). Esto cubre la fila de totales y cualquier fila en blanco intermedia.

## Decisiones confirmadas sobre estas columnas
- `Tribunal`, `N° de Rol`, `Año Rol`, `Nombre receptor`, `Conceptos gasto de receptor` y `Estudio/Abogado` son **siempre obligatorios**; si falta alguno, la fila se rechaza como error de validación.
- `RUT` se guarda como texto tal cual viene del Excel, **sin validar** formato ni dígito verificador (MVP).
- `OT` siempre es **numérico**; se valida como tal al importar.

## Alcance
- Endpoint/acción para subir un archivo `.xlsx` o `.csv`.
- Parseo del archivo (librería a definir en la task de implementación, ej. `xlsx`/`exceljs` para Excel, parser nativo o `papaparse` para CSV). Debe leer la primera hoja sin importar su nombre.
- Mapeo de columnas del archivo a los campos internos de la tabla de arriba. Normalización de nombres de columna para tolerar variaciones menores (espacios extra, mayúsculas/minúsculas, tildes — el archivo de ejemplo ya trae acentos y símbolos como `N°`).
- Descartar filas sin `OT` (fila de totales / filas en blanco) antes de validar.
- Validación de formato **antes** de insertar nada:
  - Las columnas obligatorias de la tabla de arriba deben estar presentes y con valor.
  - Tipos de dato correctos por columna (fechas parseables cuando no están vacías, `Costo de diligencia` numérico, `OT` no vacío).
  - Si el archivo no pasa validación, se rechaza completo con un reporte de errores por fila/columna (no se hace inserción parcial).
- Registro de cada fila válida como un `CasoReembolso` nuevo (`folio` = `OT`, `estadoActual` = `Estado reembolso` si viene, si no `"Pendiente"`), asociado a un registro `ImportacionExcel` (fecha, usuario, cantidad de filas, cantidad de errores).
- La detección de duplicados (spec 03) se ejecuta como parte de este flujo, pero su lógica vive en su propia spec.
- Resumen post-importación visible al usuario: filas importadas, duplicados detectados, errores, filas de totales/en blanco descartadas.

## Fuera de alcance
- Reimportación con folios ya existentes en el sistema → spec 03 (cola de revisión manual).
- Matching de documentos → spec 05.
- Cambios de estado posteriores a la creación → spec 04.

## Criterios de aceptación
- Subir el archivo de ejemplo real (`GASTOS RECEPTORES FRAUDE JUNIO 2026.xlsx`) crea 15 `CasoReembolso` (no 16 — la fila de totales se descarta) y un `ImportacionExcel` con los contadores correctos.
- Subir un archivo con una columna obligatoria faltante rechaza el archivo completo con un mensaje claro de qué columna falta.
- Subir un archivo con una fila con tipo de dato inválido (ej. `Costo de diligencia` no numérico) reporta esa fila específica sin insertar nada del archivo.
- Subir un archivo `.csv` y uno `.xlsx` equivalentes producen el mismo resultado.
- Una fila sin `OT` (como la fila de totales) no genera error ni se cuenta como caso importado.

## Dependencias
- Spec 01 (modelo de datos, storage no aplica aquí — el Excel no se guarda en Blob, solo se parsea).

## Notas de TDD (obligatorio — lógica crítica)
- El fixture de test se construye **anonimizado** a partir de la estructura real (mismas columnas, mismo tipo de fila de totales), con nombres/RUTs/OT ficticios — el archivo original con datos reales de clientes no se sube al repositorio.

Escribir tests **antes** de implementar para:
- Parser de Excel/CSV usando el fixture anonimizado: columnas correctas, columnas faltantes, tipos inválidos, fila de totales descartada, filas vacías, archivo vacío.
- Mapeo de columnas → modelo: normalización de nombres de columna (mayúsculas/minúsculas, espacios, tildes, símbolos como `N°`).
- Generación correcta del resumen (`cantidadFilas`, `cantidadErrores`) para distintos escenarios mixtos (algunas filas válidas, otras no, más la fila de totales).
