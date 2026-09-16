"use server";

import { getOrCreateUsuarioActual, requireRole } from "@/lib/usuarios";
import {
  procesarImportacion,
  type ResultadoImportacion,
} from "@/lib/importacion/procesar";

export async function importarArchivo(
  formData: FormData
): Promise<ResultadoImportacion> {
  const { usuario, roles } = await getOrCreateUsuarioActual();
  requireRole(roles, "importador");

  const file = formData.get("archivo");
  if (!(file instanceof File)) {
    return { ok: false, mensaje: "No se recibió ningún archivo" };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  return procesarImportacion(buffer, file.name, usuario.id);
}
