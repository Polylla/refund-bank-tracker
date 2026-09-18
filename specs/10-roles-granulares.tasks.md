# Tasks — Spec 10: Roles más granulares

## Task 10.0 — Modelo: roles ADMIN y VISOR ✅ completada
- Prisma: agregar `ADMIN` y `VISOR` a `enum Rol`.
- `lib/roles.ts`: `Role` pasa a `"importador" | "revisor" | "admin" | "visor"`; `getRoles` acepta los 4 valores.
- `lib/usuarios.ts` (`getOrCreateUsuarioActual`): corregir el mapeo Clerk → Prisma para mapear los 4 roles correctamente (hoy cualquier rol que no sea "importador" se mapea a `REVISOR`, lo cual es incorrecto una vez que existan más de 2 roles).
- **Verificación:** migración aplica sin pérdida de datos; usuarios existentes conservan sus roles actuales.

## Task 10.1 — "admin incluye todo" (TDD) ✅ completada
(De paso se agregó `puedeActuar(roles)`, que se usará en Task 10.4, en el mismo archivo.)
- `lib/usuarios.ts`: `requireRole` y `requireAnyRole` pasan automáticamente si `roles.includes("admin")`, sin necesidad de tocar cada punto de uso existente (`app/importaciones/actions.ts`, `app/documentos/actions.ts`, `app/casos/actions.ts`, `app/revision/actions.ts` quedan igual).
- **Tests primero:** un usuario con solo `admin` pasa `requireRole(roles, "revisor")` y `requireRole(roles, "importador")`; un usuario con solo `visor` sigue siendo rechazado por ambos; el comportamiento existente (sin `admin`) no cambia.

## Task 10.2 — Gestión de roles vía Clerk (TDD) ✅ completada
- `lib/usuarios/gestionRoles.ts`: `listarUsuariosConRoles()` (lista usuarios de Clerk vía `@clerk/backend`, con su email y roles actuales de `publicMetadata`) y `actualizarRolesUsuario(clerkUserId, roles)` (valida que todos los roles sean válidos, actualiza `publicMetadata.roles` en Clerk).
- **Tests primero (mockeando `@clerk/backend`):** `actualizarRolesUsuario` rechaza un rol inválido; con roles válidos, llama a `updateUserMetadata` con el payload correcto.

## Task 10.3 — Página `/admin/usuarios` + Server Action ✅ implementada (verificación manual pendiente hasta Task 10.5, cuando exista un admin real)
- `app/admin/usuarios/page.tsx` (protegida, `requireRole(roles, "admin")`): tabla de usuarios (email, roles actuales) con checkboxes por rol y botón guardar por fila.
- `app/admin/usuarios/actions.ts`: `actualizarRolesAction(clerkUserId, roles)`, protegida con `requireRole(roles, "admin")`.
- Enlace "Administración" en `NavLinks`, visible solo si el usuario tiene rol `admin` (requiere pasar los roles del usuario actual desde `layout.tsx`, hoy `NavLinks` no los recibe).
- **Verificación:** manual en navegador — un admin cambia el rol de un usuario y el cambio se refleja en su próximo login.

## Task 10.4 — UI de solo lectura para `visor` ✅ implementada (verificación manual pendiente hasta Task 10.6)
(`/importaciones/page.tsx` se separó en un wrapper de servidor + `ImportarForm.tsx` cliente, ya que antes toda la página era client component y no se podía consultar el rol del usuario ahí.)
- Helper `puedeActuar(roles)` en `lib/usuarios.ts` (true si tiene `importador`, `revisor` o `admin`).
- Ocultar (no solo deshabilitar) tras `puedeActuar(roles)`: formulario de importar (`/importaciones`), formulario de subir/vincular documento (`/documentos`), selector de cambiar estado y botón "marcar revisado" (`/casos`), botones "Aprobar"/"Descartar" (`/revision`).
- **Verificación:** manual en navegador — un usuario con solo `visor` ve todas las páginas con datos reales pero sin ninguno de esos controles.

## Task 10.5 — Bootstrap del primer admin ✅ completada
El usuario real (phidalgoamestica@gmail.com) ya tiene el rol `admin` asignado.
- Extender `scripts/assign-role.mjs` para aceptar `admin` y `visor` como roles válidos.
- **Verificación:** correr el script una vez sobre el usuario real para asignarle `admin`, confirmar que puede entrar a `/admin/usuarios`.

## Task 10.6 — Verificación end-to-end
- En producción: el usuario admin gestiona roles desde `/admin/usuarios`; se crea o reutiliza un segundo usuario de prueba con solo `visor` y se confirma que ve todo pero no puede accionar nada (ni desde la UI ni invocando las Server Actions directamente).

---
**Orden de ejecución:** 10.0 → 10.1 → 10.2 → 10.3 → 10.4 → 10.5 → 10.6.
