"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { aprobarFilaAction, descartarFilaAction } from "./actions";

interface Props {
  filaId: string;
  folio: string;
  conceptoGasto: string;
  datosActuales: Record<string, unknown>;
  datosNuevos: Record<string, unknown>;
}

export function FilaRevisionCard({
  filaId,
  folio,
  conceptoGasto,
  datosActuales,
  datosNuevos,
}: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function aprobar() {
    setError(null);
    startTransition(async () => {
      const resultado = await aprobarFilaAction(filaId);
      if (!resultado.ok) setError(resultado.mensaje ?? "No se pudo aprobar");
      else router.refresh();
    });
  }

  function descartar() {
    setError(null);
    startTransition(async () => {
      const resultado = await descartarFilaAction(filaId);
      if (!resultado.ok) setError(resultado.mensaje ?? "No se pudo descartar");
      else router.refresh();
    });
  }

  return (
    <div className="rounded border p-4 text-sm">
      <p className="font-medium">
        OT {folio} — {conceptoGasto}
      </p>
      <div className="mt-2 grid grid-cols-2 gap-4">
        <div>
          <p className="font-medium text-gray-500">Caso existente</p>
          <pre className="whitespace-pre-wrap text-xs">
            {JSON.stringify(datosActuales, null, 2)}
          </pre>
        </div>
        <div>
          <p className="font-medium text-gray-500">Datos nuevos (reimportación)</p>
          <pre className="whitespace-pre-wrap text-xs">
            {JSON.stringify(datosNuevos, null, 2)}
          </pre>
        </div>
      </div>
      {error && <p className="mt-2 text-red-700">{error}</p>}
      <div className="mt-3 flex gap-2">
        <button
          onClick={aprobar}
          disabled={pending}
          className="rounded bg-black px-3 py-1.5 text-white disabled:opacity-50"
        >
          Aprobar
        </button>
        <button
          onClick={descartar}
          disabled={pending}
          className="rounded border px-3 py-1.5 disabled:opacity-50"
        >
          Descartar
        </button>
      </div>
    </div>
  );
}
