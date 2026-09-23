# Tasks — Spec 19: Ingreso manual de casos

## Task 19.0 — Función de armado de CSV + Server Action (TDD) ✅ completada
- `lib/importacion/casoManual.ts`: `crearCasoManual(datos, usuarioId)` — recibe un objeto con los campos del formulario, arma el CSV (`Papa.unparse`, ya es dependencia) con las cabeceras canónicas de `COLUMNAS`, y llama a `procesarImportacion(buffer, "Ingreso manual - <fecha ISO>.csv", usuarioId)`.
- **Tests primero:** con datos válidos crea 1 `CasoReembolso`; con RUT inválido lo rechaza (mismo mensaje que importar); con OT+Concepto ya existente, la fila termina en `FilaEnRevision` en vez de crear un caso nuevo.

## Task 19.1 — Página `/casos/nuevo` + Server Action ✅ implementada (verificación manual pendiente)
- `app/casos/nuevo/page.tsx`: formulario con los campos de `COLUMNAS` (obligatorios/opcionales según corresponda), protegido por rol (`importador`/`revisor`).
- `app/casos/nuevo/actions.ts`: `crearCasoManualAction(formData)`, llama a `crearCasoManual`.
- Botón "Nuevo caso" en `/casos`.
- **Verificación:** manual en navegador — crear un caso de prueba y confirmar que aparece en `/casos`.

## Task 19.2 — Verificación end-to-end
- En producción: crear un caso manual válido, uno con RUT inválido (debe rechazarse), y uno que duplique una OT+Concepto existente (debe ir a revisión). Confirmar que la importación queda visible en `/importaciones` y se puede eliminar.

---
**Orden de ejecución:** 19.0 → 19.1 → 19.2.
