"use server";

import { getOrCreateUsuarioActual, requireAnyRole } from "@/lib/usuarios";
import {
  crearCasoManual,
  type DatosCasoManual,
} from "@/lib/importacion/casoManual";
import type { ResultadoImportacion } from "@/lib/importacion/procesar";

function valorOpcional(formData: FormData, campo: string): string | undefined {
  const valor = String(formData.get(campo) ?? "").trim();
  return valor || undefined;
}

export async function crearCasoManualAction(
  formData: FormData
): Promise<ResultadoImportacion> {
  const { usuario, roles } = await getOrCreateUsuarioActual();
  requireAnyRole(roles, ["importador", "revisor"]);

  const datos: DatosCasoManual = {
    folio: String(formData.get("folio") ?? ""),
    nombreCliente: String(formData.get("nombreCliente") ?? ""),
    rut: String(formData.get("rut") ?? ""),
    tribunal: String(formData.get("tribunal") ?? ""),
    numeroRol: String(formData.get("numeroRol") ?? ""),
    anoRol: String(formData.get("anoRol") ?? ""),
    nombreReceptor: String(formData.get("nombreReceptor") ?? ""),
    conceptoGasto: String(formData.get("conceptoGasto") ?? ""),
    monto: String(formData.get("monto") ?? ""),
    estudioAbogado: String(formData.get("estudioAbogado") ?? ""),
    nBoleta: valorOpcional(formData, "nBoleta"),
    fechaPago: valorOpcional(formData, "fechaPago"),
    fechaEnvioPago: valorOpcional(formData, "fechaEnvioPago"),
    estadoInicial: valorOpcional(formData, "estadoInicial"),
  };

  return crearCasoManual(datos, usuario.id);
}
