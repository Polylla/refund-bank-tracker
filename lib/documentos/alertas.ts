import { prisma } from "@/lib/prisma";

export function documentosSinMatch() {
  return prisma.documento.findMany({
    where: { estadoMatching: "SIN_MATCH" },
    orderBy: { fechaCarga: "desc" },
  });
}

export function casosSinDocumento() {
  return prisma.casoReembolso.findMany({
    where: {
      nBoleta: { not: null },
      documentos: { none: {} },
    },
    orderBy: { createdAt: "desc" },
  });
}
