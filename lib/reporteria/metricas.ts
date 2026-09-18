import { prisma } from "@/lib/prisma";
import { ESTADOS } from "@/lib/estados/estados";

export async function casosPorEstado(): Promise<
  { estado: string; cantidad: number }[]
> {
  const grupos = await prisma.casoReembolso.groupBy({
    by: ["estadoActual"],
    _count: { _all: true },
  });

  const porEstado = new Map(
    grupos.map((g) => [g.estadoActual, g._count._all])
  );

  return ESTADOS.map((estado) => ({
    estado,
    cantidad: porEstado.get(estado) ?? 0,
  }));
}

export function filasEnRevisionPendientes(): Promise<number> {
  return prisma.filaEnRevision.count({ where: { estado: "PENDIENTE" } });
}

export function importacionesRecientes(limite: number) {
  return prisma.importacionExcel.findMany({
    orderBy: { fecha: "desc" },
    take: limite,
    include: { usuario: true },
  });
}
