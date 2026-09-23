import Link from "next/link";
import { obtenerCasosPaginados, calcularMontoTotal } from "@/lib/exportacion/exportarCasos";
import { getOrCreateUsuarioActual, puedeActuar } from "@/lib/usuarios";
import { resumenPorOt } from "@/lib/reporteria/porOt";
import { CasosFiltros } from "./CasosFiltros";
import { CasosTable } from "./CasosTable";
import { Paginacion } from "./Paginacion";

const POR_PAGINA = 20;

export default async function CasosPage(props: PageProps<"/casos">) {
  const { roles } = await getOrCreateUsuarioActual();
  const soloLectura = !puedeActuar(roles);

  const sp = await props.searchParams;
  const get = (key: string) => {
    const v = sp[key];
    return Array.isArray(v) ? v[0] : v;
  };

  const estado = get("estado");
  const desde = get("desde");
  const hasta = get("hasta");
  const busqueda = get("busqueda");
  const ot = get("ot");
  const pagina = Math.max(1, Number(get("pagina")) || 1);

  const filtros = {
    estado: estado || undefined,
    fechaDesde: desde ? new Date(desde) : undefined,
    fechaHasta: hasta ? new Date(hasta) : undefined,
    busqueda: busqueda || undefined,
    folio: ot || undefined,
  };

  const [{ casos, total }, montoTotal, resumenOt] = await Promise.all([
    obtenerCasosPaginados(filtros, pagina, POR_PAGINA),
    calcularMontoTotal(filtros),
    ot ? resumenPorOt(ot) : null,
  ]);

  const queryString = new URLSearchParams(
    Object.entries({ estado, desde, hasta, busqueda, ot }).filter(
      ([, v]) => v
    ) as [string, string][]
  ).toString();

  return (
    <div className="flex-1 p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Casos de reembolso</h1>
        <div className="flex gap-2">
          {!soloLectura && (
            <Link
              href="/casos/nuevo"
              className="rounded border px-4 py-2 text-sm font-medium hover:bg-black/5"
            >
              Nuevo caso
            </Link>
          )}
          <a
            href={`/api/exportar${queryString ? `?${queryString}` : ""}`}
            className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Exportar a Excel
          </a>
          <a
            href={`/api/exportar/documentos${queryString ? `?${queryString}` : ""}`}
            className="rounded border px-4 py-2 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/10"
          >
            Descargar documentos (ZIP)
          </a>
        </div>
      </div>

      <CasosFiltros
        basePath="/casos"
        ot={ot}
        busqueda={busqueda}
        estado={estado}
        desde={desde}
        hasta={hasta}
        hayFiltrosActivos={queryString.length > 0}
      />

      {resumenOt && (
        <div className="mt-4 rounded-lg border p-4 text-sm">
          <p className="font-medium">OT {resumenOt.folio}</p>
          <p className="mt-1 text-gray-600">
            {resumenOt.cantidadPagadas} de {resumenOt.cantidadTotal}{" "}
            diligencia(s) pagada(s) — $
            {resumenOt.montoPagado.toLocaleString("es-CL")} pagado de $
            {resumenOt.montoTotal.toLocaleString("es-CL")} total
          </p>
        </div>
      )}

      <CasosTable casos={casos} soloLectura={soloLectura} />

      <div className="mt-3 text-right text-sm font-medium">
        Total filtrado: ${montoTotal.toLocaleString("es-CL")}
      </div>

      <Paginacion
        basePath="/casos"
        paramsSinPagina={{ estado, desde, hasta, busqueda, ot }}
        paginaActual={pagina}
        total={total}
        porPagina={POR_PAGINA}
      />
    </div>
  );
}
