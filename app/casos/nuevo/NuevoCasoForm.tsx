"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { crearCasoManualAction } from "./actions";
import { ESTADOS } from "@/lib/estados/estados";
import type { ResultadoImportacion } from "@/lib/importacion/procesar";

async function accion(
  _previo: ResultadoImportacion | null,
  formData: FormData
) {
  return crearCasoManualAction(formData);
}

function Campo({
  label,
  name,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      {label}
      {required && <span className="text-danger"> *</span>}
      <input
        type={type}
        name={name}
        required={required}
        className="rounded-lg border p-1.5"
      />
    </label>
  );
}

export function NuevoCasoForm() {
  const [resultado, formAction, pending] = useActionState<
    ResultadoImportacion | null,
    FormData
  >(accion, null);
  const router = useRouter();

  useEffect(() => {
    if (resultado?.ok && (resultado.resumen?.filasImportadas ?? 0) > 0) {
      router.push("/casos");
    }
  }, [resultado, router]);

  return (
    <>
      <form
        action={formAction}
        className="mt-6 grid grid-cols-1 gap-4 rounded-lg border p-4 sm:grid-cols-2"
      >
        <Campo label="OT" name="folio" required />
        <Campo label="Nombre cliente" name="nombreCliente" required />
        <Campo label="RUT" name="rut" required />
        <Campo label="Tribunal" name="tribunal" required />
        <Campo label="N° de Rol" name="numeroRol" required />
        <Campo label="Año Rol" name="anoRol" required />
        <Campo label="Nombre receptor" name="nombreReceptor" required />
        <Campo label="Concepto de gasto" name="conceptoGasto" required />
        <Campo label="Monto" name="monto" type="number" required />
        <Campo label="Estudio/Abogado" name="estudioAbogado" required />
        <Campo label="N° Boleta (opcional)" name="nBoleta" />
        <label className="flex flex-col gap-1 text-sm">
          Estado inicial (opcional)
          <select name="estadoInicial" className="rounded-lg border p-1.5">
            <option value="">(inferir automáticamente)</option>
            {ESTADOS.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </label>
        <Campo label="Fecha pago (opcional)" name="fechaPago" type="date" />
        <Campo
          label="Fecha envío a pago (opcional)"
          name="fechaEnvioPago"
          type="date"
        />

        <button
          type="submit"
          disabled={pending}
          className="self-start rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50 sm:col-span-2"
        >
          {pending ? "Creando..." : "Crear caso"}
        </button>
      </form>

      {resultado && !resultado.ok && (
        <div className="mt-4 rounded border p-4 text-sm">
          <p className="font-medium text-red-700">{resultado.mensaje}</p>
          {resultado.errores && resultado.errores.length > 0 && (
            <ul className="mt-2 list-inside list-disc">
              {resultado.errores.map((e, i) => (
                <li key={i}>
                  {e.campo}: {e.mensaje}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {resultado?.ok && (resultado.resumen?.filasEnRevision ?? 0) > 0 && (
        <div className="mt-4 rounded border p-4 text-sm">
          <p className="font-medium text-amber-700">
            Ya existe un caso con esa OT + Concepto de gasto. Quedó en la cola
            de revisión en vez de crear un caso nuevo.
          </p>
        </div>
      )}
    </>
  );
}
