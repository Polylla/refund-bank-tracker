# Spec 04 — Estados del reembolso

## Objetivo
Permitir que un caso de reembolso cambie de estado a lo largo del tiempo, dejando registro completo de cada transición.

## Alcance
- **Estados confirmados con el usuario (reemplaza el placeholder original):** `Pendiente`, `Enviado a pago`, `Pagado`, `Rechazado`. Basados en las columnas reales del Excel (`Fecha envío a pago`, `Fecha pago`).
- Transiciones libres: cualquier estado puede pasar a cualquier otro (no hay máquina de estados restrictiva en el MVP).
- Acción de cambio de estado disponible para **ambos roles**, `importador` y `revisor`.
- **Auto-completado de fechas:** al cambiar el estado a `Enviado a pago`, se completa `CasoReembolso.fechaEnvioPago` con la fecha/hora del cambio. Al cambiar a `Pagado`, se completa `CasoReembolso.fechaPago`. Estos dos campos se promueven a columnas de primera clase (antes solo vivían en `datosImportados`, que se mantiene como snapshot histórico del import original y no se modifica).
- Cada cambio de estado crea un registro en `HistorialEstado`: `estadoAnterior`, `estadoNuevo`, `fecha`, `usuarioId`.
- Vista de historial por caso: línea de tiempo de todos los cambios de estado (y, más adelante, de documentos asociados — spec 06 lo consolida).
- El estado inicial de un caso al importarse (spec 02) se registra también como una entrada de historial (`estadoAnterior: null`) — esto ya está implementado desde spec 02/03.

## Fuera de alcance
- Restricciones de transición (máquina de estados) — explícitamente descartado para el MVP.
- Notificaciones o alertas automáticas por cambio de estado (no mencionado en el alcance original).
- Reportería/dashboards agregados — spec 06.

## Criterios de aceptación
- Cambiar el estado de un caso crea una entrada en `HistorialEstado` con los datos correctos.
- El historial de un caso muestra todos sus cambios de estado en orden cronológico.
- Un usuario sin rol `importador` ni `revisor` no puede cambiar el estado de un caso (403 o control de UI equivalente).
- El estado actual mostrado en el listado de casos siempre coincide con la última entrada del historial.
- Cambiar el estado a un valor fuera de la lista cerrada (`Pendiente`, `Enviado a pago`, `Pagado`, `Rechazado`) se rechaza.
- Cambiar el estado a `Enviado a pago` completa `fechaEnvioPago` con la fecha del cambio; cambiar a `Pagado` completa `fechaPago`. Cambiar a `Pendiente` o `Rechazado` no toca esas fechas.

## Dependencias
- Spec 01 (modelo `HistorialEstado`, roles).
- Spec 02 (deben existir casos importados para poder cambiarles el estado).

## Notas
- No requiere TDD tan estricto como parseo/duplicados/matching, pero sí tests unitarios para la función que registra la transición (evitar que un cambio de estado se aplique sin dejar rastro en el historial), y para el auto-completado de fechas.
