# Spec 02 — Ingesta de Excel/CSV

## Objetivo
Permitir cargar un archivo `.xlsx`/`.csv` con el listado de casos de reembolso y registrar automáticamente cada fila como un `CasoReembolso`.

## Columnas reales (confirmado con dos archivos de ejemplo reales)
Archivos de referencia: `GASTOS RECEPTORES FRAUDE JUNIO 2026.xlsx` (formato original) y `Rendición receptores BECH - PLANILLA FRAUDES JUNIO.xlsx` (formato nuevo, con columnas adicionales). El parser debe leer **la primera hoja del archivo**, sin depender de su nombre (cambia entre archivos — a veces el mes, a veces una fecha).

**El nombre de columna no es 100% estable entre archivos** (el formato evolucionó). El parser matchea por **alias**: cada campo interno acepta una o más variantes de nombre de columna (normalizadas por tildes/mayúsculas/espacios/símbolos).

| Columna(s) en Excel (alias) | Campo interno | Tipo | Obligatoria al importar |
|---|---|---|---|
| `OT` | `folio` | número (tratado como string) | Sí — ⚠️ no es único por sí solo; la identidad real del caso es `OT` + concepto de gasto (ver decisión #2 revisada) |
| `Nombre cliente` | `nombreCliente` | texto | Sí |
| `RUT` | `rut` | texto (formato `XX.XXX.XXX-X`) | Sí |
| `Tribunal` | `tribunal` | texto | Sí |
| `N° de Rol` | `numeroRol` | número | Sí |
| `Año Rol` | `anoRol` | número (año) | Sí |
| `Nombre receptor` | `nombreReceptor` | texto | Sí |
| `Conceptos gasto de receptor` **o** `Concepto gasto de receptor` | `conceptoGasto` | texto | Sí |
| `Costo de diligencia` | `monto` | número (CLP, sin decimales) | Sí |
| `N° BOLETA` *(nueva)* | `nBoleta` | número (tratado como string) | No — no toda diligencia tiene boleta rendida todavía. Usada para matching de documentos (spec 05) |
| `Fecha pago` **o** `Fecha pago diligencia receptor` | `fechaPago` | fecha | No — a veces viene completada desde el Excel (ver spec 04, inferencia de estado inicial) |
| `Estudio/Abogado` | `estudioAbogado` | texto | Sí |
| `Fecha envío a pago` | `fechaEnvioPago` | fecha | No |
| `Estado reembolso` | `estadoInicial` | texto | No — en la práctica siempre viene vacía |

Todos los campos (con su nombre de columna **canónico**, el primer alias de la lista) se guardan en `CasoReembolso.datosImportados` (JSON) tal como vienen del Excel, más el mapeo normalizado de arriba para los que son campos de primera clase del modelo (`folio`, `conceptoGasto`, `nBoleta`, `estadoActual`, `fechaPago`, `fechaEnvioPago`).

### Fila de totales / filas en blanco
Los archivos pueden traer una fila final vacía o de resumen (con o sin la palabra "TOTAL"). **Regla de filtrado:** cualquier fila con `OT` vacío se descarta silenciosamente antes de validar (no cuenta como error ni como caso).

## Decisiones confirmadas sobre estas columnas
- `Tribunal`, `N° de Rol`, `Año Rol`, `Nombre receptor`, `Conceptos gasto de receptor` y `Estudio/Abogado` son **siempre obligatorios**; si falta alguno, la fila se rechaza como error de validación.
- `RUT` se guarda como texto tal cual viene del Excel, **sin validar** formato ni dígito verificador (MVP).
- `OT` siempre es **numérico**; se valida como tal al importar.

## Alcance
- Endpoint/acción para subir un archivo `.xlsx` o `.csv`.
- Parseo del archivo (librería a definir en la task de implementación, ej. `xlsx`/`exceljs` para Excel, parser nativo o `papaparse` para CSV). Debe leer la primera hoja sin importar su nombre.
- Mapeo de columnas del archivo a los campos internos de la tabla de arriba, **por alias** (más de un nombre de columna válido por campo, ver tabla). Normalización de nombres de columna para tolerar variaciones menores (espacios extra, mayúsculas/minúsculas, tildes, símbolos como `N°`).
- Descartar filas sin `OT` (fila de totales / filas en blanco) antes de validar.
- Validación de formato **antes** de insertar nada:
  - Las columnas obligatorias de la tabla de arriba deben estar presentes y con valor.
  - Tipos de dato correctos por columna (fechas parseables cuando no están vacías, `Costo de diligencia` numérico, `OT` no vacío).
  - Si el archivo no pasa validación, se rechaza completo con un reporte de errores por fila/columna (no se hace inserción parcial).
- Registro de cada fila válida como un `CasoReembolso` nuevo, asociado a un registro `ImportacionExcel` (fecha, usuario, cantidad de filas, cantidad de errores). **Estado inicial (actualizado tras spec 04):** en la práctica `Estado reembolso` siempre viene vacío, pero `Fecha pago`/`Fecha envío a pago` a veces ya vienen completadas desde el Excel. El estado inicial se infiere: `Fecha pago` con valor → `Pagado`; si no, `Fecha envío a pago` con valor → `Enviado a pago`; si no, `Estado reembolso` si viene con valor; si no, `Pendiente`. Ver [lib/estados/estados.ts](../lib/estados/estados.ts) y spec 04.
- La detección de duplicados (spec 03) se ejecuta como parte de este flujo, pero su lógica vive en su propia spec.
- Resumen post-importación visible al usuario: filas importadas, duplicados detectados, errores, filas de totales/en blanco descartadas.

## Fuera de alcance
- Reimportación con folios ya existentes en el sistema → spec 03 (cola de revisión manual).
- Matching de documentos → spec 05.
- Cambios de estado posteriores a la creación → spec 04.

## Criterios de aceptación
- Subir el archivo de ejemplo real original (`GASTOS RECEPTORES FRAUDE JUNIO 2026.xlsx`, formato de 13 columnas) crea 15 `CasoReembolso` (no 16 — la fila de totales se descarta) y un `ImportacionExcel` con los contadores correctos, todos con `nBoleta: null`.
- Subir el archivo de formato nuevo (`Rendición receptores BECH`, 14 columnas con `N° BOLETA` y `Concepto` singular) se importa igual de bien, matcheando los alias de columna correctamente y persistiendo `nBoleta` cuando viene con valor.
- Subir un archivo con una columna **obligatoria** faltante rechaza el archivo completo con un mensaje claro de qué columna falta. Falta de una columna **opcional** (`N° BOLETA`, fechas, estado) no rechaza nada.
- Subir un archivo con una fila con tipo de dato inválido (ej. `Costo de diligencia` no numérico) reporta esa fila específica sin insertar nada del archivo.
- Subir un archivo `.csv` y uno `.xlsx` equivalentes producen el mismo resultado.
- Una fila sin `OT` (como la fila de totales) no genera error ni se cuenta como caso importado.

## Dependencias
- Spec 01 (modelo de datos, storage no aplica aquí — el Excel no se guarda en Blob, solo se parsea).

## Notas de TDD (obligatorio — lógica crítica)
- El fixture de test se construye **anonimizado** a partir de la estructura real (mismas columnas, mismo tipo de fila de totales), con nombres/RUTs/OT ficticios — el archivo original con datos reales de clientes no se sube al repositorio.

Escribir tests **antes** de implementar para:
- Parser de Excel/CSV usando el fixture anonimizado: columnas correctas, columnas faltantes, tipos inválidos, fila de totales descartada, filas vacías, archivo vacío.
- Mapeo de columnas → modelo: normalización de nombres de columna (mayúsculas/minúsculas, espacios, tildes, símbolos como `N°`), **y matching por alias** (`Conceptos`/`Concepto`, `Fecha pago`/`Fecha pago diligencia receptor`).
- `N° BOLETA` ausente del archivo (formato viejo) no rompe nada; presente pero vacío en una fila puntual tampoco.
- Generación correcta del resumen (`cantidadFilas`, `cantidadErrores`) para distintos escenarios mixtos (algunas filas válidas, otras no, más la fila de totales).
