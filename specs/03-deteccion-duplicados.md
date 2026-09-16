# Spec 03 — Detección de duplicados y reimportación

## Objetivo
Evitar que casos de reembolso se dupliquen silenciosamente, cubriendo dos escenarios distintos (ver [00-decisiones.md](00-decisiones.md), decisiones #2, #3 y #4):

1. **Duplicado dentro de la misma importación**: dos filas del mismo archivo con el mismo folio.
2. **Reimportación**: una fila del archivo tiene un folio que ya existe en el sistema de una importación anterior.

## Alcance
### Caso 1 — Duplicado intra-archivo
- Al parsear el archivo (spec 02), si dos o más filas comparten folio, todas se importan pero quedan marcadas como `posible_duplicado` en el resultado de la importación.
- No bloquea la importación del resto del archivo.
- El resumen de `ImportacionExcel` refleja `cantidadDuplicados`.

### Caso 2 — Reimportación (folio ya existe en la base)
- Si una fila trae un folio que ya existe en un `CasoReembolso` previamente creado, **no se actualiza automáticamente** (no hay upsert).
- La fila queda en una cola de revisión manual (nueva entidad o campo de estado en `ImportacionExcel`/fila pendiente).
- Un usuario con rol `revisor` decide, fila por fila: actualizar el caso existente con los datos nuevos, o descartar la fila entrante.
- Esta decisión debe quedar en el `HistorialEstado`/log de auditoría (quién decidió, cuándo, qué se hizo).

## Fuera de alcance
- UI de matching de documentos (spec 05).
- Definición de qué campos combinar si en el futuro se necesita duplicidad sin folio único (no aplica en el MVP, ver decisión #2).

## Criterios de aceptación
- Importar un archivo con 2 filas de folio idéntico crea ambos casos y los marca como posible duplicado; el resumen muestra `cantidadDuplicados: 2` (o el conteo que se defina como convención).
- Importar un archivo con un folio que ya existe en la base no modifica el caso existente automáticamente; genera una entrada en la cola de revisión.
- Un revisor puede, desde la cola, aprobar la actualización (se aplica el upsert manual) o descartar la fila; ambas acciones quedan registradas en el historial.
- Importar un archivo sin folios repetidos ni existentes no genera ninguna alerta.

## Dependencias
- Spec 01 (modelo `HistorialEstado`, roles).
- Spec 02 (el parseo debe exponer los folios de las filas entrantes antes de insertar).

## Notas de TDD (obligatorio — lógica crítica)
Escribir tests **antes** de implementar para:
- Detección de folios repetidos dentro de un mismo archivo (0, 1, N duplicados).
- Detección de folios que ya existen en la base (mock/fixture de casos existentes).
- Que ambas detecciones sean independientes (un folio puede ser duplicado intra-archivo Y coincidir con uno existente a la vez — definir comportamiento esperado en el test).
- La acción del revisor (aprobar/descartar) sobre la cola produce el resultado correcto y el registro de auditoría esperado.
