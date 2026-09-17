"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { subirDocumentosAction, type ResultadoSubidaDocumento } from "./actions";

async function accion(
  _previo: ResultadoSubidaDocumento[] | null,
  formData: FormData
) {
  return subirDocumentosAction(formData);
}

export function UploadForm() {
  const [resultados, formAction, pending] = useActionState<
    ResultadoSubidaDocumento[] | null,
    FormData
  >(accion, null);
  const router = useRouter();

  return (
    <div>
      <form
        action={async (formData) => {
          await formAction(formData);
          router.refresh();
        }}
        className="flex flex-col gap-4"
      >
        <input
          type="file"
          name="archivos"
          multiple
          accept=".pdf,.jpg,.jpeg,.png"
          required
          className="rounded border p-2 text-sm"
        />
        <button
          type="submit"
          disabled={pending}
          className="self-start rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {pending ? "Subiendo..." : "Subir documentos"}
        </button>
      </form>

      {resultados && resultados.length > 0 && (
        <ul className="mt-4 flex flex-col gap-1 text-sm">
          {resultados.map((r, i) => (
            <li key={i}>
              {r.nombreArchivo} — boleta extraída:{" "}
              {r.nBoletaExtraido ?? "(ninguna)"} —{" "}
              {r.estadoMatching === "MATCHEADO" ? (
                <span className="text-green-700">
                  matcheado a {r.casosVinculados} caso(s)
                </span>
              ) : (
                <span className="text-red-700">sin match</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
