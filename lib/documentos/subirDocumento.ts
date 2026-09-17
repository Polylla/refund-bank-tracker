import { prisma } from "@/lib/prisma";
import { uploadFile } from "@/lib/blob";
import { extraerNBoleta } from "./extraerBoleta";

export async function subirDocumento(
  nombreArchivo: string,
  tipoArchivo: string,
  contenido: Buffer
) {
  const nBoletaExtraido = extraerNBoleta(nombreArchivo);

  const blob = await uploadFile(
    `documentos/${nombreArchivo}`,
    contenido,
    "private"
  );

  const casosCoincidentes = nBoletaExtraido
    ? await prisma.casoReembolso.findMany({
        where: { nBoleta: nBoletaExtraido },
      })
    : [];

  return prisma.documento.create({
    data: {
      nombreArchivo,
      tipoArchivo,
      urlBlob: blob.url,
      nBoletaExtraido,
      estadoMatching: casosCoincidentes.length > 0 ? "MATCHEADO" : "SIN_MATCH",
      casos: { connect: casosCoincidentes.map((c) => ({ id: c.id })) },
    },
  });
}
