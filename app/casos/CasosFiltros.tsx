import Link from "next/link";
import { ESTADOS } from "@/lib/estados/estados";

interface Props {
  basePath: string;
  ot?: string;
  busqueda?: string;
  estado?: string;
  desde?: string;
  hasta?: string;
  mostrarEstado?: boolean;
  hayFiltrosActivos: boolean;
}

export function CasosFiltros({
  basePath,
  ot,
  busqueda,
  estado,
  desde,
  hasta,
  mostrarEstado = true,
  hayFiltrosActivos,
}: Props) {
  return (
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
        Buscar (nombre, RUT, tribunal, estudio...)
        <input
          type="text"
          name="busqueda"
          defaultValue={busqueda ?? ""}
          placeholder="Ej: Pérez"
          className="rounded border p-1.5"
        />
      </label>
      {mostrarEstado && (
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
      )}
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
      <button
        type="submit"
        className="rounded border px-3 py-1.5 font-medium hover:bg-black/5 dark:hover:bg-white/10"
      >
        Filtrar
      </button>
      {hayFiltrosActivos && (
        <Link href={basePath} className="text-primary underline">
          Limpiar filtros
        </Link>
      )}
    </form>
  );
}
