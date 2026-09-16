# Decisiones cerradas (Sección 6 de la especificación inicial)

Registro de las decisiones tomadas antes de escribir el plan de specs. Cualquier spec que dependa de una de estas decisiones debe citarla en vez de redefinirla.

## 1. Matching documento ↔ caso
**Decisión:** por folio/N° de caso en el nombre del archivo (ej. `12345.pdf`).
- No se implementa OCR en el MVP.
- No hay selección manual como mecanismo primario (queda abierto si se agrega como fallback más adelante — ver "Abiertos" al final).

## 2. Criterio de duplicidad
**Decisión:** el Excel trae un folio/ID único por fila: la columna **`OT`** (numérica). La duplicidad se define por ese folio. Confirmado con archivo de ejemplo real (ver #7).

## 3. Comportamiento ante duplicado (dentro de una misma importación)
**Decisión:** se importa igual, marcada como "posible duplicado" para revisión posterior. No bloquea la importación.

## 4. Reimportación (folio ya existente en el sistema, en una importación posterior)
**Decisión:** NO se hace upsert automático. Las filas con folio ya existente quedan en una cola de revisión manual; un usuario decide si actualizar el caso o descartar la fila.
- Nota: esto es distinto de la decisión #3 (duplicado dentro del mismo archivo). Ambos casos conviven en la spec 03.

## 5. Multi-tenant / usuarios / autenticación
**Decisión:** multi-usuario con roles y autenticación (ej. roles "importador" y "revisor"). Se evaluará Auth.js o Clerk en la spec de fundación (01).

## 6. Estados del reembolso
**Decisión:** lista básica de estados (ej. Pendiente, En Revisión, Aprobado, Rechazado, Pagado — a confirmar nombres exactos) con transiciones libres (cualquier estado puede pasar a cualquier otro) en el MVP. No se modela una máquina de estados restrictiva por ahora.

## 7. Columnas del Excel/CSV de origen
**Decisión:** confirmado con archivo de ejemplo real (`GASTOS RECEPTORES FRAUDE JUNIO 2026.xlsx`, un solo caso de uso: gastos de receptores judiciales en causas de fraude, Ley 20.009). 13 columnas: `OT` (folio único), `Nombre cliente`, `RUT`, `Tribunal`, `N° de Rol`, `Año Rol`, `Nombre receptor`, `Conceptos gasto de receptor`, `Costo de diligencia` (monto), `Fecha pago`, `Estudio/Abogado`, `Fecha envío a pago`, `Estado reembolso`. Las últimas tres suelen venir vacías al importar (se llenan durante el ciclo de vida del caso). El archivo trae una fila de totales al final que se debe descartar (fila sin `OT`). Detalle completo en [02-ingesta-excel.md](02-ingesta-excel.md).

## 8. Filtros de exportación
**Decisión:** todos los campos importados del Excel deben poder usarse como filtro al exportar (no solo un subconjunto fijo).

## Abiertos / a revisar más adelante
- Nombre exacto de la columna de folio único (depende de #7).
- Si se agrega selección manual como fallback cuando el nombre del archivo no trae folio reconocible (relacionado a #1).
- Nombres definitivos y significado de negocio de cada estado (depende de #6, el usuario debe confirmar el listado real).
- Detalle de permisos por rol más allá de "importador" / "revisor" (depende de #5).
