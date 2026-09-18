"use server";

import { revalidatePath } from "next/cache";
import { getOrCreateUsuarioActual, requireRole } from "@/lib/usuarios";
import {
  actualizarRolesUsuario,
  type ResultadoActualizarRoles,
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
