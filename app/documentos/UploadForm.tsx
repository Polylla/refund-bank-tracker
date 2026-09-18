"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { subirDocumentosAction, type ResultadoSubidaDocumento } from "./actions";

interface ResultadoConError {
  nombreArchivo: string;
  ok: boolean;
  mensaje?: string;
  resultado?: ResultadoSubidaDocumento;
}

export function UploadForm() {
  const [resultados, setResultados] = useState<ResultadoConError[]>([]);
  const [subiendo, setSubiendo] = useState(false);
  const [progreso, setProgreso] = useState<{ actual: number; total: number } | null>(
    null
  );
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const input = formRef.current?.elements.namedItem(
      "archivos"
    ) as HTMLInputElement | null;
    const archivos = input?.files ? Array.from(input.files) : [];
    if (archivos.length === 0) return;

    setSubiendo(true);
    setResultados([]);
    const acumulados: ResultadoConError[] = [];

    // Se sube un archivo a la vez: mandar todos juntos en un solo
    // Server Action supera el límite de tamaño de body (1MB por
    // defecto en Next.js, y Vercel tiene su propio tope de payload).
    for (let i = 0; i < archivos.length; i++) {
      setProgreso({ actual: i + 1, total: archivos.length });
      const archivo = archivos[i];
      const formData = new FormData();
      formData.append("archivos", archivo);
      try {
        const [resultado] = await subirDocumentosAction(formData);
        acumulados.push({ nombreArchivo: archivo.name, ok: true, resultado });
      } catch (err) {
        acumulados.push({
          nombreArchivo: archivo.name,
          ok: false,
          mensaje: err instanceof Error ? err.message : "Error desconocido",
        });
      }
      setResultados([...acumulados]);
    }

    setProgreso(null);
    setSubiendo(false);
    formRef.current?.reset();
    router.refresh();
  }

  return (
    <div>
      <form ref={formRef} onSubmit={onSubmit} className="flex flex-col gap-4">
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
          disabled={subiendo}
          className="self-start rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {subiendo
            ? `Subiendo... ${progreso ? `(${progreso.actual}/${progreso.total})` : ""}`
            : "Subir documentos"}
        </button>
      </form>

      {resultados.length > 0 && (
        <ul className="mt-4 flex flex-col gap-1 text-sm">
          {resultados.map((r, i) => (
            <li key={i}>
              {r.nombreArchivo} —{" "}
              {!r.ok ? (
                <span className="text-red-700">error: {r.mensaje}</span>
              ) : (
                <>
                  boleta extraída: {r.resultado?.nBoletaExtraido ?? "(ninguna)"}{" "}
                  —{" "}
                  {r.resultado?.estadoMatching === "MATCHEADO" ? (
                    <span className="text-green-700">
                      matcheado a {r.resultado.casosVinculados} caso(s)
                    </span>
                  ) : (
                    <span className="text-red-700">sin match</span>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
