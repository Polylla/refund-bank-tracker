# Spec 12 — Reporte por Estudio/Abogado

## Objetivo
Permitir ver el histórico de casos agrupado por Estudio/Abogado (quién encargó la diligencia), tanto a nivel general como desglosado por estudio, incluyendo estado de pago.

## Alcance
- **Modelo de datos:** `CasoReembolso.estudioAbogado` pasa a ser columna de primera clase (hoy solo vive dentro de `datosImportados`), con índice para agrupar/filtrar eficientemente. Se sigue guardando también en `datosImportados` como snapshot del import original (no se cambia ese comportamiento).
- **Backfill retroactivo:** los 63 casos reales ya importados se completan una vez con el valor de `datosImportados["Estudio/Abogado"]` (mismo patrón que la corrección retroactiva de spec 04).
- `lib/importacion/procesar.ts` persiste `estudioAbogado` en cada `CasoReembolso` nuevo (el parser ya lo extrae, solo faltaba guardarlo).
- **Nueva página `/reportes/estudios`:** tabla con una fila por Estudio/Abogado, mostrando:
  - Cantidad total de casos.
  - Monto total (`monto`).
  - Desglose por estado actual (cantidad y monto por cada estado de `ESTADOS`: Pendiente, Enviado a pago, Pagado, Rechazado).
  - Link a `/casos?campo=Estudio/Abogado&valor=<estudio>` (reutiliza el filtro genérico ya existente de spec 07) para ver el detalle de los casos de ese estudio.
- Enlace "Reportes por estudio" en la navegación (`NavLinks`).

## Fuera de alcance
- No se agrega un filtro dedicado "Estudio/Abogado" en `/casos` más allá del que ya existe hoy vía el filtro genérico por campo importado (spec 07) — el link desde el reporte ya lo pre-completa.
- No se acota la exportación a Excel/ZIP por estudio en esta spec — ya es posible hoy usando el filtro genérico existente (`campo=Estudio/Abogado&valor=...`) en `/api/exportar` y `/api/exportar/documentos`.
- No se modela "Estudio/Abogado" como una entidad propia (con su propia tabla, contactos, etc.) — sigue siendo un string libre importado del Excel, igual que hoy.
- No se restringe el acceso a este reporte por rol más allá de lo que ya aplica a `/dashboard` (cualquier usuario autenticado).

## Criterios de aceptación
- Los 63 casos reales existentes tienen `estudioAbogado` completado después del backfill, sin pérdida de datos.
- Una nueva importación persiste `estudioAbogado` como columna, no solo dentro de `datosImportados`.
- `/reportes/estudios` muestra una fila por cada estudio distinto presente en los casos, con las cantidades y montos correctos por estado.
- El link desde un estudio en el reporte a `/casos?...` filtra correctamente el listado a los casos de ese estudio.

## Dependencias
- Spec 01 (modelo de datos), Spec 02 (importación), Spec 04 (estados, patrón de corrección retroactiva), Spec 06 (reportería existente), Spec 07 (filtro genérico reutilizado).

## Notas
- No requiere TDD tan estricto como parseo/duplicados/matching, pero sí tests para la función de agregación por estudio (dado un set de casos conocido, verificar los totales y desgloses por estado exactos).
