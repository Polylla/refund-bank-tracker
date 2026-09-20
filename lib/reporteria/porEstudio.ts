import { prisma } from "@/lib/prisma";
import { ESTADOS, esEstadoValido, type Estado } from "@/lib/estados/estados";

interface ResumenEstado {
  cantidad: number;
  monto: number;
}

export interface ResumenEstudio {
  estudio: string;
  cantidadTotal: number;
  montoTotal: number;
  porEstado: Record<Estado, ResumenEstado>;
}

function estadoVacio(): Record<Estado, ResumenEstado> {
  return Object.fromEntries(
    ESTADOS.map((estado) => [estado, { cantidad: 0, monto: 0 }])
  ) as Record<Estado, ResumenEstado>;
}

function extraerMonto(datosImportados: unknown): number {
  const valor = (datosImportados as Record<string, unknown> | null)?.[
    "Costo de diligencia"
  ];
  const numero = typeof valor === "number" ? valor : Number(valor);
  return Number.isFinite(numero) ? numero : 0;
}

export async function resumenPorEstudio(): Promise<ResumenEstudio[]> {
  const casos = await prisma.casoReembolso.findMany({
    select: {
      estudioAbogado: true,
      estadoActual: true,
      datosImportados: true,
    },
  });

  const porEstudio = new Map<string, ResumenEstudio>();

  for (const caso of casos) {
    let resumen = porEstudio.get(caso.estudioAbogado);
    if (!resumen) {
      resumen = {
        estudio: caso.estudioAbogado,
        cantidadTotal: 0,
        montoTotal: 0,
        porEstado: estadoVacio(),
      };
      porEstudio.set(caso.estudioAbogado, resumen);
    }

    const monto = extraerMonto(caso.datosImportados);
    resumen.cantidadTotal++;
    resumen.montoTotal += monto;

    if (esEstadoValido(caso.estadoActual)) {
      resumen.porEstado[caso.estadoActual].cantidad++;
      resumen.porEstado[caso.estadoActual].monto += monto;
    }
  }

  return Array.from(porEstudio.values()).sort((a, b) =>
    a.estudio.localeCompare(b.estudio)
  );
}
