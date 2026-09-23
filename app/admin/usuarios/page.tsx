import { getOrCreateUsuarioActual } from "@/lib/usuarios";
import { listarUsuariosConRoles } from "@/lib/usuarios/gestionRoles";
import { RolesUsuarioRow } from "./RolesUsuarioRow";

export default async function AdminUsuariosPage() {
  const { usuario, roles } = await getOrCreateUsuarioActual();

  if (!roles.includes("admin")) {
    return (
      <div className="flex-1 p-8 max-w-3xl mx-auto">
        <p className="text-red-700">No tienes permiso para ver esta página.</p>
      </div>
    );
  }

  const usuarios = await listarUsuariosConRoles();

  return (
    <div className="flex-1 p-8 max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold">Administración de usuarios</h1>
      <p className="mt-1 text-sm text-gray-500">
        Los cambios de rol se aplican de inmediato; el usuario los ve reflejados en su próximo login.
      </p>
      <div className="mt-6 flex flex-col gap-3">
        {usuarios.map((u) => (
          <RolesUsuarioRow
            key={u.clerkUserId}
            usuario={u}
            esUsuarioActual={u.clerkUserId === usuario.clerkId}
          />
        ))}
      </div>
    </div>
  );
}
