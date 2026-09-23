# Spec 21 — Reingreso de un usuario eliminado

## Objetivo
Permitir que alguien cuya cuenta fue eliminada (spec 20) pueda volver a registrarse con el mismo email sin que la app falle, re-vinculando su registro histórico en vez de duplicarlo.

## Alcance
- `getOrCreateUsuarioActual()`: al no encontrar un `Usuario` por `clerkId` (cuenta de Clerk nueva), busca por `email` antes de intentar crear uno. Si lo encuentra, actualiza ese registro con el nuevo `clerkId` (y nombre/roles actuales) en vez de fallar por email duplicado. Si tampoco hay coincidencia por email, crea uno nuevo (comportamiento actual sin cambios).
- El registro reactivado conserva su `id` interno original, por lo que todo el historial (`HistorialEstado`, `ImportacionExcel`, etc.) generado antes de la eliminación sigue asociado correctamente a la misma persona.
- Como al eliminar la cuenta no se tocan los roles del registro interno (spec 20 no los borra explícitamente, pero tampoco los usa Clerk al recrear la cuenta), la persona reingresa sin roles asignados — un admin debe volver a asignárselos desde `/admin/usuarios`, igual que con cualquier usuario nuevo.

## Fuera de alcance
- No se restauran automáticamente los roles que tenía antes de ser eliminado — decisión deliberada, para que un admin decida conscientemente si esa persona debe recuperar el mismo acceso.
- No se cambia el flujo para un usuario que nunca existió (sigue creándose un registro nuevo, como siempre).

## Criterios de aceptación
- Un usuario eliminado que vuelve a registrarse con el mismo email no ve ningún error; su registro interno se re-vincula al nuevo `clerkId`.
- El historial de casos/importaciones que generó antes de ser eliminado sigue mostrando su email correctamente después de reingresar.
- Reingresa sin roles (visible en `/admin/usuarios` con todos los checkboxes vacíos).
- Un usuario genuinamente nuevo (email nunca visto) sigue creándose normalmente.

## Dependencias
- Spec 20 (eliminar usuario).

## Notas
- Tests para `getOrCreateUsuarioActual`: reingreso por email tras "eliminación" (simulada con un `clerkId` distinto) reutiliza el mismo registro; un usuario nuevo se crea normal; un usuario existente con el mismo `clerkId` de siempre solo se actualiza.
