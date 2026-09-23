import {
  Clock,
  Send,
  CheckCircle2,
  XCircle,
  ClipboardList,
  FileWarning,
  ReceiptText,
} from "lucide-react";
import {
  casosPorEstado,
  filasEnRevisionPendientes,
} from "@/lib/reporteria/metricas";
import { casosSinDocumento, documentosSinMatch } from "@/lib/documentos/alertas";
import { StatCard, type StatColor } from "./StatCard";

const ICONO_POR_ESTADO: Record<string, typeof Clock> = {
  Pendiente: Clock,
  "Enviado a pago": Send,
  Pagado: CheckCircle2,
  Rechazado: XCircle,
};

const COLOR_POR_ESTADO: Record<string, StatColor> = {
  Pendiente: "warning",
  "Enviado a pago": "info",
  Pagado: "success",
  Rechazado: "danger",
};

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
            <StatCard
              key={p.estado}
              href={`/casos?estado=${encodeURIComponent(p.estado)}`}
              icon={ICONO_POR_ESTADO[p.estado] ?? Clock}
              value={p.cantidad}
              label={p.estado}
              color={COLOR_POR_ESTADO[p.estado] ?? "neutral"}
            />
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-medium">Alertas pendientes</h2>
        <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard
            href="/revision"
            icon={ClipboardList}
            value={enRevision}
            label="filas en cola de revisión"
            color={enRevision > 0 ? "warning" : "neutral"}
          />
          <StatCard
            href="/documentos"
            icon={FileWarning}
            value={sinMatch.length}
            label="documentos sin match"
            color={sinMatch.length > 0 ? "warning" : "neutral"}
          />
          <StatCard
            href="/documentos"
            icon={ReceiptText}
            value={sinDocumento.length}
            label="casos sin documento"
            color={sinDocumento.length > 0 ? "warning" : "neutral"}
          />
        </div>
      </section>
    </div>
  );
}
