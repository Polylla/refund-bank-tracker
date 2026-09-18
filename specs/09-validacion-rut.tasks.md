# Tasks — Spec 09: Validación de RUT

## Task 9.0 — Validador de RUT chileno (TDD) ✅ completada
- `lib/importacion/rut.ts`: `normalizarRut(raw: string): string | null` — acepta los formatos comunes (con/sin puntos, con/sin guión, `k`/`K`, espacios), valida el dígito verificador (módulo 11), y retorna el RUT normalizado `NNNNNNNN-D` o `null` si el formato es irreconocible o el dígito verificador no coincide.
- **Tests primero:** RUTs válidos en cada formato de entrada soportado → normalizan igual; dígito verificador `k`/`K` → normaliza a minúscula; dígito verificador incorrecto → `null`; formato irreconocible (letras, longitud imposible, vacío) → `null`.

## Task 9.1 — Integración en el parser (TDD) ✅ completada
(Hallazgo: los RUT de los fixtures de test — `tests/fixtures/reembolsos-ejemplo.{csv,xlsx}` y los CSV inline en `revision.test.ts`/`parser.test.ts` — eran secuenciales inventados sin dígito verificador real válido. Se corrigieron a RUTs matemáticamente válidos, mismo cuerpo numérico, para no romper los tests existentes al activar la validación real.)
- Agregar `type: "rut"` a `ColumnDef` (`lib/importacion/columns.ts`) y usarlo en la definición de la columna `rut`.
- `lib/importacion/parser.ts`: en `parseValue`, el caso `"rut"` llama a `normalizarRut`; si retorna `null`, agrega error `"RUT" tiene un formato o dígito verificador inválido` (fila rechazada, mismo comportamiento que otros errores de validación). Si es válido, el valor normalizado reemplaza el original tanto en el `CasoImportado` como en `datosImportados.RUT`.
- **Tests primero:** fila con RUT válido en distintos formatos se importa con el RUT normalizado; fila con RUT inválido se rechaza y aparece en `errores`; el resto de las filas del archivo no se ven afectadas por el rechazo de una fila puntual.

## Task 9.2 — Chequeo de solo lectura sobre datos reales ✅ completada
Resultado (2026-09-18): 0 de 63 casos reales tienen RUT inválido — no se requiere ninguna corrección.
- Script puntual (`scripts/chequear-ruts.mjs`, no persistente) que recorre los `CasoReembolso` reales, extrae `datosImportados.RUT` de cada uno, y reporta por consola cuáles no pasan `normalizarRut` — sin modificar nada.
- **Verificación:** correr el script contra producción y revisar el resultado con el usuario; si aparece algún RUT inválido, se decide en conjunto qué hacer (no se corrige automáticamente).

## Task 9.3 — Verificación end-to-end
- Reimportar (o importar un archivo de prueba) con al menos una fila con RUT inválido a propósito y confirmar que esa fila aparece en los errores de importación y no se crea el caso.

---
**Orden de ejecución:** 9.0 → 9.1 → 9.2 → 9.3.
