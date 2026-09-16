export type Role = "importador" | "revisor";

export function getRoles(publicMetadata: unknown): Role[] {
  const roles = (publicMetadata as { roles?: unknown } | null)?.roles;
  if (!Array.isArray(roles)) return [];
  return roles.filter(
    (r): r is Role => r === "importador" || r === "revisor"
  );
}
