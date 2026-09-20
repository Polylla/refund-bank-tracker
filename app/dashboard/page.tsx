import Link from "next/link";
import {
  casosPorEstado,
  filasEnRevisionPendientes,
} from "@/lib/reporteria/metricas";
import { casosSinDocumento, documentosSinMatch } from "@/lib/documentos/alertas";

export default async function DashboardPage() {
  const [porEstado, enRevision, sinMatch, sinDocumento] = await Promise.all([
    casosPorEstado(),
    filasEnRevisionPendientes(),
    documentosSinMatch(),
    casosSinDocumento(),
  ]);

  return (
    <div className="flex-1 p-8 max-w-4xl mx-auto">
      <h1 className="text-xl font-semibold text-primary">Dashboard</h1>

      <section className="mt-6">
        <h2 className="font-medium">Casos por estado</h2>
        <div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {porEstado.map((p) => (
            <div key={p.estado} className="rounded-lg border p-3 text-center">
              <div className="text-2xl font-semibold text-primary">
                {p.cantidad}
              </div>
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
            className="rounded-lg border p-3 transition-colors hover:bg-black/[.03] dark:hover:bg-white/[.05]"
          >
            <div
              className={`text-2xl font-semibold ${enRevision > 0 ? "text-amber-600" : ""}`}
            >
              {enRevision}
            </div>
            <div className="text-xs text-gray-500">
              filas en cola de revisión
            </div>
          </Link>
          <Link
            href="/documentos"
            className="rounded-lg border p-3 transition-colors hover:bg-black/[.03] dark:hover:bg-white/[.05]"
          >
            <div
              className={`text-2xl font-semibold ${sinMatch.length > 0 ? "text-amber-600" : ""}`}
            >
              {sinMatch.length}
            </div>
            <div className="text-xs text-gray-500">documentos sin match</div>
          </Link>
          <Link
            href="/documentos"
            className="rounded-lg border p-3 transition-colors hover:bg-black/[.03] dark:hover:bg-white/[.05]"
          >
            <div
              className={`text-2xl font-semibold ${sinDocumento.length > 0 ? "text-amber-600" : ""}`}
            >
              {sinDocumento.length}
            </div>
            <div className="text-xs text-gray-500">casos sin documento</div>
          </Link>
        </div>
      </section>
    </div>
  );
}
