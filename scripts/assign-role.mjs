// Utilidad de administración: asigna roles a un usuario de Clerk por email.
// Desde Spec 10, la gestión normal de roles se hace en /admin/usuarios;
// este script solo hace falta para asignar el primer admin (bootstrap).
// Uso: node --env-file=.env.local scripts/assign-role.mjs correo@ejemplo.com admin
import { createClerkClient } from "@clerk/backend";

const [email, ...roles] = process.argv.slice(2);

if (!email || roles.length === 0) {
  console.error(
    "Uso: node --env-file=.env.local scripts/assign-role.mjs <email> <rol1> [rol2...]"
  );
  process.exit(1);
}

const rolesValidos = ["importador", "revisor", "admin", "visor"];
for (const r of roles) {
  if (!rolesValidos.includes(r)) {
    console.error(`Rol inválido: ${r}. Roles válidos: ${rolesValidos.join(", ")}`);
    process.exit(1);
  }
}

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

const { data: usuarios } = await clerkClient.users.getUserList({
  emailAddress: [email],
});

if (usuarios.length === 0) {
  console.error(`No se encontró ningún usuario con email ${email}`);
  process.exit(1);
}

const usuario = usuarios[0];
await clerkClient.users.updateUserMetadata(usuario.id, {
  publicMetadata: { roles },
});

console.log(`OK: ${email} (${usuario.id}) ahora tiene roles: ${roles.join(", ")}`);
