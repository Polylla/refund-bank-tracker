# Plan de specs — App de Gestión de Reembolsos

**🎉 MVP completo** — las 7 specs del plan original están implementadas, testeadas y verificadas en producción ([refund-bank-tracker.vercel.app](https://refund-bank-tracker.vercel.app)) con datos reales.

Metodología: SDD (spec por feature, aprobada antes de implementar) + TDD obligatorio en lógica crítica (parseo, duplicados, matching). Ver [00-decisiones.md](00-decisiones.md) para las decisiones ya cerradas.

## Orden de implementación (por dependencia y prioridad)

| # | Spec | Depende de | Estado |
|---|------|-----------|--------|
| 01 | [Fundación técnica y modelo de datos](01-fundacion-arquitectura.md) | — | ✅ Completa (ver [tasks](01-fundacion-arquitectura.tasks.md)) |
| 02 | [Ingesta de Excel/CSV](02-ingesta-excel.md) | 01 | ✅ Completa (ver [tasks](02-ingesta-excel.tasks.md)), verificada en producción |
| 03 | [Detección de duplicados y reimportación](03-deteccion-duplicados.md) | 01, 02 | ✅ Completa (ver [tasks](03-deteccion-duplicados.tasks.md)), verificada en producción |
| 04 | [Estados del reembolso](04-estados-reembolso.md) | 01, 02 | ✅ Completa (ver [tasks](04-estados-reembolso.tasks.md)), verificada en producción |
| 05 | [Matching de documentos](05-matching-documentos.md) | 01, 02 | ✅ Completa (ver [tasks](05-matching-documentos.tasks.md)), verificada en producción |
| 06 | [Historial y reportería](06-historial-reporteria.md) | 02, 03, 04, 05 | ✅ Completa (ver [tasks](06-historial-reporteria.tasks.md)), verificada en producción |
| 07 | [Exportación a Excel](07-exportacion-excel.md) | 01, 02, 06 | ✅ Completa (ver [tasks](07-exportacion-excel.tasks.md)), verificada en producción |
| 08 | [Notificaciones automáticas](08-notificaciones.md) | 01, 02, 03, 05 | In-app completo y verificado (Tasks 8.0–8.6); envío por email (Task 8.7) pendiente de que el usuario cree una cuenta en Resend — ver [tasks](08-notificaciones.tasks.md) |
| 09 | [Validación de RUT](09-validacion-rut.md) | 02 | ✅ Completa (ver [tasks](09-validacion-rut.tasks.md)), verificada en producción |
| 10 | [Roles más granulares](10-roles-granulares.md) | 01 | ✅ Completa (ver [tasks](10-roles-granulares.tasks.md)), verificada en producción |
| 11 | [Exportar historial y documentos adjuntos](11-exportar-historial-documentos.md) | 04, 05, 07 | ✅ Completa (ver [tasks](11-exportar-historial-documentos.tasks.md)), verificada en producción |
| 12 | [Reporte por Estudio/Abogado](12-reporte-por-estudio.md) | 01, 02, 04, 06, 07 | ✅ Completa (ver [tasks](12-reporte-por-estudio.tasks.md)), verificada en producción |

Nota sobre el orden: el documento original (sección 5) propone *ingesta → modelo de datos → duplicados → estados → matching → exportación*. Se adelantó "modelo de datos" a la spec 01 (junto con la fundación técnica y auth) porque ingesta, duplicados, estados y matching dependen todos de que el esquema de datos ya exista — no tiene sentido parsear un Excel sin tener dónde guardarlo. El resto del orden se mantiene igual al propuesto, agregando "historial y reportería" (punto 3.2 del documento original) al final porque es principalmente una capa de presentación sobre datos que generan las specs 02–05.

## Siguiente paso
El MVP original y todo el backlog de mejoras propuesto están completos. Lo único pendiente es Task 8.7 (envío de notificaciones por email vía Resend), bloqueada hasta que el usuario cree una cuenta en Resend.
