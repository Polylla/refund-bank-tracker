"use server";

import { revalidatePath } from "next/cache";
import { getOrCreateUsuarioActual, requireRole } from "@/lib/usuarios";
import {
  aprobarFila,
  descartarFila,
  type ResultadoAccionRevision,
} from "@/lib/revision/acciones";

export async function aprobarFilaAction(
  filaId: string
): Promise<ResultadoAccionRevision> {
  const { usuario, roles } = await getOrCreateUsuarioActual();
  requireRole(roles, "revisor");

  const resultado = await aprobarFila(filaId, usuario.id);
  if (resultado.ok) revalidatePath("/revision");
  return resultado;
}

export async function descartarFilaAction(
  filaId: string
): Promise<ResultadoAccionRevision> {
  const { usuario, roles } = await getOrCreateUsuarioActual();
  requireRole(roles, "revisor");

  const resultado = await descartarFila(filaId, usuario.id);
  if (resultado.ok) revalidatePath("/revision");
  return resultado;
}
