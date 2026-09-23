import { prisma } from "@/lib/prisma";
import { FilaRevisionCard } from "./FilaRevisionCard";
import { getOrCreateUsuarioActual, puedeActuar } from "@/lib/usuarios";

export default async function RevisionPage() {
  const { roles } = await getOrCreateUsuarioActual();
  const soloLectura = !puedeActuar(roles);

  const filas = await prisma.filaEnRevision.findMany({
    where: { estado: "PENDIENTE" },
    include: { casoExistente: true },
    orderBy: { fecha: "asc" },
  });

  return (
    <div className="flex-1 p-8 max-w-4xl mx-auto">
      <h1 className="text-xl font-semibold text-primary">Cola de revisión</h1>

      {filas.length === 0 ? (
        <p className="mt-6 text-sm text-gray-500">
          No hay filas pendientes de revisión.
        </p>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {filas.map((fila) => (
            <FilaRevisionCard
              key={fila.id}
              filaId={fila.id}
              folio={fila.casoExistente.folio}
              conceptoGasto={fila.casoExistente.conceptoGasto}
              datosActuales={
                fila.casoExistente.datosImportados as Record<string, unknown>
              }
              datosNuevos={fila.datosNuevos as Record<string, unknown>}
              soloLectura={soloLectura}
            />
          ))}
        </div>
      )}
    </div>
  );
}
