import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EstadoSelector } from "../EstadoSelector";

export default async function CasoDetallePage(
  props: PageProps<"/casos/[id]">
) {
  const { id } = await props.params;

  const caso = await prisma.casoReembolso.findUnique({
    where: { id },
    include: {
      historial: {
        orderBy: { fecha: "asc" },
        include: { usuario: true },
      },
      documentos: {
        orderBy: { fechaCarga: "asc" },
      },
    },
  });

  if (!caso) notFound();

  const datos = caso.datosImportados as Record<string, unknown>;

  return (
    <div className="flex-1 p-8 max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold text-primary">
        OT {caso.folio} — {caso.conceptoGasto}
      </h1>

      <div className="mt-4 flex items-center gap-4">
        <span className="text-sm text-gray-600">Estado actual:</span>
        <EstadoSelector casoId={caso.id} estadoActual={caso.estadoActual} />
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-2 rounded-lg border p-4 text-sm">
        <dt className="text-gray-500">Nombre cliente</dt>
        <dd>{String(datos["Nombre cliente"] ?? "")}</dd>
        <dt className="text-gray-500">Monto</dt>
        <dd>{String(datos["Costo de diligencia"] ?? "")}</dd>
        <dt className="text-gray-500">N° boleta</dt>
        <dd>{caso.nBoleta ?? "—"}</dd>
        <dt className="text-gray-500">Fecha envío a pago</dt>
        <dd>
          {caso.fechaEnvioPago
            ? caso.fechaEnvioPago.toLocaleDateString("es-CL")
            : "—"}
        </dd>
        <dt className="text-gray-500">Fecha pago</dt>
        <dd>
          {caso.fechaPago ? caso.fechaPago.toLocaleDateString("es-CL") : "—"}
        </dd>
        {caso.estadoActual === "Rechazado" && (
          <>
            <dt className="text-gray-500">Motivo de rechazo</dt>
            <dd>
              {caso.motivoRechazo}
              {caso.motivoRechazo === "Otro" && caso.motivoRechazoDetalle
                ? ` — ${caso.motivoRechazoDetalle}`
                : ""}
            </dd>
          </>
        )}
      </dl>

      <h2 className="mt-8 font-medium">Historial de estados</h2>
      <ol className="mt-3 flex flex-col gap-2 text-sm">
        {caso.historial.map((h) => (
          <li key={h.id} className="border-l-2 border-primary pl-3">
            <span className="text-gray-500">
              {h.fecha.toLocaleString("es-CL")}
            </span>{" "}
            — {h.estadoAnterior ?? "(creación)"} → {h.estadoNuevo}
            {h.usuario ? ` (${h.usuario.email})` : " (sistema)"}
            {h.estadoNuevo === "Rechazado" && h.motivoRechazo && (
              <span className="text-gray-500">
                {" "}
                — motivo: {h.motivoRechazo}
                {h.motivoRechazo === "Otro" && h.motivoRechazoDetalle
                  ? ` (${h.motivoRechazoDetalle})`
                  : ""}
              </span>
            )}
          </li>
        ))}
      </ol>

      <h2 className="mt-8 font-medium">
        Documentos asociados ({caso.documentos.length})
      </h2>
      {caso.documentos.length === 0 ? (
        <p className="mt-2 text-sm text-gray-500">
          {caso.nBoleta
            ? "Sin documento subido todavía para esta boleta."
            : "Este caso no tiene N° de boleta, no se espera documento."}
        </p>
      ) : (
        <ul className="mt-2 flex flex-col gap-1 text-sm">
          {caso.documentos.map((doc) => (
            <li key={doc.id}>
              <a
                href={`/api/documentos/${doc.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                {doc.nombreArchivo}
              </a>{" "}
              <span className="text-gray-500">
                subido {doc.fechaCarga.toLocaleDateString("es-CL")}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
