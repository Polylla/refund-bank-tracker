import Link from "next/link";
import { Search } from "lucide-react";
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
    <form className="mt-4 rounded-lg border p-4 text-sm">
      <div className="relative">
        <Search
          size={16}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          name="busqueda"
          defaultValue={busqueda ?? ""}
          placeholder="Buscar por nombre, RUT, tribunal, estudio..."
          className="w-full rounded-full border py-2 pl-9 pr-4"
        />
      </div>

      <div className="mt-3 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          OT
          <input
            type="text"
            name="ot"
            defaultValue={ot ?? ""}
            placeholder="Ej: 93306568"
            className="rounded-lg border p-1.5"
          />
        </label>
        {mostrarEstado && (
          <label className="flex flex-col gap-1">
            Estado
            <select
              name="estado"
              defaultValue={estado ?? ""}
              className="rounded-lg border p-1.5"
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
            className="rounded-lg border p-1.5"
          />
        </label>
        <label className="flex flex-col gap-1">
          Creado hasta
          <input
            type="date"
            name="hasta"
            defaultValue={hasta ?? ""}
            className="rounded-lg border p-1.5"
          />
        </label>
        <button
          type="submit"
          className="rounded-lg border px-3 py-1.5 font-medium hover:bg-black/5"
        >
          Filtrar
        </button>
        {hayFiltrosActivos && (
          <Link href={basePath} className="text-primary underline">
            Limpiar filtros
          </Link>
        )}
      </div>
    </form>
  );
}
