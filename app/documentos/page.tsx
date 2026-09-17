import { casosSinDocumento, documentosSinMatch } from "@/lib/documentos/alertas";
import { UploadForm } from "./UploadForm";

export default async function DocumentosPage() {
  const [sinMatch, sinDocumento] = await Promise.all([
    documentosSinMatch(),
    casosSinDocumento(),
  ]);

  return (
    <div className="flex-1 p-8 max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold">Documentos de respaldo</h1>
      <p className="mt-1 text-sm text-gray-600">
        Sube PDFs/imágenes nombrados por N° de boleta; se matchean
        automáticamente con los casos correspondientes.
      </p>

      <div className="mt-6">
        <UploadForm />
      </div>

      <section className="mt-10">
        <h2 className="font-medium">Documentos sin match ({sinMatch.length})</h2>
        {sinMatch.length === 0 ? (
          <p className="mt-2 text-sm text-gray-500">Ninguno.</p>
        ) : (
          <ul className="mt-2 flex flex-col gap-1 text-sm">
            {sinMatch.map((d) => (
              <li key={d.id}>
                {d.nombreArchivo} — boleta extraída:{" "}
                {d.nBoletaExtraido ?? "(ninguna)"}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <h2 className="font-medium">
          Casos con boleta pendiente de documento ({sinDocumento.length})
        </h2>
        {sinDocumento.length === 0 ? (
          <p className="mt-2 text-sm text-gray-500">Ninguno.</p>
        ) : (
          <ul className="mt-2 flex flex-col gap-1 text-sm">
            {sinDocumento.map((c) => (
              <li key={c.id}>
                OT {c.folio} — {c.conceptoGasto} — boleta {c.nBoleta}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
