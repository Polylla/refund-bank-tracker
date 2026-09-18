import { prisma } from "@/lib/prisma";
import { uploadFile } from "@/lib/blob";
import { extraerNBoleta } from "./extraerBoleta";
import { notificarATodosLosUsuarios } from "@/lib/notificaciones/crear";

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

  const documento = await prisma.documento.create({
    data: {
      nombreArchivo,
      tipoArchivo,
      urlBlob: blob.url,
      nBoletaExtraido,
      estadoMatching: casosCoincidentes.length > 0 ? "MATCHEADO" : "SIN_MATCH",
      casos: { connect: casosCoincidentes.map((c) => ({ id: c.id })) },
    },
  });

  if (documento.estadoMatching === "SIN_MATCH") {
    await notificarATodosLosUsuarios(
      "DOCUMENTO_SIN_MATCH",
      `El documento "${nombreArchivo}" no matcheó con ningún caso.`,
      "/documentos"
    );
  }

  return documento;
}
