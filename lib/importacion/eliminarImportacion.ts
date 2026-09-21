import { prisma } from "@/lib/prisma";

export interface ResumenEliminarImportacion {
  cantidadCasos: number;
  casosConAvance: number;
  casosConDocumento: number;
}

export async function resumenEliminarImportacion(
  importacionId: string
): Promise<ResumenEliminarImportacion> {
  const casos = await prisma.casoReembolso.findMany({
    where: { importacionId },
    select: { estadoActual: true, documentos: { select: { id: true } } },
  });

  return {
    cantidadCasos: casos.length,
    casosConAvance: casos.filter((c) => c.estadoActual !== "Pendiente").length,
    casosConDocumento: casos.filter((c) => c.documentos.length > 0).length,
  };
}

export interface ResultadoEliminarImportacion {
  ok: boolean;
  mensaje?: string;
}

export async function eliminarImportacion(
  importacionId: string
): Promise<ResultadoEliminarImportacion> {
  const importacion = await prisma.importacionExcel.findUnique({
    where: { id: importacionId },
  });
  if (!importacion) return { ok: false, mensaje: "Importación no encontrada" };

  const casos = await prisma.casoReembolso.findMany({
    where: { importacionId },
    select: { id: true, documentos: { select: { id: true } } },
  });
  const casoIds = casos.map((c) => c.id);
  const documentoIds = [
    ...new Set(casos.flatMap((c) => c.documentos.map((d) => d.id))),
  ];

  await prisma.$transaction(
    async (tx) => {
      await tx.filaEnRevision.deleteMany({
        where: {
          OR: [{ importacionId }, { casoExistenteId: { in: casoIds } }],
        },
      });

      await tx.historialEstado.deleteMany({ where: { casoId: { in: casoIds } } });

      for (const casoId of casoIds) {
        await tx.casoReembolso.update({
          where: { id: casoId },
          data: { documentos: { set: [] } },
        });
      }

      if (documentoIds.length > 0) {
        await tx.documento.updateMany({
          where: { id: { in: documentoIds }, casos: { none: {} } },
          data: { estadoMatching: "SIN_MATCH" },
        });
      }

      await tx.casoReembolso.deleteMany({ where: { importacionId } });
      await tx.importacionExcel.delete({ where: { id: importacionId } });
    },
    { timeout: 20000 }
  );

  return { ok: true };
}
