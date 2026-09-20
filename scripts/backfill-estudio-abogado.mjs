// Corrección retroactiva única (Spec 12): estudioAbogado pasa a ser
// columna de primera clase, pero los casos ya importados solo lo
// tienen dentro de datosImportados. Ver specs/12-reporte-por-estudio.md.
// Uso: node --env-file=.env scripts/backfill-estudio-abogado.mjs
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const casos = await prisma.casoReembolso.findMany({
  where: { estudioAbogado: null },
});

let completados = 0;
let sinValor = 0;

for (const caso of casos) {
  const valor = caso.datosImportados?.["Estudio/Abogado"];
  if (typeof valor !== "string" || valor.trim() === "") {
    console.log(`Folio ${caso.folio} (${caso.conceptoGasto}): sin "Estudio/Abogado" en datosImportados`);
    sinValor++;
    continue;
  }

  await prisma.casoReembolso.update({
    where: { id: caso.id },
    data: { estudioAbogado: valor },
  });
  completados++;
}

console.log(`\nCasos completados: ${completados} / ${casos.length}`);
if (sinValor > 0) {
  console.log(`Casos sin valor de "Estudio/Abogado" (quedaron sin completar): ${sinValor}`);
}
await prisma.$disconnect();
