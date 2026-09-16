# Tasks — Spec 03: Detección de duplicados y reimportación

## Task 3.0 — Migración de schema: folio deja de ser único ✅ completada
- Prisma: quitar `@unique` de `CasoReembolso.folio`, agregar `conceptoGasto: String` y `posibleDuplicado: Boolean @default(false)`, agregar `@@index([folio, conceptoGasto])`.
- Nueva tabla `FilaEnRevision` (ver spec 03) + enum `EstadoRevisionFila`.
- La base ya tiene 15 `CasoReembolso` reales de junio: la migración debe backfillear `conceptoGasto` desde `datosImportados->>'Conceptos gasto de receptor'` antes de marcar la columna `NOT NULL`.
- **Verificación:** `npx prisma migrate dev` aplica sin pérdida de datos; los 15 casos reales existentes quedan con `conceptoGasto` correcto y `posibleDuplicado: false`.

## Task 3.1 — Detección de duplicados intra-archivo (TDD) ✅ completada
- Función pura en `lib/importacion/duplicados.ts`: dado un array de `CasoImportado` (salida del parser de spec 02), retorna qué índices comparten `folio`+`conceptoGasto` con otro dentro del mismo array.
- Se integra en `parseSheet`/`procesarImportacion`: las filas marcadas se insertan igual pero con `posibleDuplicado: true`.
- **Tests primero:** 0 duplicados, 1 par duplicado, grupo de 3+ con misma clave, mismo OT distinto concepto (no debe marcar), fixture con folios repetidos legítimamente (distinta diligencia).

## Task 3.2 — Detección contra casos existentes + cola de revisión (TDD) ✅ completada
(Nota: se agregó `fileParallelism: false` en `vitest.config.ts` — los tests de integración pegan contra la misma base Neon real y corrían en paralelo por archivo, lo que causaba colisiones de datos entre archivos de test distintos.)
- Antes de insertar cada fila válida, consultar si ya existe un `CasoReembolso` con la misma `folio`+`conceptoGasto` **de una importación anterior** (no la que se está procesando ahora).
- **Precedencia:** si existe coincidencia contra la base, esa fila SIEMPRE va a `FilaEnRevision` (`estado: PENDIENTE`) y NUNCA se crea un `CasoReembolso` para ella — sin importar si también es duplicado intra-archivo (Task 3.1). El marcado `posibleDuplicado` solo aplica a filas que sí se insertan.
- **Tests primero (integración contra la base real, con cleanup):** fila nueva sin coincidencia → se crea normal; fila que coincide con caso existente → no se crea, se genera `FilaEnRevision`; fila que es duplicado intra-archivo Y coincide con la base → no se crea, va a `FilaEnRevision` (no `posibleDuplicado`).
- Agregar `ImportacionExcel.cantidadEnRevision` (nueva migración) y reflejarlo en el resumen de importación.

## Task 3.3 — Acciones del revisor sobre la cola (TDD) ✅ completada
- `lib/revision/acciones.ts`: `aprobarFila(filaId, usuarioId)` (aplica `datosNuevos` sobre el `casoExistente`, crea `HistorialEstado`, marca `FilaEnRevision.estado = APROBADA`) y `descartarFila(filaId, usuarioId)` (solo marca `DESCARTADA`).
- Server Actions correspondientes en `app/revision/actions.ts`, protegidas por rol `revisor`.
- **Tests primero (integración):** aprobar actualiza el caso y crea historial; descartar no modifica el caso; ambas dejan `FilaEnRevision` en el estado correcto.

## Task 3.4 — UI de cola de revisión ✅ implementada (verificación manual pendiente, ver Task 3.5)
- Página `/revision` (protegida, rol `revisor`): lista las `FilaEnRevision` con `estado: PENDIENTE`, mostrando datos del caso existente vs. datos nuevos entrantes, con botones Aprobar/Descartar.
- **Verificación:** manual en navegador — generar una fila en revisión (reimportando un archivo con un `OT`+`conceptoGasto` ya existente) y aprobarla/descartarla desde la UI.

## Task 3.5 — Verificación end-to-end ✅ completada
Confirmado por el usuario en producción: reimportar el archivo real de junio dio "0 importadas, 1 descartada, 0 duplicados, 15 en revisión"; la cola en `/revision` mostró las 15 filas con los datos comparados, y aprobar/descartar funcionaron sin errores.

**Bug de infraestructura encontrado y corregido en el camino:** los deploys en Vercel fallaban el build (Prisma Client desactualizado, ver commit `84c28fa`) — Vercel seguía sirviendo un deploy viejo (folio único) contra la base ya migrada (conceptoGasto NOT NULL), lo que rompía cualquier importación en producción hasta que se agregó `"postinstall": "prisma generate"` a `package.json`.
- Con datos reales: reimportar un archivo con al menos una fila que coincida con un caso ya existente, confirmar que aparece en `/revision`, y probar ambas acciones (aprobar y descartar) en producción o local.

---
**Orden de ejecución:** 3.0 → 3.1 → 3.2 → 3.3 → 3.4 → 3.5.
