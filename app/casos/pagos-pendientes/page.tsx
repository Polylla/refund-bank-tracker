import {
  obtenerCasosPaginados,
  calcularMontoTotal,
} from "@/lib/exportacion/exportarCasos";
import { getOrCreateUsuarioActual, puedeActuar } from "@/lib/usuarios";
import { CasosFiltros } from "../CasosFiltros";
import { CasosTable } from "../CasosTable";
import { Paginacion } from "../Paginacion";

const POR_PAGINA = 20;
const ESTADOS_PENDIENTES = ["Pendiente", "Enviado a pago"];

export default async function PagosPendientesPage(
  props: PageProps<"/casos/pagos-pendientes">
) {
  const { roles } = await getOrCreateUsuarioActual();
  const soloLectura = !puedeActuar(roles);

  const sp = await props.searchParams;
  const get = (key: string) => {
    const v = sp[key];
    return Array.isArray(v) ? v[0] : v;
  };

  const desde = get("desde");
  const hasta = get("hasta");
  const busqueda = get("busqueda");
  const ot = get("ot");
  const pagina = Math.max(1, Number(get("pagina")) || 1);

  const filtros = {
    estadoIn: ESTADOS_PENDIENTES,
    fechaDesde: desde ? new Date(desde) : undefined,
    fechaHasta: hasta ? new Date(hasta) : undefined,
    busqueda: busqueda || undefined,
    folio: ot || undefined,
  };

  const [{ casos, total }, montoTotal] = await Promise.all([
    obtenerCasosPaginados(filtros, pagina, POR_PAGINA),
    calcularMontoTotal(filtros),
  ]);

  const paramsExport = new URLSearchParams();
  for (const estado of ESTADOS_PENDIENTES) paramsExport.append("estado", estado);
  for (const [k, v] of Object.entries({ desde, hasta, busqueda, ot })) {
    if (v) paramsExport.set(k, v);
  }

  const queryString = new URLSearchParams(
    Object.entries({ desde, hasta, busqueda, ot }).filter(
      ([, v]) => v
    ) as [string, string][]
  ).toString();

  return (
    <div className="flex-1 p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Pagos pendientes</h1>
        <div className="flex gap-2">
          <a
            href={`/api/exportar?${paramsExport.toString()}`}
            className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Exportar a Excel
          </a>
          <a
            href={`/api/exportar/documentos?${paramsExport.toString()}`}
            className="rounded border px-4 py-2 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/10"
          >
            Descargar documentos (ZIP)
          </a>
        </div>
      </div>
      <p className="mt-1 text-sm text-gray-600">
        Casos en estado Pendiente o Enviado a pago (excluye Pagado y
        Rechazado).
      </p>

      <CasosFiltros
        basePath="/casos/pagos-pendientes"
        ot={ot}
        busqueda={busqueda}
        desde={desde}
        hasta={hasta}
        mostrarEstado={false}
        hayFiltrosActivos={queryString.length > 0}
      />

      <CasosTable casos={casos} soloLectura={soloLectura} />

      <div className="mt-3 text-right text-sm font-medium">
        Total filtrado: ${montoTotal.toLocaleString("es-CL")}
      </div>

      <Paginacion
        basePath="/casos/pagos-pendientes"
        paramsSinPagina={{ desde, hasta, busqueda, ot }}
        paginaActual={pagina}
        total={total}
        porPagina={POR_PAGINA}
      />
    </div>
  );
}
