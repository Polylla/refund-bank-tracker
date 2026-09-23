// Script de uso único: borra todos los datos operativos (casos,
// importaciones, documentos, historial, notificaciones, filas en
// revisión) para dejar la app lista para el trabajo real, pero
// CONSERVA los usuarios y sus roles. Irreversible.
// Uso: node --env-file=.env scripts/reset-datos.mjs
import { PrismaClient } from "@prisma/client";
import { del } from "@vercel/blob";

const prisma = new PrismaClient();

const documentos = await prisma.documento.findMany({ select: { urlBlob: true } });

await prisma.$transaction([
  prisma.notificacion.deleteMany(),
  prisma.filaEnRevision.deleteMany(),
  prisma.historialEstado.deleteMany(),
  prisma.documento.deleteMany(),
  prisma.casoReembolso.deleteMany(),
  prisma.importacionExcel.deleteMany(),
]);

console.log(
  `Borrados: notificaciones, filas en revisión, historial, ${documentos.length} documento(s), casos, importaciones.`
);

let blobsEliminados = 0;
for (const doc of documentos) {
  try {
    await del(doc.urlBlob);
    blobsEliminados++;
  } catch {
    // best-effort: si falla, el archivo queda huérfano en el blob storage
  }
}
console.log(`Blobs eliminados: ${blobsEliminados} / ${documentos.length}`);

const usuarios = await prisma.usuario.count();
console.log(`Usuarios conservados: ${usuarios}`);

await prisma.$disconnect();
