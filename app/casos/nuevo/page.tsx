import { getOrCreateUsuarioActual, puedeActuar } from "@/lib/usuarios";
import { NuevoCasoForm } from "./NuevoCasoForm";

export default async function NuevoCasoPage() {
  const { roles } = await getOrCreateUsuarioActual();
  const soloLectura = !puedeActuar(roles);

  return (
    <div className="flex-1 p-8 max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold text-primary">
        Nuevo caso de reembolso
      </h1>
      <p className="mt-1 text-sm text-gray-600">
        Ingresá un caso a mano cuando el origen no sea un Excel. Se aplican
        las mismas validaciones que al importar (RUT, duplicados por OT +
        concepto).
      </p>

      {soloLectura ? (
        <p className="mt-6 text-sm text-gray-500">
          No tienes permiso para crear casos.
        </p>
      ) : (
        <NuevoCasoForm />
      )}
    </div>
  );
}
