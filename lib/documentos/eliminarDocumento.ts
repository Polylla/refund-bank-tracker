import { del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";

export interface ResultadoEliminarDocumento {
  ok: boolean;
  mensaje?: string;
}

export async function eliminarDocumento(
  documentoId: string
): Promise<ResultadoEliminarDocumento> {
  const documento = await prisma.documento.findUnique({
    where: { id: documentoId },
  });
  if (!documento) return { ok: false, mensaje: "Documento no encontrado" };

  await prisma.documento.delete({ where: { id: documentoId } });

  try {
    await del(documento.urlBlob);
  } catch {
    // Best-effort: el archivo queda huérfano en el blob storage, pero
    // no revertimos el borrado de la fila por esto.
  }

  return { ok: true };
}
