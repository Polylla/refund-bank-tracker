# Tasks — Spec 12: Reporte por Estudio/Abogado

## Task 12.0 — Modelo: columna `estudioAbogado` + backfill retroactivo ✅ completada
Backfill corrido sobre producción: 63/63 casos reales completados. Se corrigieron además los fixtures de varios tests existentes que creaban `CasoReembolso` sin `estudioAbogado` (ahora obligatorio).
- Prisma: agregar `CasoReembolso.estudioAbogado String?` (nullable primero) + `@@index([estudioAbogado])`.
- **Script de backfill** (una vez, sobre los 63 casos reales): completar `estudioAbogado` desde `datosImportados["Estudio/Abogado"]`.
- Segunda migración: `estudioAbogado` pasa a `String` (no nulo), una vez confirmado que todos los casos reales quedaron completados.
- `lib/importacion/procesar.ts`: persistir `fila.estudioAbogado` al crear cada `CasoReembolso` (el parser ya lo extrae en `CasoImportado`, solo faltaba guardarlo como columna).
- **Verificación:** migraciones aplican sin pérdida de datos; los 63 casos reales quedan con `estudioAbogado` completado; una nueva importación de prueba persiste el campo correctamente.

## Task 12.1 — Agregación por estudio (TDD) ✅ completada
(Hallazgo: el monto no es una columna de primera clase — solo vive en `datosImportados["Costo de diligencia"]`, igual que hoy lo lee `app/casos/page.tsx`. La agregación por monto se hace en memoria, no vía `groupBy` de Prisma con `_sum`.)
- `lib/reporteria/porEstudio.ts`: `resumenPorEstudio()` — trae los casos con `estudioAbogado` (findMany) y agrupa en memoria, retornando por cada estudio distinto `{ estudio, cantidadTotal, montoTotal, porEstado: { [estado]: { cantidad, monto } } }`.
- **Tests primero:** con un set de casos de prueba (2+ estudios, varios estados, montos conocidos vía `datosImportados["Costo de diligencia"]`), los totales y desgloses por estado son exactos; un estudio con 0 casos en un estado dado no aparece con valores incorrectos (0, no `undefined`).

## Task 12.2 — Página `/reportes/estudios` + navegación
- `app/reportes/estudios/page.tsx`: tabla con una fila por estudio (cantidad, monto total, desglose por estado), cada fila linkeando a `/casos?campo=Estudio/Abogado&valor=<estudio>`.
- Enlace "Reportes por estudio" en `NavLinks`.
- **Verificación:** manual en navegador — la tabla muestra los estudios reales con los totales correctos, y el link a `/casos` filtra bien.

## Task 12.3 — Verificación end-to-end
- En producción: confirmar el backfill sobre los 63 casos reales, revisar `/reportes/estudios` con datos reales, e importar un archivo de prueba para confirmar que el nuevo campo se persiste en importaciones futuras.

---
**Orden de ejecución:** 12.0 → 12.1 → 12.2 → 12.3.
