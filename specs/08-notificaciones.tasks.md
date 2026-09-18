# Tasks — Spec 08: Notificaciones automáticas

## Task 8.0 — Migración: Notificacion + tracking de duplicado revisado ✅ completada
- Prisma: nuevo modelo `Notificacion` (`usuarioId`, `tipo` enum `TipoNotificacion`, `mensaje`, `enlace?`, `leida`, `fecha`). Agregar a `CasoReembolso`: `duplicadoRevisadoPorId: String?`, `duplicadoRevisadoEn: DateTime?`.
- **Verificación:** migración aplica sin pérdida de datos.

## Task 8.1 — Creación de notificaciones (TDD) ✅ completada
- `lib/notificaciones/crear.ts`: `notificarATodosLosUsuarios(tipo, mensaje, enlace?)` — crea una `Notificacion` por cada `Usuario` existente.
- **Tests primero (integración, con cleanup):** crea exactamente una notificación por usuario existente; el mensaje/tipo/enlace quedan correctos.

## Task 8.2 — Trigger: documento sin match + fila en revisión (TDD) ✅ completada
(Nota: los tests existentes de `subirDocumento` y `procesarImportacion`/revisión mockean `notificarATodosLosUsuarios` — de lo contrario cada corrida de test fanearía notificaciones reales al usuario de producción, ya que la función notifica a *todos* los usuarios de la base compartida.)
- Integrar en `lib/documentos/subirDocumento.ts`: si `estadoMatching: SIN_MATCH`, llamar a `notificarATodosLosUsuarios("DOCUMENTO_SIN_MATCH", ...)`.
- Integrar en `lib/importacion/procesar.ts`: si `filasEnRevision > 0`, llamar a `notificarATodosLosUsuarios("FILA_EN_REVISION", ...)` **una sola vez** (agregado, no por fila).
- **Tests primero:** subir documento sin match genera 1 notificación por usuario; subir documento que sí matchea no genera ninguna; reimportar con N filas en revisión genera 1 notificación agregada por usuario (no N).

## Task 8.3 — Marcar duplicado como revisado (TDD)
- `lib/notificaciones/marcarDuplicadoRevisado.ts`: `marcarDuplicadoRevisado(casoId, usuarioId)` — setea `duplicadoRevisadoPorId`/`duplicadoRevisadoEn`. Rechaza si el caso no tiene `posibleDuplicado: true`, o si ya fue revisado (idempotencia).
- Server Action + botón "Marcar como revisado" en `/casos`, visible solo en filas con `posibleDuplicado: true` sin revisar.
- **Tests primero:** marca correctamente; rechaza un caso sin `posibleDuplicado`; rechaza volver a marcar uno ya revisado.

## Task 8.4 — Resumen diario (TDD, sin envío de email todavía)
- `lib/notificaciones/resumenDiario.ts`: `calcularResumenDiario()` — cuenta `casosSinDocumento()` (spec 05) + casos con `posibleDuplicado: true` y `duplicadoRevisadoEn: null`. Si ambos son 0, retorna `null` (no generar nada).
- `generarNotificacionesResumenDiario()`: si `calcularResumenDiario()` no es null, llama a `notificarATodosLosUsuarios("RESUMEN_DIARIO", ...)`.
- **Tests primero:** con 0 pendientes no genera notificación; con al menos 1 pendiente sí, y el mensaje refleja los conteos correctos.

## Task 8.5 — Cron diario + Route Handler
- `app/api/cron/resumen-diario/route.ts` (GET): protegido con un secreto (`CRON_SECRET` en el header `Authorization`, patrón estándar de Vercel Cron), llama a `generarNotificacionesResumenDiario()` (y al envío de emails, Task 8.7).
- `vercel.json`: configurar el cron (`0 12 * * *` — 8am Chile en horario UTC-4, ajustar según DST) apuntando a esa ruta.
- **Verificación:** invocar la ruta manualmente con el secreto correcto genera las notificaciones esperadas; sin el secreto, 401.

## Task 8.6 — Indicador en la app + página `/notificaciones`
- Header: ícono con badge de no leídas (cuenta `Notificacion` del usuario actual con `leida: false`).
- `/notificaciones`: lista ordenada por fecha descendente, cada una linkeando a `enlace`; al cargar la página se marcan todas como leídas.
- **Verificación:** manual en navegador.

## Task 8.7 — Envío de emails con Resend
- **Bloqueante:** requiere que el usuario cree una cuenta en [resend.com](https://resend.com) y provea `RESEND_API_KEY`. Para producción real (enviar a cualquier destinatario) también requiere verificar un dominio propio en Resend — mientras tanto, el modo de prueba de Resend solo permite enviar al email de la cuenta.
- `lib/notificaciones/email.ts`: envía el email correspondiente a cada tipo de notificación.
- Integrar en Tasks 8.2 y 8.5 (llamar al envío de email además de crear la `Notificacion` in-app).
- **Verificación:** manual — con `RESEND_API_KEY` configurada, disparar cada tipo de evento y confirmar que llega el email.

## Task 8.8 — Verificación end-to-end
- En producción: subir un documento sin match, reimportar algo que genere fila en revisión, marcar un duplicado como revisado, y correr el cron manualmente. Confirmar notificaciones in-app + emails (si Resend está configurado) en cada caso.

---
**Orden de ejecución:** 8.0 → 8.1 → 8.2 → 8.3 → 8.4 → 8.5 → 8.6 → 8.7 → 8.8.
Las Tasks 8.0–8.6 no requieren Resend y se pueden completar y verificar (in-app) sin bloquearse en la cuenta de email.
