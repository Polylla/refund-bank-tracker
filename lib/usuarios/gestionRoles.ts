import { clerkClient } from "@clerk/nextjs/server";
import { esRoleValido, getRoles, type Role } from "../roles";

export interface UsuarioConRoles {
  clerkUserId: string;
  email: string;
  roles: Role[];
}

export async function listarUsuariosConRoles(): Promise<UsuarioConRoles[]> {
  const client = await clerkClient();
  const { data: usuarios } = await client.users.getUserList({ limit: 100 });

  return usuarios.map((usuario) => ({
    clerkUserId: usuario.id,
    email:
      usuario.primaryEmailAddress?.emailAddress ??
      usuario.emailAddresses[0]?.emailAddress ??
      "",
    roles: getRoles(usuario.publicMetadata),
  }));
}

export interface ResultadoActualizarRoles {
  ok: boolean;
  mensaje?: string;
}

export async function actualizarRolesUsuario(
  clerkUserId: string,
  roles: string[]
): Promise<ResultadoActualizarRoles> {
  const rolInvalido = roles.find((r) => !esRoleValido(r));
  if (rolInvalido) {
    return { ok: false, mensaje: `Rol inválido: ${rolInvalido}` };
  }

  const client = await clerkClient();
  await client.users.updateUserMetadata(clerkUserId, {
    publicMetadata: { roles },
  });

  return { ok: true };
}

export interface ResultadoEliminarUsuario {
  ok: boolean;
  mensaje?: string;
}

export async function eliminarUsuario(
  clerkUserId: string
): Promise<ResultadoEliminarUsuario> {
  const client = await clerkClient();
  try {
    await client.users.deleteUser(clerkUserId);
  } catch {
    return { ok: false, mensaje: "No se pudo eliminar la cuenta" };
  }
  return { ok: true };
}
