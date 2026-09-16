"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ESTADOS } from "@/lib/estados/estados";
import { cambiarEstadoAction } from "./actions";

interface Props {
  casoId: string;
  estadoActual: string;
}

export function EstadoSelector({ casoId, estadoActual }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function onChange(nuevoEstado: string) {
    setError(null);
    startTransition(async () => {
      const resultado = await cambiarEstadoAction(casoId, nuevoEstado);
      if (!resultado.ok) setError(resultado.mensaje ?? "No se pudo cambiar");
      else router.refresh();
    });
  }

  return (
    <div>
      <select
        value={estadoActual}
        disabled={pending}
        onChange={(e) => onChange(e.target.value)}
        className="rounded border px-2 py-1 text-sm disabled:opacity-50"
      >
        {ESTADOS.map((estado) => (
          <option key={estado} value={estado}>
            {estado}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
    </div>
  );
}
