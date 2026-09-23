import Link from "next/link";
import type { CasoReembolso } from "@prisma/client";
import { EstadoSelector } from "./EstadoSelector";
import { EstadoBadge } from "./EstadoBadge";
import { MarcarDuplicadoRevisado } from "./MarcarDuplicadoRevisado";

export function CasosTable({
  casos,
  soloLectura,
}: {
  casos: CasoReembolso[];
  soloLectura: boolean;
}) {
  return (
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
                    <EstadoBadge estado={caso.estadoActual} />
                  ) : (
                    <div className="flex flex-col items-start gap-1.5">
                      <EstadoBadge estado={caso.estadoActual} />
                      <EstadoSelector
                        casoId={caso.id}
                        estadoActual={caso.estadoActual}
                      />
                    </div>
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
  );
}
