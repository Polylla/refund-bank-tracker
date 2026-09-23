# Spec 20 — Eliminar usuario

## Objetivo
Permitir dar de baja por completo a un usuario (ya no puede iniciar sesión), sin romper el historial/auditoría de lo que hizo mientras tuvo acceso.

## Alcance
- Botón "Eliminar usuario" en `/admin/usuarios`, con confirmación explícita (mismo patrón que eliminar documento/importación).
- Al confirmar, se borra la cuenta de Clerk (`clerkClient().users.deleteUser`) — la persona ya no puede iniciar sesión bajo ningún concepto.
- El registro interno (`Usuario` en Postgres: email, nombre) **no se borra** — queda como referencia histórica para que `HistorialEstado`, `ImportacionExcel`, `Notificacion`, etc. sigan mostrando quién hizo cada cosa, igual que hoy se ve el email de un usuario en el historial de un caso.
- Un admin no puede eliminarse a sí mismo (para no quedar la app sin ningún admin por accidente) — el botón se oculta u rechaza en su propia fila.
- Mismo permiso que editar roles: solo `admin`.

## Fuera de alcance
- No se borra el registro `Usuario` de Postgres ni sus referencias históricas — solo la cuenta de Clerk (acceso).
- No se reasignan ni transfieren las importaciones/casos que esa persona haya tocado — quedan igual, solo que el email de un usuario que ya no existe en Clerk sigue apareciendo como texto histórico.
- No se agrega una confirmación por email ni un período de gracia — es inmediato, como el resto de los borrados de la app.

## Criterios de aceptación
- Eliminar un usuario borra su cuenta de Clerk; esa persona ya no puede iniciar sesión.
- El historial de casos/importaciones que esa persona haya generado sigue mostrando su email correctamente.
- Un admin no puede eliminarse a sí mismo.
- Un usuario sin rol `admin` no puede eliminar cuentas.

## Dependencias
- Spec 10 (roles, `/admin/usuarios`, gestión vía Clerk).

## Notas
- Tests para `eliminarUsuario` (mockeando `@clerk/backend`): llama a `deleteUser` con el id correcto; rechaza si `clerkUserId` es el mismo que el del admin que ejecuta la acción.
