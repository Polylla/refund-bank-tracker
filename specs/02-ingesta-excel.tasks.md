# Tasks — Spec 02: Ingesta de Excel/CSV

## Task 2.0 — Setup del test runner ✅ completada
- Instalar `vitest` (rápido, ESM-nativo, encaja bien con Next.js 16 + TS).
- Configurar `vitest.config.ts` y script `"test": "vitest run"` / `"test:watch": "vitest"` en `package.json`.
- **Verificación:** un test trivial (`expect(1+1).toBe(2)`) corre con `npm test`.

## Task 2.1 — Fixture anonimizado ✅ completada
- Generar `tests/fixtures/reembolsos-ejemplo.xlsx`: misma estructura de columnas que el archivo real (13 columnas, ver [02-ingesta-excel.md](02-ingesta-excel.md)), con nombres/RUTs/OT ficticios, incluyendo la fila de totales al final. ~15 filas de datos + 1 total, igual que el original.
- Generar también `tests/fixtures/reembolsos-ejemplo.csv` equivalente (mismas filas, formato CSV) para los tests de paridad Excel/CSV.
- **Verificación:** ambos archivos abren correctamente y no contienen ningún dato real de clientes.

## Task 2.2 — Parser de Excel/CSV (TDD, lógica crítica) ✅ completada
- Función pura `parseReembolsosFile(buffer, tipo: "xlsx" | "csv"): ParseResult` en `lib/importacion/parser.ts`.
- `ParseResult` = `{ filasValidas: CasoImportado[], errores: ErrorFila[], filasDescartadas: number }`.
- Reglas (según spec 02): descartar filas sin `OT`, validar columnas obligatorias, validar `OT`/`Costo de diligencia` numéricos, normalizar nombres de columna (tildes, espacios, `N°`).
- **Tests primero** (usando el fixture de Task 2.1), cubriendo:
  1. Archivo válido completo → 15 filas válidas, 0 errores, 1 fila descartada (total).
  2. Falta una columna obligatoria → error claro, 0 filas insertadas.
  3. Una fila con `Costo de diligencia` no numérico → esa fila específica reporta error, el resto no se ve afectado por el error (pero igual se rechaza el archivo completo, ver spec 02).
  4. Fila sin `OT` → descartada, no cuenta como error.
  5. Archivo vacío (solo encabezados) → 0 filas válidas, 0 errores.
  6. CSV equivalente al XLSX → mismo resultado exacto.
- **Verificación:** `npm test` pasa con >90% cobertura de `parser.ts`.

## Task 2.3 — Server Action de importación ✅ completada
(Nota: la lógica se separó en `lib/importacion/procesar.ts`, testeable sin contexto de Clerk, con `app/importaciones/actions.ts` como wrapper delgado que autentica y resuelve el `usuarioId`. El test de integración corre contra la base Neon real de desarrollo — no hay DB de test separada — y limpia sus datos en `afterAll`.)
- Server Action (`app/importaciones/actions.ts`) que recibe el archivo subido, llama a `parseReembolsosFile`, y:
  - Si hay errores → retorna el reporte de errores sin tocar la base de datos.
  - Si es válido → crea `ImportacionExcel` + un `CasoReembolso` por fila válida (`folio` = `OT`, `estadoActual` = `Estado reembolso` o `"Pendiente"`, `datosImportados` = JSON con las 13 columnas) en una transacción de Prisma.
  - Requiere sesión de Clerk con rol `importador`.
- **Verificación:** test de integración (con una base de test o mock de Prisma) que sube el fixture y confirma 15 `CasoReembolso` creados + 1 `ImportacionExcel` con contadores correctos.

## Task 2.4 — UI de importación ✅ implementada (verificación manual pendiente, ver Task 2.5)
- Página `/importaciones` (protegida, rol `importador`): input de archivo `.xlsx`/`.csv` + botón "Importar".
- Muestra el resumen post-importación: filas importadas, errores (con detalle por fila), filas descartadas.
- **Verificación:** manual en navegador — subir el fixture anonimizado y confirmar que el resumen muestra 15 importados, 0 errores.

## Task 2.5 — Verificación end-to-end ✅ completada
Confirmado por el usuario en producción (refund-bank-tracker.vercel.app/importaciones): "Importación exitosa, Filas importadas: 15, Filas descartadas: 1".
- Subir el fixture real vía la UI desplegada (o local), confirmar en Prisma Studio (o una vista simple de listado) que los 15 casos existen con los datos correctos y la fila de totales no aparece.
- **Verificación:** ✅ manual, con captura/registro de que el flujo completo funciona de punta a punta.

---
**Orden de ejecución:** 2.0 → 2.1 → 2.2 (TDD) → 2.3 → 2.4 → 2.5. No se avanza a la siguiente sin que la anterior pase su verificación.
