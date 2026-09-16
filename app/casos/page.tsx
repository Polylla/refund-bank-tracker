import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { EstadoSelector } from "./EstadoSelector";

export default async function CasosPage() {
  const casos = await prisma.casoReembolso.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex-1 p-8 max-w-5xl mx-auto">
      <h1 className="text-xl font-semibold">Casos de reembolso</h1>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b">
              <th className="p-2">OT</th>
              <th className="p-2">Concepto</th>
              <th className="p-2">Monto</th>
              <th className="p-2">Estado</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {casos.map((caso) => {
              const datos = caso.datosImportados as Record<string, unknown>;
              return (
                <tr key={caso.id} className="border-b">
                  <td className="p-2">{caso.folio}</td>
                  <td className="p-2">{caso.conceptoGasto}</td>
                  <td className="p-2">
                    {String(datos["Costo de diligencia"] ?? "")}
                  </td>
                  <td className="p-2">
                    <EstadoSelector
                      casoId={caso.id}
                      estadoActual={caso.estadoActual}
                    />
                  </td>
                  <td className="p-2">
                    <Link
                      href={`/casos/${caso.id}`}
                      className="text-blue-600 underline"
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
