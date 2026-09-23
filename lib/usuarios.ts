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
  const email = user.primaryEmailAddress?.emailAddress ?? "";
  const nombre = user.fullName;

  const existentePorClerkId = await prisma.usuario.findUnique({
    where: { clerkId: user.id },
  });
  if (existentePorClerkId) {
    const usuario = await prisma.usuario.update({
      where: { id: existentePorClerkId.id },
      data: { email, nombre, roles },
    });
    return { usuario, roles: rolesClerk };
  }

  // No hay registro con este clerkId — puede ser un usuario nuevo, o
  // alguien cuya cuenta de Clerk fue eliminada (spec 20) y se volvió a
  // registrar con el mismo email. En ese caso se re-vincula el mismo
  // registro histórico en vez de fallar por email duplicado.
  const existentePorEmail = email
    ? await prisma.usuario.findUnique({ where: { email } })
    : null;
  if (existentePorEmail) {
    const usuario = await prisma.usuario.update({
      where: { id: existentePorEmail.id },
      data: { clerkId: user.id, nombre, roles },
    });
    return { usuario, roles: rolesClerk };
  }

  const usuario = await prisma.usuario.create({
    data: { clerkId: user.id, email, nombre, roles },
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
