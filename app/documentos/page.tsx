import { casosSinDocumento, documentosSinMatch } from "@/lib/documentos/alertas";
import { UploadForm } from "./UploadForm";
import { BuscarYVincular } from "./BuscarYVincular";
import { getOrCreateUsuarioActual, puedeActuar } from "@/lib/usuarios";

export default async function DocumentosPage() {
  const { roles } = await getOrCreateUsuarioActual();
  const soloLectura = !puedeActuar(roles);

  const [sinMatch, sinDocumento] = await Promise.all([
    documentosSinMatch(),
    casosSinDocumento(),
  ]);

  return (
    <div className="flex-1 p-8 max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold text-primary">
        Documentos de respaldo
      </h1>
      <p className="mt-1 text-sm text-gray-600">
        Sube PDFs/imágenes nombrados por N° de boleta; se matchean
        automáticamente con los casos correspondientes.
      </p>

      {!soloLectura && (
        <div className="mt-6">
          <UploadForm />
        </div>
      )}

      <section className="mt-10 rounded-lg border p-4">
        <h2 className="font-medium">Documentos sin match ({sinMatch.length})</h2>
        {sinMatch.length === 0 ? (
          <p className="mt-2 text-sm text-gray-500">Ninguno.</p>
        ) : (
          <ul className="mt-3 flex flex-col divide-y divide-black/5 text-sm">
            {sinMatch.map((d) => (
              <li key={d.id} className="py-2.5 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium">{d.nombreArchivo}</span>
                  <span className="shrink-0 rounded bg-black/5 px-2 py-0.5 text-xs text-gray-600">
                    boleta extraída: {d.nBoletaExtraido ?? "(ninguna)"}
                  </span>
                </div>
                {!soloLectura && (
                  <div className="mt-1.5">
                    <BuscarYVincular documentoId={d.id} />
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6 rounded-lg border p-4">
        <h2 className="font-medium">
          Casos con boleta pendiente de documento ({sinDocumento.length})
        </h2>
        {sinDocumento.length === 0 ? (
          <p className="mt-2 text-sm text-gray-500">Ninguno.</p>
        ) : (
          <ul className="mt-3 flex max-h-96 flex-col divide-y divide-black/5 overflow-y-auto text-sm">
            {sinDocumento.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0"
              >
                <span>
                  <span className="font-medium">OT {c.folio}</span>
                  <span className="text-gray-500"> — {c.conceptoGasto}</span>
                </span>
                <span className="shrink-0 rounded bg-black/5 px-2 py-0.5 text-xs text-gray-600">
                  boleta {c.nBoleta}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
