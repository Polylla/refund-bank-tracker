export type Role = "importador" | "revisor" | "admin" | "visor";

const ROLES_VALIDOS: Role[] = ["importador", "revisor", "admin", "visor"];

export function esRoleValido(valor: unknown): valor is Role {
  return ROLES_VALIDOS.includes(valor as Role);
}

export function getRoles(publicMetadata: unknown): Role[] {
  const roles = (publicMetadata as { roles?: unknown } | null)?.roles;
  if (!Array.isArray(roles)) return [];
  return roles.filter(esRoleValido);
}
