# Spec 04 — Estados del reembolso

## Objetivo
Permitir que un caso de reembolso cambie de estado a lo largo del tiempo, dejando registro completo de cada transición.

## Alcance
- Lista básica de estados para el MVP (decisión #6 en [00-decisiones.md](00-decisiones.md)), placeholder a confirmar con el usuario:
  `Pendiente`, `En Revisión`, `Aprobado`, `Rechazado`, `Pagado`.
- Transiciones libres: cualquier estado puede pasar a cualquier otro (no hay máquina de estados restrictiva en el MVP).
- Acción de cambio de estado disponible para el rol `revisor` (a confirmar si `importador` también puede, por defecto no).
- Cada cambio de estado crea un registro en `HistorialEstado`: `estadoAnterior`, `estadoNuevo`, `fecha`, `usuarioId`.
- Vista de historial por caso: línea de tiempo de todos los cambios de estado (y, más adelante, de documentos asociados — spec 06 lo consolida).
- El estado inicial de un caso al importarse (spec 02) se registra también como una entrada de historial (`estadoAnterior: null`).

## Fuera de alcance
- Restricciones de transición (máquina de estados) — explícitamente descartado para el MVP.
- Notificaciones o alertas automáticas por cambio de estado (no mencionado en el alcance original).
- Reportería/dashboards agregados — spec 06.

## Criterios de aceptación
- Cambiar el estado de un caso crea una entrada en `HistorialEstado` con los datos correctos.
- El historial de un caso muestra todos sus cambios de estado en orden cronológico.
- Un usuario sin rol `revisor` no puede cambiar el estado de un caso (403 o control de UI equivalente).
- El estado actual mostrado en el listado de casos siempre coincide con la última entrada del historial.

## Dependencias
- Spec 01 (modelo `HistorialEstado`, roles).
- Spec 02 (deben existir casos importados para poder cambiarles el estado).

## Notas
- No requiere TDD tan estricto como parseo/duplicados/matching, pero sí tests unitarios para la función que registra la transición (evitar que un cambio de estado se aplique sin dejar rastro en el historial).
- Cuando el usuario confirme el listado real de estados y si hay o no transiciones restringidas, actualizar esta spec antes de implementar.
