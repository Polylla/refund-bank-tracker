"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { actualizarRolesAction } from "./actions";
import type { Role } from "@/lib/roles";
import type { UsuarioConRoles } from "@/lib/usuarios/gestionRoles";

const ROLES_DISPONIBLES: Role[] = ["importador", "revisor", "admin", "visor"];

export function RolesUsuarioRow({ usuario }: { usuario: UsuarioConRoles }) {
  const [roles, setRoles] = useState<Role[]>(usuario.roles);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);
  const router = useRouter();

  function toggle(rol: Role) {
    setGuardado(false);
    setRoles((prev) =>
      prev.includes(rol) ? prev.filter((r) => r !== rol) : [...prev, rol]
    );
  }

  function guardar() {
    setError(null);
    setGuardado(false);
    startTransition(async () => {
      const resultado = await actualizarRolesAction(usuario.clerkUserId, roles);
      if (!resultado.ok) {
        setError(resultado.mensaje ?? "No se pudo guardar");
      } else {
        setGuardado(true);
        router.refresh();
      }
    });
  }

  return (
    <div className="rounded-lg border p-4 text-sm">
      <p className="font-medium">{usuario.email}</p>
      <div className="mt-2 flex flex-wrap gap-4">
        {ROLES_DISPONIBLES.map((rol) => (
          <label key={rol} className="flex items-center gap-1.5">
            <input
              type="checkbox"
              checked={roles.includes(rol)}
              onChange={() => toggle(rol)}
            />
            {rol}
          </label>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={guardar}
          disabled={pending}
          className="rounded bg-primary px-3 py-1.5 font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          Guardar
        </button>
        {guardado && <span className="text-green-700">Guardado</span>}
        {error && <span className="text-red-700">{error}</span>}
      </div>
    </div>
  );
}
