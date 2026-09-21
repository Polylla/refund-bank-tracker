import Link from "next/link";

interface Props {
  basePath: string;
  paramsSinPagina: Record<string, string | undefined>;
  paginaActual: number;
  total: number;
  porPagina: number;
}

export function Paginacion({
  basePath,
  paramsSinPagina,
  paginaActual,
  total,
  porPagina,
}: Props) {
  const totalPaginas = Math.max(1, Math.ceil(total / porPagina));
  const desde = total === 0 ? 0 : (paginaActual - 1) * porPagina + 1;
  const hasta = Math.min(paginaActual * porPagina, total);

  function hrefPagina(pagina: number): string {
    const params = new URLSearchParams(
      Object.entries(paramsSinPagina).filter(([, v]) => v) as [
        string,
        string,
      ][]
    );
    params.set("pagina", String(pagina));
    return `${basePath}?${params.toString()}`;
  }

  const hayAnterior = paginaActual > 1;
  const haySiguiente = paginaActual < totalPaginas;

  return (
    <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
      <span>
        {desde}–{hasta} de {total}
      </span>
      <div className="flex gap-2">
        {hayAnterior ? (
          <Link
            href={hrefPagina(paginaActual - 1)}
            className="rounded border px-2 py-1 hover:bg-black/5 dark:hover:bg-white/10"
          >
            Anterior
          </Link>
        ) : (
          <span className="rounded border px-2 py-1 opacity-40">Anterior</span>
        )}
        {haySiguiente ? (
          <Link
            href={hrefPagina(paginaActual + 1)}
            className="rounded border px-2 py-1 hover:bg-black/5 dark:hover:bg-white/10"
          >
            Siguiente
          </Link>
        ) : (
          <span className="rounded border px-2 py-1 opacity-40">Siguiente</span>
        )}
      </div>
    </div>
  );
}
