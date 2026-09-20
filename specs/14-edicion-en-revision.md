# Spec 14 — Edición de datos en la cola de revisión

## Objetivo
Permitir corregir manualmente el valor de cualquier campo de "Datos nuevos" en la cola de revisión antes de aprobar, para casos donde el dato importado (ej. un RUT) es incorrecto pero no fue rechazado por la validación automática.

## Alcance
- En `FilaRevisionCard`, la columna "Datos nuevos" pasa de texto fijo a inputs editables para todos los campos importados (no solo RUT).
- Al hacer clic en "Aprobar", se envían los valores editados (no los originales de `FilaEnRevision.datosNuevos`) para actualizar el caso.
- El campo `RUT` se revalida con el mismo dígito verificador que en la importación (`normalizarRut`, spec 09) antes de guardar; si el valor editado no es válido, se rechaza con un mensaje claro y no se aprueba nada. El resto de los campos se aceptan como texto libre (sin validación adicional, igual que hoy no la tienen al importar salvo los tipos ya validados en spec 02/09).
- "Descartar" no cambia: sigue ignorando la fila sin tocar el caso.
- Rol `visor` (sin permiso de accionar): los campos de "Datos nuevos" se muestran de solo lectura, igual que ya pasa con los botones Aprobar/Descartar (spec 10).

## Fuera de alcance
- No se edita la columna "Caso existente" (es de solo referencia).
- No se sincronizan columnas de primera clase (`folio`, `conceptoGasto`, `nBoleta`, `estudioAbogado`) al aprobar — ese es un comportamiento preexistente de `aprobarFila` que no cambia en esta spec (la única excepción práctica es RUT, que nunca fue columna de primera clase).
- No se agrega edición de casos fuera de la cola de revisión (eso quedó descartado en las opciones que elegiste).
- No se valida ningún otro campo más allá de RUT (montos, fechas, etc. quedan como texto libre, igual que hoy).

## Criterios de aceptación
- Editar un campo en "Datos nuevos" y aprobar guarda el valor editado, no el original de la fila.
- Editar el RUT a un valor con dígito verificador inválido y aprobar rechaza la acción con un mensaje claro; no se modifica el caso ni la fila.
- Editar el RUT a un valor válido en un formato distinto (con puntos, sin guión, etc.) lo normaliza igual que en la importación.
- Un usuario con rol `visor` ve los campos de solo lectura, sin poder editarlos.

## Dependencias
- Spec 03 (`FilaEnRevision`), Spec 08/09 (UI de revisión existente, `normalizarRut`), Spec 10 (rol `visor`).

## Notas
- Tests para la validación de RUT al aprobar con datos editados (válido normaliza, inválido rechaza) en `lib/revision/acciones.ts`.
