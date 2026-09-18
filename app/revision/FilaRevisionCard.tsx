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

function formatValor(v: unknown): string {
  if (v === null || v === undefined || v === "") return "—";
  return String(v);
}

function DiffTable({
  datosActuales,
  datosNuevos,
}: {
  datosActuales: Record<string, unknown>;
  datosNuevos: Record<string, unknown>;
}) {
  const claves = Array.from(
    new Set([...Object.keys(datosActuales), ...Object.keys(datosNuevos)])
  );

  return (
    <table className="w-full text-xs">
      <thead>
        <tr className="text-left text-gray-500">
          <th className="pb-1.5 pr-3 font-medium">Campo</th>
          <th className="pb-1.5 pr-3 font-medium">Caso existente</th>
          <th className="pb-1.5 font-medium">Datos nuevos</th>
        </tr>
      </thead>
      <tbody>
        {claves.map((clave) => {
          const actual = formatValor(datosActuales[clave]);
          const nuevo = formatValor(datosNuevos[clave]);
          const distinto = actual !== nuevo;
          return (
            <tr
              key={clave}
              className={
                distinto
                  ? "bg-amber-50 dark:bg-amber-500/10"
                  : "border-t border-black/5 dark:border-white/5"
              }
            >
              <td className="py-1.5 pr-3 align-top text-gray-500">{clave}</td>
              <td className="py-1.5 pr-3 align-top">{actual}</td>
              <td
                className={`py-1.5 align-top ${
                  distinto
                    ? "font-medium text-amber-700 dark:text-amber-400"
                    : ""
                }`}
              >
                {nuevo}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
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
    <div className="rounded-lg border p-4 text-sm">
      <p className="font-medium">
        OT {folio} — {conceptoGasto}
      </p>
      <div className="mt-3 overflow-x-auto">
        <DiffTable datosActuales={datosActuales} datosNuevos={datosNuevos} />
      </div>
      {error && <p className="mt-2 text-red-700">{error}</p>}
      <div className="mt-3 flex gap-2">
        <button
          onClick={aprobar}
          disabled={pending}
          className="rounded bg-primary px-3 py-1.5 font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          Aprobar
        </button>
        <button
          onClick={descartar}
          disabled={pending}
          className="rounded border px-3 py-1.5 hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-50"
        >
          Descartar
        </button>
      </div>
    </div>
  );
}
