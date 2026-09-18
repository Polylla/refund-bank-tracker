"use client";

import { useActionState } from "react";
import { importarArchivo } from "./actions";
import type { ResultadoImportacion } from "@/lib/importacion/procesar";

async function accion(
  _previo: ResultadoImportacion | null,
  formData: FormData
) {
  return importarArchivo(formData);
}

export function ImportarForm() {
  const [resultado, formAction, pending] = useActionState<
    ResultadoImportacion | null,
    FormData
  >(accion, null);

  return (
    <>
      <form action={formAction} className="mt-6 flex flex-col gap-4">
        <input
          type="file"
          name="archivo"
          accept=".xlsx,.csv"
          required
          className="border rounded p-2 text-sm"
        />
        <button
          type="submit"
          disabled={pending}
          className="self-start rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Importando..." : "Importar"}
        </button>
      </form>

      {resultado && (
        <div className="mt-6 rounded border p-4 text-sm">
          {resultado.ok ? (
            <div>
              <p className="font-medium text-green-700">
                Importación exitosa
              </p>
              <p>Filas importadas: {resultado.resumen?.filasImportadas}</p>
              <p>
                Filas descartadas (ej. fila de totales):{" "}
                {resultado.resumen?.filasDescartadas}
              </p>
              <p>
                Posibles duplicados (misma OT + concepto, en este archivo):{" "}
                {resultado.resumen?.filasDuplicadas}
              </p>
              <p>
                En cola de revisión (ya existían de otra importación):{" "}
                {resultado.resumen?.filasEnRevision}
              </p>
            </div>
          ) : (
            <div>
              <p className="font-medium text-red-700">{resultado.mensaje}</p>
              {resultado.columnasFaltantes &&
                resultado.columnasFaltantes.length > 0 && (
                  <ul className="mt-2 list-inside list-disc">
                    {resultado.columnasFaltantes.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                )}
              {resultado.errores && resultado.errores.length > 0 && (
                <ul className="mt-2 list-inside list-disc">
                  {resultado.errores.map((e, i) => (
                    <li key={i}>
                      Fila {e.fila} — {e.campo}: {e.mensaje}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
