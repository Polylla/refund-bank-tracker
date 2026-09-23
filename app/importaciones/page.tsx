import { getOrCreateUsuarioActual, puedeActuar } from "@/lib/usuarios";
import { prisma } from "@/lib/prisma";
import { ImportarForm } from "./ImportarForm";
import { EliminarImportacionBoton } from "./EliminarImportacionBoton";

export default async function ImportacionesPage() {
  const { roles } = await getOrCreateUsuarioActual();
  const soloLectura = !puedeActuar(roles);

  const importaciones = await prisma.importacionExcel.findMany({
    orderBy: { fecha: "desc" },
    take: 20,
    include: { usuario: true, _count: { select: { casos: true } } },
  });

  return (
    <div className="flex-1 p-8 max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold text-primary">
        Importar casos de reembolso
      </h1>

      {soloLectura ? (
        <p className="mt-6 text-sm text-gray-500">
          No tienes permiso para importar archivos.
        </p>
      ) : (
        <ImportarForm />
      )}

      <section className="mt-10 rounded-lg border p-4">
        <h2 className="font-medium">Importaciones recientes</h2>
        {importaciones.length === 0 ? (
          <p className="mt-2 text-sm text-gray-500">Ninguna todavía.</p>
        ) : (
          <ul className="mt-3 flex flex-col divide-y divide-black/5 text-sm">
            {importaciones.map((imp) => (
              <li key={imp.id} className="py-2.5 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span>
                    <span className="font-medium">
                      {imp.nombreArchivoOriginal}
                    </span>
                    <span className="text-gray-500">
                      {" "}
                      — {imp._count.casos} caso(s) — {imp.usuario.email}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs text-gray-500">
                    {imp.fecha.toLocaleString("es-CL")}
                  </span>
                </div>
                {!soloLectura && (
                  <div className="mt-1.5">
                    <EliminarImportacionBoton importacionId={imp.id} />
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
