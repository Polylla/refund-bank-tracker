import { prisma } from "@/lib/prisma";

export interface ResultadoVinculacion {
  ok: boolean;
  mensaje?: string;
}

export function buscarCasosParaVincular(query: string) {
  const texto = query.trim();
  if (!texto) return Promise.resolve([]);

  return prisma.casoReembolso.findMany({
    where: {
      OR: [
        { folio: { contains: texto, mode: "insensitive" } },
        { nBoleta: { contains: texto, mode: "insensitive" } },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

export async function vincularDocumentoManualmente(
  documentoId: string,
  casoIds: string[]
): Promise<ResultadoVinculacion> {
  if (casoIds.length === 0) {
    return { ok: false, mensaje: "Selecciona al menos un caso" };
  }

  const documento = await prisma.documento.findUnique({
    where: { id: documentoId },
  });
  if (!documento) return { ok: false, mensaje: "Documento no encontrado" };
  if (documento.estadoMatching === "MATCHEADO") {
    return {
      ok: false,
      mensaje: "Este documento ya está matcheado, no se puede reasignar",
    };
  }

  await prisma.documento.update({
    where: { id: documentoId },
    data: {
      estadoMatching: "MATCHEADO",
      casos: { connect: casoIds.map((id) => ({ id })) },
    },
  });

  return { ok: true };
}
