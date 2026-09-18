# Spec 08 — Notificaciones automáticas

## Objetivo
Avisar proactivamente a los usuarios sobre eventos que requieren atención, sin que tengan que entrar a revisar cada pantalla manualmente.

## Decisiones (confirmadas con el usuario, 2026-09-17)
- **Canal:** email (vía [Resend](https://resend.com)) **y** un indicador dentro de la app (campanita/badge con no leídas).
- **Destinatarios:** todos los usuarios de la app (`importador` y `revisor`), sin distinción.
- **Eventos inmediatos** (se disparan en el momento):
  1. Documento subido que queda `SIN_MATCH` (spec 05).
  2. Nueva fila creada en la cola de revisión (`FilaEnRevision`, spec 03).
- **Resumen diario** (un envío agregado por día, no uno por caso):
  3. Casos con `nBoleta` pendientes de documento (spec 05, ya existía como alerta, ahora también se resume por email/notificación).
  4. Casos marcados `posibleDuplicado: true` que nadie ha marcado como revisado (**concepto nuevo**, ver abajo).

## Cambio de modelo de datos
- **`CasoReembolso` agrega campos para trackear revisión de duplicados** (mismo patrón que `FilaEnRevision.revisadoPorId`/`fechaRevision`):
  - `duplicadoRevisadoPorId: String?` (FK a `Usuario`)
  - `duplicadoRevisadoEn: DateTime?`
  - Un caso "sin revisar" para efectos de esta spec es: `posibleDuplicado: true` Y `duplicadoRevisadoEn: null`.
- **Nueva tabla `Notificacion`** (una fila por usuario destinatario, para que cada quien tenga su propio estado de leído):
  - `id`, `usuarioId` (FK), `tipo` (enum: `DOCUMENTO_SIN_MATCH`, `FILA_EN_REVISION`, `RESUMEN_DIARIO`), `mensaje: String`, `enlace: String?` (a qué página lleva al hacer click), `leida: Boolean @default(false)`, `fecha: DateTime @default(now())`.

## Alcance
### Notificaciones inmediatas
- Al terminar de procesar una importación (`procesarImportacion`, spec 02/03): si se crearon una o más `FilaEnRevision`, se crea una `Notificacion` (tipo `FILA_EN_REVISION`) para cada usuario, y se envía un email agregando el conteo (no un email por fila).
- Al subir un documento (`subirDocumento`, spec 05): si queda `estadoMatching: SIN_MATCH`, se crea una `Notificacion` (tipo `DOCUMENTO_SIN_MATCH`) para cada usuario + email.

### Resumen diario
- Un cron job diario (Vercel Cron, ver Task 8.5) genera un resumen con: cantidad de casos con boleta pendiente de documento + cantidad de casos con duplicado sin revisar. Si ambos conteos son 0, no se envía nada ese día (evitar spam vacío).
- Se crea una `Notificacion` (tipo `RESUMEN_DIARIO`) por usuario + un email con el resumen.

### Marcar duplicado como revisado
- Nueva acción en `/casos` (solo visible en filas con `posibleDuplicado: true` sin revisar): botón "Marcar como revisado", disponible para `importador` o `revisor`. Setea `duplicadoRevisadoPorId`/`duplicadoRevisadoEn`. No dispara ninguna otra lógica (no es una decisión de aprobar/descartar como en `FilaEnRevision`, solo un acuse de recibo).

### Indicador en la app
- En el header (`app/layout.tsx`), junto al `UserButton`, un ícono/badge con la cantidad de `Notificacion` no leídas del usuario actual.
- Página `/notificaciones`: lista las notificaciones del usuario (más recientes primero), con link a la página relevante; al ver la lista se marcan como leídas.

## Fuera de alcance
- Preferencias de notificación por usuario (opt-out por tipo de evento, frecuencia configurable) — todos reciben todo, por ahora.
- Push notifications / SMS.
- Notificar cambios de estado de un caso (se evaluó y se descartó por volumen — ver conversación).

## Criterios de aceptación
- Subir un documento que queda sin match crea una `Notificacion` por usuario y (si Resend está configurado) envía un email.
- Reimportar un archivo que genera filas en revisión crea una `Notificacion` agregada (no una por fila) por usuario + email.
- El cron diario no envía nada si no hay casos pendientes de documento ni duplicados sin revisar.
- Marcar un caso duplicado como revisado lo saca del conteo del resumen diario y no se puede volver a marcar dos veces (idempotente).
- El badge de notificaciones no leídas en el header refleja el conteo real y baja a 0 al visitar `/notificaciones`.

## Dependencias
- Spec 01 (roles, modelo `Usuario`).
- Spec 02/03 (trigger de `FilaEnRevision`).
- Spec 05 (trigger de `Documento` sin match, alerta de casos sin documento).
- Cuenta de [Resend](https://resend.com) + `RESEND_API_KEY` — **bloqueante para el envío de emails** (el indicador in-app y el resto de la lógica no lo necesitan y se puede implementar/verificar antes).

## Notas de TDD
- Lógica de negocio (qué dispara qué, cálculo del resumen diario, idempotencia de "marcar revisado") con tests de integración, igual que el resto de specs con lógica crítica.
- El envío real de emails no se testea con TDD (efecto secundario externo) — se verifica manualmente en producción.
