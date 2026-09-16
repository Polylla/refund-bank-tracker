# Spec 06 — Historial y reportería

## Objetivo
Consolidar y exponer, en vistas de reporte/dashboard, todo lo que las specs anteriores ya registran (importaciones, cambios de estado, documentos asociados), sin introducir nueva lógica de negocio.

## Alcance
- Vista de detalle de caso: línea de tiempo unificada con creación (spec 02), cambios de estado (spec 04) y documentos asociados (spec 05).
- Dashboard/listado general de casos con: estado actual, fecha de creación, fecha de última actualización, indicador de alertas pendientes (duplicado sin resolver, documento sin match, caso sin documento).
- Métricas agregadas básicas (a confirmar cuáles son útiles para el usuario, propuesta inicial):
  - Casos por estado.
  - Importaciones recientes con su resumen (filas, duplicados, errores).
  - Casos con alertas pendientes (duplicados en cola de revisión, documentos sin match, casos sin documento).

## Fuera de alcance
- Nueva lógica de detección o cálculo — esta spec solo lee y presenta datos ya generados por specs 02–05.
- Exportación a Excel — spec 07 (aunque puede reusar los mismos filtros de esta vista).

## Criterios de aceptación
- El detalle de un caso muestra su historial completo en orden cronológico, incluyendo el evento de creación.
- El dashboard general refleja en tiempo real (o casi) el estado de todos los casos, sin necesidad de recarga manual de datos (revalidación estándar de Next.js es suficiente).
- Los indicadores de alerta (duplicado pendiente, documento sin match, caso sin documento) coinciden exactamente con lo calculado en specs 03 y 05.

## Dependencias
- Specs 02, 03, 04, 05 (esta spec es principalmente de presentación sobre datos ya generados).

## Notas
- No requiere TDD estricto (es capa de presentación), salvo para cualquier función de agregación/cálculo de métricas, que sí debe tener tests unitarios.
