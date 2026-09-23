# Tasks — Spec 20: Eliminar usuario

## Task 20.0 — eliminarUsuario (TDD) ✅ completada
- `lib/usuarios/gestionRoles.ts`: `eliminarUsuario(clerkUserId)` — llama a `clerkClient().users.deleteUser(clerkUserId)`.
- **Tests primero (mockeando `@clerk/backend`/`@clerk/nextjs/server`):** llama a `deleteUser` con el id correcto; retorna `ok: false` si falla la llamada a Clerk.

## Task 20.1 — Server Action + botón en `/admin/usuarios`
- `app/admin/usuarios/actions.ts`: `eliminarUsuarioAction(clerkUserId)` — `requireRole(roles, "admin")`, rechaza si `clerkUserId === usuario.clerkId` (no autoeliminarse), llama a `eliminarUsuario`.
- `EliminarUsuarioBoton.tsx` (confirmación inline, mismo patrón que `EliminarDocumentoBoton`), oculto en la propia fila del admin logueado.
- **Verificación:** manual — eliminar un usuario de prueba y confirmar que no puede volver a iniciar sesión.

## Task 20.2 — Verificación end-to-end
- En producción: eliminar un usuario de prueba, confirmar que desaparece de `/admin/usuarios` y que el historial de casos que haya tocado sigue mostrando su email.

---
**Orden de ejecución:** 20.0 → 20.1 → 20.2.
