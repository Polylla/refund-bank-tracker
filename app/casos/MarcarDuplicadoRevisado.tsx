"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { marcarDuplicadoRevisadoAction } from "./actions";

export function MarcarDuplicadoRevisado({ casoId }: { casoId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function marcar() {
    setError(null);
    startTransition(async () => {
      const resultado = await marcarDuplicadoRevisadoAction(casoId);
      if (!resultado.ok) setError(resultado.mensaje ?? "No se pudo marcar");
      else router.refresh();
    });
  }

  return (
    <div>
      <button
        onClick={marcar}
        disabled={pending}
        className="rounded border border-amber-600 px-2 py-1 text-xs font-medium text-amber-700 hover:bg-amber-50 disabled:opacity-50 dark:text-amber-500 dark:hover:bg-amber-950"
      >
        Posible duplicado — marcar revisado
      </button>
      {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
    </div>
  );
}
