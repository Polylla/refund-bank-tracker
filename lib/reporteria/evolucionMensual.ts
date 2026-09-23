import { prisma } from "@/lib/prisma";

export interface CasosPorMes {
  mes: string;
  label: string;
  cantidad: number;
}

function clave(fecha: Date): string {
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;
}

export async function casosCreadosPorMes(meses: number): Promise<CasosPorMes[]> {
  const ahora = new Date();
  const inicio = new Date(ahora.getFullYear(), ahora.getMonth() - (meses - 1), 1);

  const casos = await prisma.casoReembolso.findMany({
    where: { createdAt: { gte: inicio } },
    select: { createdAt: true },
  });

  const buckets = new Map<string, number>();
  for (let i = 0; i < meses; i++) {
    const fecha = new Date(inicio.getFullYear(), inicio.getMonth() + i, 1);
    buckets.set(clave(fecha), 0);
  }

  for (const caso of casos) {
    const k = clave(caso.createdAt);
    if (buckets.has(k)) {
      buckets.set(k, (buckets.get(k) ?? 0) + 1);
    }
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .map(([mes, cantidad]) => {
      const [anio, mesNum] = mes.split("-").map(Number);
      const fecha = new Date(anio, mesNum - 1, 1);
      return {
        mes,
        label: fecha.toLocaleDateString("es-CL", {
          month: "short",
          year: "numeric",
        }),
        cantidad,
      };
    });
}
