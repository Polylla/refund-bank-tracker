# Spec 03 — Detección de duplicados y reimportación

## Objetivo
Evitar que casos de reembolso se dupliquen silenciosamente, cubriendo dos escenarios distintos (ver [00-decisiones.md](00-decisiones.md), decisión #2 revisada, y decisiones #3 y #4):

1. **Duplicado dentro de la misma importación**: dos filas del mismo archivo con la misma clave de identidad.
2. **Reimportación**: una fila del archivo tiene la misma clave de identidad que un `CasoReembolso` ya existente de una importación anterior.

## Clave de identidad de un caso
**`OT` (folio) + `Conceptos gasto de receptor` (conceptoGasto).** Confirmado con el usuario: una misma OT puede tener múltiples diligencias distintas (ej. notificación de demanda y notificación de sentencia bajo la misma OT), y esas son casos legítimamente distintos, no duplicados. Solo cuando **ambos** campos coinciden se considera el mismo caso.

## Cambio de modelo de datos respecto a Spec 01
- `CasoReembolso.folio` **deja de ser `@unique`** en Prisma (ya no puede serlo: la misma OT se repite legítimamente entre diligencias distintas, y además dos filas con la misma clave de identidad completa SÍ deben poder coexistir marcadas como duplicado, ver Caso 1).
- Se agrega `CasoReembolso.conceptoGasto: String` como columna de primera clase (antes solo vivía dentro de `datosImportados`), para poder consultar la clave de identidad sin parsear JSON.
- Se agrega `CasoReembolso.posibleDuplicado: Boolean @default(false)`.
- Se agrega un índice no-único `@@index([folio, conceptoGasto])` para las búsquedas de duplicados (no un unique constraint — los duplicados se permiten a nivel de base, solo se marcan).
- Nueva tabla `FilaEnRevision` para la cola de reimportación (Caso 2, ver detalle abajo).
- Migración necesaria sobre la base ya existente (con datos reales de junio): agregar columnas, backfillear `conceptoGasto` desde `datosImportados` para las filas ya importadas, y recién ahí quitar el unique de `folio`.

## Alcance

### Caso 1 — Duplicado intra-archivo
- Al parsear el archivo (spec 02), si dos o más filas comparten `OT` + `Conceptos gasto de receptor`, **todas se importan** (se crean todos los `CasoReembolso`), pero se marcan con `posibleDuplicado: true`.
- No bloquea la importación del resto del archivo.
- El resumen de `ImportacionExcel` refleja `cantidadDuplicados` (cuenta de filas marcadas, no de grupos).

### Caso 2 — Reimportación (misma clave de identidad ya existe en la base, de una importación *anterior*)
- Si una fila entrante tiene `OT` + `conceptoGasto` que ya existen en un `CasoReembolso` de una importación previa, **no se crea ni se actualiza automáticamente** (no hay upsert automático).
- La fila queda en la tabla `FilaEnRevision`:
  - `importacionId` (de qué importación viene la fila nueva)
  - `casoExistenteId` (a qué `CasoReembolso` ya existente coincide)
  - `datosNuevos` (Json, los datos de la fila entrante tal como los parseó spec 02)
  - `estado`: `PENDIENTE` | `APROBADA` | `DESCARTADA`
  - `revisadoPorId`, `fechaRevision` (nullable, se llenan cuando un revisor actúa)
- Un usuario con rol `revisor` decide, fila por fila, desde una vista de "cola de revisión":
  - **Aprobar** → se aplica un upsert manual: los campos de `datosNuevos` reemplazan a los del `casoExistente` (excepto `estadoActual`, que no se toca acá — eso es de spec 04). Queda un registro en `HistorialEstado` documentando el cambio.
  - **Descartar** → la fila entrante se ignora. También queda registrado (en `FilaEnRevision.estado = DESCARTADA`, no hace falta duplicar en `HistorialEstado` ya que no cambió el caso).
- Nota de interacción con Caso 1: si una fila es duplicado intra-archivo **y además** coincide con un caso ya existente de otra importación, ambas marcas aplican independientemente (se crea el `CasoReembolso` marcado `posibleDuplicado: true` **y** además se genera la entrada en `FilaEnRevision`— no son excluyentes, ver criterios de aceptación).

## Fuera de alcance
- UI de matching de documentos (spec 05).
- Cambios de `estadoActual` como parte de la aprobación de una fila en revisión (eso es spec 04 — aprobar una fila en revisión solo actualiza los datos importados, no el estado del reembolso).

## Criterios de aceptación
- Importar un archivo con 2 filas de igual `OT`+`conceptoGasto` crea ambos `CasoReembolso`, ambos con `posibleDuplicado: true`; el resumen muestra `cantidadDuplicados: 2`.
- Importar un archivo con una fila cuya `OT`+`conceptoGasto` ya existe de una importación anterior no crea ni modifica ningún `CasoReembolso`; genera una fila en `FilaEnRevision` con estado `PENDIENTE`.
- Un revisor que aprueba una fila en revisión actualiza el `CasoReembolso` existente con los datos nuevos y queda registrado en `HistorialEstado`.
- Un revisor que descarta una fila en revisión no modifica nada, solo cambia `FilaEnRevision.estado` a `DESCARTADA`.
- Una fila que es duplicado intra-archivo Y coincide con un caso existente de otra importación genera ambos efectos (nuevo `CasoReembolso` marcado como duplicado + entrada en la cola de revisión apuntando al caso viejo).
- Importar un archivo sin repeticiones de `OT`+`conceptoGasto` (ni internas ni contra la base) no genera ninguna alerta ni fila en revisión.
- Dos filas con la misma `OT` pero **distinto** `conceptoGasto` (ej. notificación de demanda vs. notificación de sentencia) **no** se marcan como duplicado ni generan fila en revisión.

## Dependencias
- Spec 01 (roles).
- Spec 02 (el parser ya expone `folio` y `conceptoGasto` por fila).

## Notas de TDD (obligatorio — lógica crítica)
Escribir tests **antes** de implementar para:
- Detección de duplicados intra-archivo por `OT`+`conceptoGasto` (0, 1, N duplicados; mismo OT con distinto concepto → NO es duplicado).
- Detección de coincidencias contra casos ya existentes en la base (mock/fixture de casos existentes) usando la misma clave compuesta.
- Independencia de ambas detecciones (caso combinado: duplicado intra-archivo que además coincide con la base).
- Acción del revisor sobre `FilaEnRevision`: aprobar aplica el upsert y registra en `HistorialEstado`; descartar no modifica el caso.
