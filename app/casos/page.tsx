import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { EstadoSelector } from "./EstadoSelector";
import { MarcarDuplicadoRevisado } from "./MarcarDuplicadoRevisado";
import { ESTADOS } from "@/lib/estados/estados";
import { obtenerCasosParaExportar } from "@/lib/exportacion/exportarCasos";
import { COLUMNAS } from "@/lib/importacion/columns";
import { getOrCreateUsuarioActual, puedeActuar } from "@/lib/usuarios";
import { resumenPorOt } from "@/lib/reporteria/porOt";

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
  const campo = get("campo");
  const valor = get("valor");
  const ot = get("ot");

  const [casos, resumenOt] = await Promise.all([
    obtenerCasosParaExportar({
      estado: estado || undefined,
      fechaDesde: desde ? new Date(desde) : undefined,
      fechaHasta: hasta ? new Date(hasta) : undefined,
      campoImportado: campo || undefined,
      valorImportado: valor || undefined,
      folio: ot || undefined,
    }),
    ot ? resumenPorOt(ot) : null,
  ]);

  const queryString = new URLSearchParams(
    Object.entries({ estado, desde, hasta, campo, valor, ot }).filter(
      ([, v]) => v
    ) as [string, string][]
  ).toString();

  return (
    <div className="flex-1 p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Casos de reembolso</h1>
        <div className="flex gap-2">
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

      <form className="mt-4 flex flex-wrap items-end gap-3 rounded-lg border p-4 text-sm">
        <label className="flex flex-col gap-1">
          Buscar por OT
          <input
            type="text"
            name="ot"
            defaultValue={ot ?? ""}
            placeholder="Ej: 93306568"
            className="rounded border p-1.5"
          />
        </label>
        <label className="flex flex-col gap-1">
          Estado
          <select
            name="estado"
            defaultValue={estado ?? ""}
            className="rounded border p-1.5"
          >
            <option value="">Todos</option>
            {ESTADOS.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          Creado desde
          <input
            type="date"
            name="desde"
            defaultValue={desde ?? ""}
            className="rounded border p-1.5"
          />
        </label>
        <label className="flex flex-col gap-1">
          Creado hasta
          <input
            type="date"
            name="hasta"
            defaultValue={hasta ?? ""}
            className="rounded border p-1.5"
          />
        </label>
        <label className="flex flex-col gap-1">
          Campo
          <select
            name="campo"
            defaultValue={campo ?? ""}
            className="rounded border p-1.5"
          >
            <option value="">(ninguno)</option>
            {COLUMNAS.map((c) => (
              <option key={c.key} value={c.headers[0]}>
                {c.headers[0]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          Valor contiene
          <input
            type="text"
            name="valor"
            defaultValue={valor ?? ""}
            className="rounded border p-1.5"
          />
        </label>
        <button
          type="submit"
          className="rounded border px-3 py-1.5 font-medium hover:bg-black/5 dark:hover:bg-white/10"
        >
          Filtrar
        </button>
        {queryString && (
          <Link href="/casos" className="text-primary underline">
            Limpiar filtros
          </Link>
        )}
      </form>

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

      <div className="mt-6 overflow-x-auto rounded-lg border">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b bg-black/[.03] dark:bg-white/[.05]">
              <th className="p-3 font-medium">OT</th>
              <th className="p-3 font-medium">Concepto</th>
              <th className="p-3 font-medium">Monto</th>
              <th className="p-3 font-medium">Estado</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {casos.map((caso) => {
              const datos = caso.datosImportados as Record<string, unknown>;
              return (
                <tr
                  key={caso.id}
                  className="border-b last:border-b-0 hover:bg-black/[.02] dark:hover:bg-white/[.04]"
                >
                  <td className="p-3">{caso.folio}</td>
                  <td className="p-3">
                    {caso.conceptoGasto}
                    {caso.posibleDuplicado && !caso.duplicadoRevisadoEn && (
                      <div className="mt-1">
                        {soloLectura ? (
                          <span className="text-xs font-medium text-amber-700 dark:text-amber-500">
                            Posible duplicado
                          </span>
                        ) : (
                          <MarcarDuplicadoRevisado casoId={caso.id} />
                        )}
                      </div>
                    )}
                  </td>
                  <td className="p-3">
                    {String(datos["Costo de diligencia"] ?? "")}
                  </td>
                  <td className="p-3">
                    {soloLectura ? (
                      caso.estadoActual
                    ) : (
                      <EstadoSelector
                        casoId={caso.id}
                        estadoActual={caso.estadoActual}
                      />
                    )}
                  </td>
                  <td className="p-3">
                    <Link
                      href={`/casos/${caso.id}`}
                      className="text-primary underline"
                    >
                      Ver historial
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
