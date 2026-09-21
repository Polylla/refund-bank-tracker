"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  eliminarImportacionAction,
  resumenEliminarImportacionAction,
} from "./actions";
import type { ResumenEliminarImportacion } from "@/lib/importacion/eliminarImportacion";

export function EliminarImportacionBoton({
  importacionId,
}: {
  importacionId: string;
}) {
  const [resumen, setResumen] = useState<ResumenEliminarImportacion | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function pedirConfirmacion() {
    setError(null);
    startTransition(async () => {
      const r = await resumenEliminarImportacionAction(importacionId);
      setResumen(r);
    });
  }

  function confirmar() {
    setError(null);
    startTransition(async () => {
      const resultado = await eliminarImportacionAction(importacionId);
      if (!resultado.ok) {
        setError(resultado.mensaje ?? "No se pudo eliminar");
      } else {
        setResumen(null);
        router.refresh();
      }
    });
  }

  if (!resumen) {
    return (
      <button
        onClick={pedirConfirmacion}
        disabled={pending}
        className="text-red-700 underline disabled:opacity-50"
      >
        Eliminar
      </button>
    );
  }

  return (
    <div className="mt-2 rounded border border-red-200 bg-red-50 p-3 text-xs">
      <p className="font-medium text-red-800">
        Vas a eliminar {resumen.cantidadCasos} caso(s) de esta importación.
        Esto no se puede deshacer.
      </p>
      {(resumen.casosConAvance > 0 || resumen.casosConDocumento > 0) && (
        <p className="mt-1 text-red-800">
          {resumen.casosConAvance > 0 &&
            `${resumen.casosConAvance} caso(s) ya no están en "Pendiente". `}
          {resumen.casosConDocumento > 0 &&
            `${resumen.casosConDocumento} caso(s) tienen documento vinculado.`}
        </p>
      )}
      {error && <p className="mt-1 text-red-800">{error}</p>}
      <div className="mt-2 flex gap-2">
        <button
          onClick={confirmar}
          disabled={pending}
          className="rounded bg-red-700 px-2 py-1 font-medium text-white disabled:opacity-50"
        >
          Confirmar eliminación
        </button>
        <button
          onClick={() => setResumen(null)}
          disabled={pending}
          className="rounded border px-2 py-1 disabled:opacity-50"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
