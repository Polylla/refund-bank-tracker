import { casosPorEstado } from "@/lib/reporteria/metricas";
import { casosCreadosPorMes } from "@/lib/reporteria/evolucionMensual";
import { DonutCasosPorEstado, BarrasCasosPorMes } from "./StatisticsCharts";

export default async function EstadisticasPage() {
  const [porEstado, porMes] = await Promise.all([
    casosPorEstado(),
    casosCreadosPorMes(6),
  ]);

  return (
    <div className="flex-1 p-8 max-w-4xl mx-auto">
      <h1 className="text-xl font-semibold text-primary">Estadísticas</h1>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <section className="rounded-lg border p-4">
          <h2 className="font-medium">Casos por estado</h2>
          <DonutCasosPorEstado data={porEstado} />
        </section>
        <section className="rounded-lg border p-4">
          <h2 className="font-medium">Casos creados por mes (últimos 6)</h2>
          <BarrasCasosPorMes data={porMes} />
        </section>
      </div>
    </div>
  );
}
