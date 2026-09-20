# Tasks — Spec 14: Edición de datos en la cola de revisión

## Task 14.0 — Dashboard: tiles "Casos por estado" clickeables ✅ completada
- `app/dashboard/page.tsx`: cada tile de "Casos por estado" pasa a ser un `Link` a `/casos?estado=<estado>` (reutiliza el filtro ya existente).
- **Verificación:** manual — clic en un tile lleva a `/casos` filtrado por ese estado.

## Task 14.1 — Validación de RUT al aprobar con datos editados (TDD) ✅ completada
- `lib/revision/acciones.ts`: `aprobarFila(filaId, usuarioId, datosOverride?)` — si se pasa `datosOverride`, se usa en vez de `fila.datosNuevos` para actualizar `datosImportados`. Si `datosOverride.RUT` existe, se valida/normaliza con `normalizarRut` (spec 09); si es inválido, retorna `{ ok: false, mensaje: ... }` sin tocar nada.
- **Tests primero:** aprobar con `datosOverride` guarda esos valores (no los originales de la fila); RUT editado inválido rechaza sin modificar caso ni fila; RUT editado válido en otro formato se normaliza igual que en la importación.

## Task 14.2 — UI editable en `FilaRevisionCard` ✅ implementada (verificación manual pendiente hasta Task 14.3)
- `DiffTable` (dentro de `FilaRevisionCard.tsx`) recibe estado local editable para "Datos nuevos": cada celda es un `<input>` (deshabilitado si `soloLectura`), inicializado con el valor actual.
- "Aprobar" envía los valores editados vía `aprobarFilaAction(filaId, datosEditados)`.
- **Verificación:** manual en navegador — editar el RUT de una fila en revisión y aprobar guarda el valor corregido; un RUT inválido muestra el error sin aprobar.

## Task 14.3 — Verificación end-to-end
- En producción: corregir el caso real con RUT "11111111-1" desde la cola de revisión, editándolo a su valor correcto, y confirmar que el caso queda con el RUT corregido.

---
**Orden de ejecución:** 14.0 → 14.1 → 14.2 → 14.3.
