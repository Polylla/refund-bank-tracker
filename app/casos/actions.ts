"use server";

import { revalidatePath } from "next/cache";
import { getOrCreateUsuarioActual, requireAnyRole } from "@/lib/usuarios";
import {
  cambiarEstado,
  type ResultadoCambioEstado,
} from "@/lib/estados/cambiarEstado";

export async function cambiarEstadoAction(
  casoId: string,
  nuevoEstado: string
): Promise<ResultadoCambioEstado> {
  const { usuario, roles } = await getOrCreateUsuarioActual();
  requireAnyRole(roles, ["importador", "revisor"]);

  const resultado = await cambiarEstado(casoId, nuevoEstado, usuario.id);
  if (resultado.ok) {
    revalidatePath("/casos");
    revalidatePath(`/casos/${casoId}`);
  }
  return resultado;
}
