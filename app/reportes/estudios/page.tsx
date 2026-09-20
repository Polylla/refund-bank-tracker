import Link from "next/link";
import { resumenPorEstudio } from "@/lib/reporteria/porEstudio";
import { ESTADOS } from "@/lib/estados/estados";

function formatMonto(monto: number): string {
  return monto.toLocaleString("es-CL");
}

export default async function ReporteEstudiosPage() {
  const resumen = await resumenPorEstudio();

  return (
    <div className="flex-1 p-8 max-w-5xl mx-auto">
      <h1 className="text-xl font-semibold text-primary">
        Reporte por Estudio/Abogado
      </h1>
      <p className="mt-1 text-sm text-gray-600">
        Histórico de casos agrupado por estudio, con desglose por estado.
      </p>

      <div className="mt-6 overflow-x-auto rounded-lg border">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b bg-black/[.03] dark:bg-white/[.05]">
              <th className="p-3 font-medium">Estudio</th>
              <th className="p-3 font-medium">Casos</th>
              <th className="p-3 font-medium">Monto total</th>
              {ESTADOS.map((estado) => (
                <th key={estado} className="p-3 font-medium">
                  {estado}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {resumen.map((r) => (
              <tr
                key={r.estudio}
                className="border-b last:border-b-0 hover:bg-black/[.02] dark:hover:bg-white/[.04]"
              >
                <td className="p-3">
                  <Link
                    href={`/casos?campo=${encodeURIComponent("Estudio/Abogado")}&valor=${encodeURIComponent(r.estudio)}`}
                    className="text-primary underline"
                  >
                    {r.estudio}
                  </Link>
                </td>
                <td className="p-3">{r.cantidadTotal}</td>
                <td className="p-3">${formatMonto(r.montoTotal)}</td>
                {ESTADOS.map((estado) => (
                  <td key={estado} className="p-3">
                    {r.porEstado[estado].cantidad} — $
                    {formatMonto(r.porEstado[estado].monto)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
