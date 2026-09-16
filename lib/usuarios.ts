import { currentUser } from "@clerk/nextjs/server";
import { Rol } from "@prisma/client";
import { prisma } from "./prisma";
import { getRoles, type Role } from "./roles";

export async function getOrCreateUsuarioActual() {
  const user = await currentUser();
  if (!user) throw new Error("No autenticado");

  const rolesClerk = getRoles(user.publicMetadata);
  const roles = rolesClerk.map((r) =>
    r === "importador" ? Rol.IMPORTADOR : Rol.REVISOR
  );

  const usuario = await prisma.usuario.upsert({
    where: { clerkId: user.id },
    update: {
      email: user.primaryEmailAddress?.emailAddress ?? "",
      nombre: user.fullName,
      roles,
    },
    create: {
      clerkId: user.id,
      email: user.primaryEmailAddress?.emailAddress ?? "",
      nombre: user.fullName,
      roles,
    },
  });

  return { usuario, roles: rolesClerk };
}

export function requireRole(roles: Role[], rol: Role) {
  if (!roles.includes(rol)) {
    throw new Error(`Requiere rol ${rol}`);
  }
}
