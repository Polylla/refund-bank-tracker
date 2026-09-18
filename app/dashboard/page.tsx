import Link from "next/link";
import {
  casosPorEstado,
  filasEnRevisionPendientes,
  importacionesRecientes,
} from "@/lib/reporteria/metricas";
import { casosSinDocumento, documentosSinMatch } from "@/lib/documentos/alertas";

export default async function DashboardPage() {
  const [porEstado, enRevision, importaciones, sinMatch, sinDocumento] =
    await Promise.all([
      casosPorEstado(),
      filasEnRevisionPendientes(),
      importacionesRecientes(5),
      documentosSinMatch(),
      casosSinDocumento(),
    ]);

  return (
    <div className="flex-1 p-8 max-w-4xl mx-auto">
      <h1 className="text-xl font-semibold">Dashboard</h1>

      <section className="mt-6">
        <h2 className="font-medium">Casos por estado</h2>
        <div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {porEstado.map((p) => (
            <div key={p.estado} className="rounded border p-3 text-center">
              <div className="text-2xl font-semibold">{p.cantidad}</div>
              <div className="text-xs text-gray-500">{p.estado}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-medium">Alertas pendientes</h2>
        <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Link
            href="/revision"
            className="rounded border p-3 hover:bg-gray-50"
          >
            <div className="text-2xl font-semibold">{enRevision}</div>
            <div className="text-xs text-gray-500">
              filas en cola de revisión
            </div>
          </Link>
          <Link
            href="/documentos"
            className="rounded border p-3 hover:bg-gray-50"
          >
            <div className="text-2xl font-semibold">{sinMatch.length}</div>
            <div className="text-xs text-gray-500">documentos sin match</div>
          </Link>
          <Link
            href="/documentos"
            className="rounded border p-3 hover:bg-gray-50"
          >
            <div className="text-2xl font-semibold">
              {sinDocumento.length}
            </div>
            <div className="text-xs text-gray-500">casos sin documento</div>
          </Link>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-medium">Importaciones recientes</h2>
        <ul className="mt-2 flex flex-col gap-2 text-sm">
          {importaciones.map((imp) => (
            <li key={imp.id} className="rounded border p-3">
              <div className="flex justify-between">
                <span>{imp.nombreArchivoOriginal}</span>
                <span className="text-gray-500">
                  {imp.fecha.toLocaleString("es-CL")}
                </span>
              </div>
              <div className="mt-1 text-xs text-gray-600">
                {imp.cantidadFilas} filas — {imp.cantidadDuplicados}{" "}
                duplicados — {imp.cantidadEnRevision} en revisión —{" "}
                {imp.usuario.email}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
