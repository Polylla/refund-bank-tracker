"use server";

import { revalidatePath } from "next/cache";
import { getOrCreateUsuarioActual, requireAnyRole } from "@/lib/usuarios";
import {
  cambiarEstado,
  type ResultadoCambioEstado,
} from "@/lib/estados/cambiarEstado";
import {
  marcarDuplicadoRevisado,
  type ResultadoMarcarRevisado,
} from "@/lib/notificaciones/marcarDuplicadoRevisado";

export async function cambiarEstadoAction(
  casoId: string,
  nuevoEstado: string,
  motivoRechazo?: string,
  motivoRechazoDetalle?: string
): Promise<ResultadoCambioEstado> {
  const { usuario, roles } = await getOrCreateUsuarioActual();
  requireAnyRole(roles, ["importador", "revisor"]);

  const resultado = await cambiarEstado(
    casoId,
    nuevoEstado,
    usuario.id,
    motivoRechazo,
    motivoRechazoDetalle
  );
  if (resultado.ok) {
    revalidatePath("/casos");
    revalidatePath(`/casos/${casoId}`);
  }
  return resultado;
}

export async function marcarDuplicadoRevisadoAction(
  casoId: string
): Promise<ResultadoMarcarRevisado> {
  const { usuario, roles } = await getOrCreateUsuarioActual();
  requireAnyRole(roles, ["importador", "revisor"]);

  const resultado = await marcarDuplicadoRevisado(casoId, usuario.id);
  if (resultado.ok) revalidatePath("/casos");
  return resultado;
}
