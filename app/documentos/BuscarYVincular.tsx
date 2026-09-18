"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { buscarCasosAction, vincularManualAction } from "./actions";

interface CasoResultado {
  id: string;
  folio: string;
  nBoleta: string | null;
  conceptoGasto: string;
}

export function BuscarYVincular({ documentoId }: { documentoId: string }) {
  const [abierto, setAbierto] = useState(false);
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState<CasoResultado[]>([]);
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function buscar() {
    startTransition(async () => {
      const casos = await buscarCasosAction(query);
      setResultados(casos);
    });
  }

  function toggleSeleccion(id: string) {
    setSeleccionados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function vincular() {
    setError(null);
    startTransition(async () => {
      const resultado = await vincularManualAction(
        documentoId,
        Array.from(seleccionados)
      );
      if (!resultado.ok) setError(resultado.mensaje ?? "No se pudo vincular");
      else router.refresh();
    });
  }

  if (!abierto) {
    return (
      <button
        onClick={() => setAbierto(true)}
        className="text-blue-600 underline"
      >
        Vincular manualmente
      </button>
    );
  }

  return (
    <div className="mt-2 rounded border p-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por OT o N° boleta"
          className="flex-1 rounded border p-1.5 text-sm"
        />
        <button
          onClick={buscar}
          disabled={pending}
          className="rounded border px-3 py-1.5 text-sm disabled:opacity-50"
        >
          Buscar
        </button>
      </div>

      {resultados.length > 0 && (
        <ul className="mt-2 flex flex-col gap-1 text-sm">
          {resultados.map((c) => (
            <li key={c.id}>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={seleccionados.has(c.id)}
                  onChange={() => toggleSeleccion(c.id)}
                />
                OT {c.folio} — {c.conceptoGasto}
                {c.nBoleta ? ` — boleta ${c.nBoleta}` : ""}
              </label>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="mt-2 text-xs text-red-700">{error}</p>}

      <div className="mt-2 flex gap-2">
        <button
          onClick={vincular}
          disabled={pending || seleccionados.size === 0}
          className="rounded bg-black px-3 py-1.5 text-sm text-white disabled:opacity-50"
        >
          Vincular seleccionados
        </button>
        <button
          onClick={() => setAbierto(false)}
          className="rounded border px-3 py-1.5 text-sm"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
