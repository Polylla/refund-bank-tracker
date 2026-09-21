# Tasks — Spec 16: Eliminar documentos e importaciones por error

## Task 16.0 — Eliminar documento (TDD) ✅ completada
(De paso se corrigió un gap preexistente: `/casos/[id]` mostraba el `EstadoSelector` a cualquier usuario sin chequear `soloLectura`, a diferencia de `/casos` que sí lo hacía desde spec 10.)
- `lib/documentos/eliminarDocumento.ts`: `eliminarDocumento(documentoId)` — borra la fila `Documento` (Prisma limpia la relación m2m con `CasoReembolso`), luego intenta borrar el blob (`@vercel/blob` `del`) en un `try/catch` best-effort (si falla el borrado del blob, no revierte el borrado de la fila).
- Server Action + botón "Eliminar" en `BuscarYVincular`/lista de "Documentos sin match" (`/documentos`) y en "Documentos asociados" (`/casos/[id]`), protegido con `requireAnyRole(roles, ["importador", "revisor"])`.
- **Tests primero (mockeando `@vercel/blob`):** borra la fila y llama a `del` con la urlBlob correcta; si el documento no existe, retorna error sin llamar a `del`.

## Task 16.1 — Eliminar importación completa (TDD)
- `lib/importacion/eliminarImportacion.ts`:
  - `resumenEliminarImportacion(importacionId)`: `{ cantidadCasos, casosConAvance, casosConDocumento }`.
  - `eliminarImportacion(importacionId)`: borra en transacción `FilaEnRevision` (por `importacionId` o `casoExistenteId` de alguno de los casos), `HistorialEstado` de esos casos, desvincula documentos (`documentos: { set: [] }`), marca `SIN_MATCH` los documentos que quedan sin ningún caso, borra los `CasoReembolso`, y por último la `ImportacionExcel`.
- **Tests primero:** con una importación con 2 casos (uno con documento vinculado, otro con avance de estado) y una `FilaEnRevision` de OTRA importación que referencia uno de esos casos como `casoExistente`: `resumenEliminarImportacion` retorna los conteos correctos; `eliminarImportacion` borra todo sin error de FK, el documento que quedó sin casos vuelve a `SIN_MATCH`, y la `FilaEnRevision` externa también se borró (no queda huérfana).

## Task 16.2 — UI: lista de importaciones + confirmación con advertencia
- `/importaciones`: nueva sección "Importaciones recientes" (últimas 20), con botón "Eliminar" por fila.
- Al hacer clic, se muestra el resumen (`resumenEliminarImportacion`) con la advertencia si corresponde, y un botón "Confirmar eliminación" / "Cancelar" — igual patrón que el motivo de rechazo (spec 15).
- **Verificación:** manual — eliminar una importación de prueba y confirmar que desaparece junto con sus casos.

## Task 16.3 — Verificación end-to-end
- En producción: subir un archivo de prueba, vincular un documento, eliminar el documento (confirmar que el caso queda sin documento), y luego eliminar la importación completa (confirmar que los casos desaparecen y no rompe nada).

---
**Orden de ejecución:** 16.0 → 16.1 → 16.2 → 16.3.
