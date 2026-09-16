# Plan de specs — App de Gestión de Reembolsos

Metodología: SDD (spec por feature, aprobada antes de implementar) + TDD obligatorio en lógica crítica (parseo, duplicados, matching). Ver [00-decisiones.md](00-decisiones.md) para las decisiones ya cerradas.

## Orden de implementación (por dependencia y prioridad)

| # | Spec | Depende de | Estado |
|---|------|-----------|--------|
| 01 | [Fundación técnica y modelo de datos](01-fundacion-arquitectura.md) | — | Pendiente de aprobación |
| 02 | [Ingesta de Excel/CSV](02-ingesta-excel.md) | 01 | Pendiente de aprobación — **bloqueada** hasta recibir el archivo Excel de ejemplo |
| 03 | [Detección de duplicados y reimportación](03-deteccion-duplicados.md) | 01, 02 | Pendiente de aprobación |
| 04 | [Estados del reembolso](04-estados-reembolso.md) | 01, 02 | Pendiente de aprobación |
| 05 | [Matching de documentos](05-matching-documentos.md) | 01, 02 | Pendiente de aprobación |
| 06 | [Historial y reportería](06-historial-reporteria.md) | 02, 03, 04, 05 | Pendiente de aprobación |
| 07 | [Exportación a Excel](07-exportacion-excel.md) | 01, 02, 06 | Pendiente de aprobación |

Nota sobre el orden: el documento original (sección 5) propone *ingesta → modelo de datos → duplicados → estados → matching → exportación*. Se adelantó "modelo de datos" a la spec 01 (junto con la fundación técnica y auth) porque ingesta, duplicados, estados y matching dependen todos de que el esquema de datos ya exista — no tiene sentido parsear un Excel sin tener dónde guardarlo. El resto del orden se mantiene igual al propuesto, agregando "historial y reportería" (punto 3.2 del documento original) al final porque es principalmente una capa de presentación sobre datos que generan las specs 02–05.

## Siguiente paso
Falta tu aprobación explícita de este plan (y de cada spec individualmente, o en bloque) antes de pasar a la descomposición en tasks. Además, para poder cerrar la spec 02 necesito el archivo Excel de ejemplo (o el listado real de columnas) que mencionaste.
