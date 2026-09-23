"use server";

import { revalidatePath } from "next/cache";
import { getOrCreateUsuarioActual, requireRole } from "@/lib/usuarios";
import {
  actualizarRolesUsuario,
  eliminarUsuario,
  type ResultadoActualizarRoles,
  type ResultadoEliminarUsuario,
} from "@/lib/usuarios/gestionRoles";

export async function actualizarRolesAction(
  clerkUserId: string,
  roles: string[]
): Promise<ResultadoActualizarRoles> {
  const { roles: rolesActual } = await getOrCreateUsuarioActual();
  requireRole(rolesActual, "admin");

  const resultado = await actualizarRolesUsuario(clerkUserId, roles);
  if (resultado.ok) revalidatePath("/admin/usuarios");
  return resultado;
}

export async function eliminarUsuarioAction(
  clerkUserId: string
): Promise<ResultadoEliminarUsuario> {
  const { usuario, roles } = await getOrCreateUsuarioActual();
  requireRole(roles, "admin");

  if (clerkUserId === usuario.clerkId) {
    return { ok: false, mensaje: "No podés eliminar tu propia cuenta" };
  }

  const resultado = await eliminarUsuario(clerkUserId);
  if (resultado.ok) revalidatePath("/admin/usuarios");
  return resultado;
}
