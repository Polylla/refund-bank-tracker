# Tasks — Spec 06: Historial y reportería

## Task 6.1 — Métricas agregadas (TDD liviano) ✅ completada
- `lib/reporteria/metricas.ts`:
  - `casosPorEstado()`: cuenta de `CasoReembolso` agrupados por `estadoActual`.
  - `filasEnRevisionPendientes()`: cuenta de `FilaEnRevision` con `estado: PENDIENTE`.
  - `importacionesRecientes(limite)`: últimas N `ImportacionExcel` con su resumen.
- Reutiliza `casosSinDocumento()` / `documentosSinMatch()` de spec 05 (`lib/documentos/alertas.ts`), sin duplicar lógica.
- **Tests primero (integración contra la base real, con cleanup):** `casosPorEstado` refleja conteos correctos para una mezcla de estados; `filasEnRevisionPendientes` cuenta solo las pendientes (no aprobadas/descartadas).

## Task 6.2 — Dashboard (`/dashboard`) ✅ implementada (verificación manual pendiente, ver Task 6.4)
- Reemplaza el placeholder de Task 1.4 por el dashboard real: casos por estado, importaciones recientes, y las 3 alertas consolidadas (filas en revisión pendientes, documentos sin match, casos sin documento) con link directo a cada vista correspondiente (`/revision`, `/documentos`).
- **Verificación:** manual en navegador — los números coinciden con lo que se ve en `/casos`, `/revision` y `/documentos` por separado.

## Task 6.3 — Documentos en la línea de tiempo del caso ✅ implementada (verificación manual pendiente, ver Task 6.4)
(Nota: se descubrió que las URLs de blobs privados no son accesibles directo desde el navegador — se agregó `app/api/documentos/[id]/route.ts`, que autentica y hace de proxy vía `get()` del SDK, siguiendo el patrón recomendado por Vercel para private storage.)
- `/casos/[id]` (ya existe desde spec 04): agregar los `Documento` vinculados al caso a la vista (no es un evento de `HistorialEstado`, se muestra en su propia sección).
- **Verificación:** manual — un caso con documento matcheado (ej. folio con boleta 829) muestra el PDF vinculado en su detalle.

## Task 6.4 — Verificación end-to-end
- En producción: confirmar que el dashboard, el detalle de caso y las alertas reflejan correctamente los datos reales ya cargados (63 casos, documentos subidos, filas en revisión).

---
**Orden de ejecución:** 6.1 → 6.2 → 6.3 → 6.4.
