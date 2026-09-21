"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { eliminarDocumentoAction } from "./actions";

export function EliminarDocumentoBoton({ documentoId }: { documentoId: string }) {
  const [confirmando, setConfirmando] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function eliminar() {
    setError(null);
    startTransition(async () => {
      const resultado = await eliminarDocumentoAction(documentoId);
      if (!resultado.ok) setError(resultado.mensaje ?? "No se pudo eliminar");
      else router.refresh();
    });
  }

  if (!confirmando) {
    return (
      <button
        onClick={() => setConfirmando(true)}
        className="text-red-700 underline"
      >
        Eliminar
      </button>
    );
  }

  return (
    <span className="inline-flex items-center gap-2">
      <span className="text-red-700">¿Eliminar este documento?</span>
      <button
        onClick={eliminar}
        disabled={pending}
        className="rounded bg-red-700 px-2 py-0.5 text-xs font-medium text-white disabled:opacity-50"
      >
        Sí, eliminar
      </button>
      <button
        onClick={() => setConfirmando(false)}
        disabled={pending}
        className="rounded border px-2 py-0.5 text-xs disabled:opacity-50"
      >
        Cancelar
      </button>
      {error && <span className="text-xs text-red-700">{error}</span>}
    </span>
  );
}
