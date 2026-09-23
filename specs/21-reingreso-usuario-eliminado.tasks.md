# Tasks — Spec 21: Reingreso de un usuario eliminado

## Task 21.0 — Re-vincular por email si no hay match por clerkId (TDD) ✅ completada
- `lib/usuarios.ts`: `getOrCreateUsuarioActual()` — busca por `clerkId`; si no existe, busca por `email` y actualiza el `clerkId` de ese registro; si tampoco existe, crea uno nuevo.
- **Tests primero:** un registro existente con el mismo `clerkId` solo se actualiza (no cambia su `id`); un registro con `clerkId` distinto pero mismo `email` se re-vincula (mismo `id`, `clerkId` actualizado); un email nunca visto crea un registro nuevo.

## Task 21.1 — Verificación end-to-end ✅ completada (alcance: tests automáticos)
El usuario decidió que los 3 tests contra la base real (registro nuevo, mismo clerkId, reingreso por email) alcanzan como verificación — no se probó con una cuenta real eliminada/recreada por ser disruptivo hacerlo solo para probar.
- En producción: eliminar un usuario de prueba, simular su reingreso (o esperar a que ocurra naturalmente) y confirmar que no hay error y que su historial sigue intacto.

---
**Orden de ejecución:** 21.0 → 21.1.
