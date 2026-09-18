import { getOrCreateUsuarioActual, puedeActuar } from "@/lib/usuarios";
import { ImportarForm } from "./ImportarForm";

export default async function ImportacionesPage() {
  const { roles } = await getOrCreateUsuarioActual();
  const soloLectura = !puedeActuar(roles);

  return (
    <div className="flex-1 p-8 max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold text-primary">
        Importar casos de reembolso
      </h1>
      <p className="mt-1 text-sm text-gray-600">
        Sube un archivo .xlsx o .csv con el listado de casos.
      </p>

      {soloLectura ? (
        <p className="mt-6 text-sm text-gray-500">
          No tienes permiso para importar archivos.
        </p>
      ) : (
        <ImportarForm />
      )}
    </div>
  );
}
