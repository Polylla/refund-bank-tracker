import { TipoNotificacion } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function notificarATodosLosUsuarios(
  tipo: TipoNotificacion,
  mensaje: string,
  enlace?: string
): Promise<void> {
  const usuarios = await prisma.usuario.findMany({ select: { id: true } });
  if (usuarios.length === 0) return;

  await prisma.notificacion.createMany({
    data: usuarios.map((u) => ({
      usuarioId: u.id,
      tipo,
      mensaje,
      enlace,
    })),
  });
}
