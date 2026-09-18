import { prisma } from "@/lib/prisma";

export interface ResultadoMarcarRevisado {
  ok: boolean;
  mensaje?: string;
}

export async function marcarDuplicadoRevisado(
  casoId: string,
  usuarioId: string
): Promise<ResultadoMarcarRevisado> {
  const caso = await prisma.casoReembolso.findUnique({ where: { id: casoId } });
  if (!caso) return { ok: false, mensaje: "Caso no encontrado" };
  if (!caso.posibleDuplicado) {
    return { ok: false, mensaje: "Este caso no está marcado como posible duplicado" };
  }
  if (caso.duplicadoRevisadoEn) {
    return { ok: false, mensaje: "Este duplicado ya fue revisado" };
  }

  await prisma.casoReembolso.update({
    where: { id: casoId },
    data: {
      duplicadoRevisadoPorId: usuarioId,
      duplicadoRevisadoEn: new Date(),
    },
  });

  return { ok: true };
}
