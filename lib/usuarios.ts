import { currentUser } from "@clerk/nextjs/server";
import { Rol } from "@prisma/client";
import { prisma } from "./prisma";
import { getRoles, type Role } from "./roles";

const ROL_CLERK_A_PRISMA: Record<Role, Rol> = {
  importador: Rol.IMPORTADOR,
  revisor: Rol.REVISOR,
  admin: Rol.ADMIN,
  visor: Rol.VISOR,
};

export async function getOrCreateUsuarioActual() {
  const user = await currentUser();
  if (!user) throw new Error("No autenticado");

  const rolesClerk = getRoles(user.publicMetadata);
  const roles = rolesClerk.map((r) => ROL_CLERK_A_PRISMA[r]);

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
  if (roles.includes("admin")) return;
  if (!roles.includes(rol)) {
    throw new Error(`Requiere rol ${rol}`);
  }
}

export function requireAnyRole(roles: Role[], rolesPermitidos: Role[]) {
  if (roles.includes("admin")) return;
  if (!rolesPermitidos.some((r) => roles.includes(r))) {
    throw new Error(`Requiere alguno de estos roles: ${rolesPermitidos.join(", ")}`);
  }
}

export function puedeActuar(roles: Role[]): boolean {
  return roles.includes("importador") || roles.includes("revisor") || roles.includes("admin");
}
