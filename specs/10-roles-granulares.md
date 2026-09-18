# Spec 10 — Roles más granulares

## Objetivo
Agregar dos roles nuevos (`admin`, `visor`) a los existentes (`importador`, `revisor`), con una UI dentro de la app para gestionar roles de usuarios (hoy solo se puede vía script CLI), y una experiencia de solo lectura real para `visor`.

## Alcance
- **Rol `admin`:** incluye automáticamente todos los permisos de `importador` + `revisor`, y además puede gestionar los roles de cualquier usuario desde la app. No es necesario asignarle también `importador`/`revisor` por separado.
- **Rol `visor`:** puede ver todas las páginas (dashboard, casos, documentos, importaciones, notificaciones, revisión) con los mismos datos que cualquier otro usuario autenticado, pero no puede ejecutar ninguna acción de escritura (importar, cambiar estado, aprobar/descartar fila, marcar duplicado revisado, subir documento, vincular manualmente). Los controles de esas acciones se ocultan (no solo se bloquean en el servidor) para que la experiencia sea clara.
- **Mecanismo de "admin incluye todo":** `requireRole`/`requireAnyRole` (`lib/usuarios.ts`) pasan automáticamente si el usuario tiene `admin` en sus roles, sin tocar cada punto de uso existente.
- **Nueva página `/admin/usuarios`** (protegida, requiere rol `admin`): lista los usuarios de Clerk (email, roles actuales) con checkboxes para editar sus roles (`importador`, `revisor`, `visor`, `admin`) y guardar. Reutiliza la misma vía que hoy usa `scripts/assign-role.mjs` (actualizar `publicMetadata.roles` en Clerk vía `@clerk/backend`), no una tabla separada de permisos.
- **Primer admin:** se asigna una única vez vía CLI, extendiendo `scripts/assign-role.mjs` para aceptar `admin` y `visor` como roles válidos (además de `importador`/`revisor`). De ahí en adelante, la gestión de roles se hace desde `/admin/usuarios`.
- Enlace "Administración" en la navegación, visible solo para usuarios con rol `admin`.

## Fuera de alcance
- No se crea una tabla de permisos granulares por acción individual (ej. "puede exportar pero no importar") — son 4 roles fijos, como hoy son 2.
- No se restringe la exportación de Excel a un rol específico (queda como está: cualquier usuario autenticado puede exportar) — el usuario no lo pidió en esta ronda.
- No se agrega invitación de usuarios nuevos por email desde la app — `/admin/usuarios` gestiona roles de usuarios que ya existen en Clerk (ya se registraron al menos una vez), no crea cuentas.
- No se cambia el modelo de "cualquier estado puede pasar a cualquier otro" (spec 04) ni ninguna otra regla de negocio existente.

## Criterios de aceptación
- Un usuario con rol `admin` puede ejecutar cualquier acción que hoy requiere `importador` o `revisor`, sin tener esos roles asignados explícitamente.
- Un usuario con rol `admin` puede entrar a `/admin/usuarios`, ver la lista de usuarios de Clerk con sus roles actuales, y cambiar los roles de otro usuario; el cambio se refleja (en Clerk y, en el siguiente login de ese usuario, en `Usuario.roles`).
- Un usuario sin rol `admin` que intenta acceder a `/admin/usuarios` es rechazado.
- Un usuario con únicamente rol `visor`: ve el dashboard, casos, documentos, importaciones, notificaciones y revisión con los datos reales, pero no ve los controles de importar, cambiar estado, aprobar/descartar, marcar duplicado revisado, subir documento ni vincular documento manualmente.
- Un usuario con únicamente rol `visor` que de todos modos invocara una Server Action de escritura directamente (bypassing la UI) es rechazado por `requireRole`/`requireAnyRole`, igual que hoy pasa con cualquier usuario sin el rol correspondiente.

## Dependencias
- Spec 01 (modelo `Usuario.roles`, autenticación con Clerk).
- Decisión #5 de `00-decisiones.md` (multi-usuario con roles).

## Notas
- No requiere TDD tan estricto como parseo/duplicados/matching (es control de acceso, no lógica de negocio crítica de datos), pero sí tests unitarios para `requireRole`/`requireAnyRole` con el bypass de `admin`, y tests de la función que actualiza roles vía Clerk (mockeando `@clerk/backend`).
- `lib/roles.ts` (`Role` type + `getRoles`) y `lib/usuarios.ts` (mapeo a enum `Rol` de Prisma) deben actualizarse para los 2 roles nuevos; el mapeo actual en `getOrCreateUsuarioActual` tiene una simplificación que solo distingue `importador` de "no importador" — hay que corregirlo para mapear los 4 roles correctamente.
