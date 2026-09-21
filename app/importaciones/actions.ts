"use server";

import { revalidatePath } from "next/cache";
import { getOrCreateUsuarioActual, requireAnyRole, requireRole } from "@/lib/usuarios";
import {
  procesarImportacion,
  type ResultadoImportacion,
} from "@/lib/importacion/procesar";
import {
  resumenEliminarImportacion,
  eliminarImportacion,
  type ResumenEliminarImportacion,
  type ResultadoEliminarImportacion,
} from "@/lib/importacion/eliminarImportacion";

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

export async function resumenEliminarImportacionAction(
  importacionId: string
): Promise<ResumenEliminarImportacion> {
  const { roles } = await getOrCreateUsuarioActual();
  requireAnyRole(roles, ["importador", "revisor"]);

  return resumenEliminarImportacion(importacionId);
}

export async function eliminarImportacionAction(
  importacionId: string
): Promise<ResultadoEliminarImportacion> {
  const { roles } = await getOrCreateUsuarioActual();
  requireAnyRole(roles, ["importador", "revisor"]);

  const resultado = await eliminarImportacion(importacionId);
  if (resultado.ok) {
    revalidatePath("/importaciones");
    revalidatePath("/casos");
    revalidatePath("/dashboard");
  }
  return resultado;
}
