# Spec 16 — Eliminar documentos e importaciones por error

## Objetivo
Permitir corregir errores de carga: eliminar un documento subido por error, y eliminar una importación completa (con todos los casos que generó) si se subió el Excel equivocado.

## Alcance
- **Eliminar documento:** botón "Eliminar" en cada documento listado (en "Documentos sin match" de `/documentos`, y en "Documentos asociados" de `/casos/[id]`). Borra el archivo del Blob storage y la fila `Documento` (Prisma limpia la relación many-to-many con `CasoReembolso` automáticamente). Mismo permiso que subir documentos (`importador` o `revisor`).
- **Eliminar importación completa:** nueva lista de "Importaciones recientes" en `/importaciones` (se había sacado del dashboard en spec 13, pero acá es para gestión, no solo lectura), con botón "Eliminar" por importación. Al eliminar:
  - Se borran todos los `CasoReembolso` que generó esa importación, su `HistorialEstado`, y las `FilaEnRevision` asociadas (tanto las generadas por esa importación como las que referencian alguno de sus casos como "caso existente" desde una reimportación posterior).
  - Los `Documento` que quedan sin ningún caso asociado tras el borrado vuelven a `estadoMatching: SIN_MATCH` (no se borran los documentos en sí, solo se desvinculan).
  - Se borra la fila `ImportacionExcel`.
  - Mismo permiso que importar (`importador` o `revisor`).
- **Advertencia antes de confirmar:** si algún caso de la importación ya no está en `Pendiente`, o tiene un documento vinculado, se muestra un resumen claro ("N casos con avance de estado, M con documento vinculado") antes de poder confirmar el borrado — pero no se bloquea, el usuario decide.

## Fuera de alcance
- No se agrega una papelera/soft-delete — el borrado es definitivo (irreversible), como el resto de operaciones destructivas de la app.
- No se restringe a rol `admin` — se decidió que `importador`/`revisor` (el mismo permiso que ya tienen para importar) alcanza.
- No se permite eliminar filas individuales de una importación ya procesada (solo la importación completa) — para eso ya existe la cola de revisión (reimportar y descartar) y el cambio de estado a `Rechazado`.

## Criterios de aceptación
- Eliminar un documento borra el archivo del Blob y la fila; si estaba vinculado a un caso, ese caso queda sin documento (visible de nuevo en "Casos con boleta pendiente de documento").
- Eliminar una importación borra todos sus casos, historial y filas en revisión relacionadas (incluyendo las que la referencian desde otras importaciones), sin error de integridad referencial.
- Un documento que queda sin ningún caso tras eliminar una importación vuelve a aparecer en "Documentos sin match".
- Si algún caso de la importación tiene avance de estado o documento, se muestra la advertencia con los conteos correctos antes de confirmar.
- Un usuario sin rol `importador` ni `revisor` no puede eliminar ni documentos ni importaciones.

## Dependencias
- Spec 02 (importación), Spec 05 (documentos/matching), Spec 03 (`FilaEnRevision`).

## Notas
- Tests para `eliminarImportacion` (TDD): borra casos/historial/filas en revisión correctamente, incluyendo el caso de una `FilaEnRevision` de OTRA importación que referencia un caso de la que se está borrando; documentos huérfanos vuelven a `SIN_MATCH`; documentos que siguen vinculados a otros casos no se tocan.
- Tests para `eliminarDocumento`: borra la fila y llama a borrar el blob (mockeado).
