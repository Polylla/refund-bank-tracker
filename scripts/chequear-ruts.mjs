// Chequeo de solo lectura (Spec 09, Task 9.2): reporta qué casos reales
// tienen un RUT que no pasaría la validación agregada en Task 9.1, sin
// modificar nada. Ver specs/09-validacion-rut.md.
// Uso: node --env-file=.env scripts/chequear-ruts.mjs
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const RUT_PATTERN = /^(\d{1,8})-?([\dK])$/;

function calcularDigitoVerificador(cuerpo) {
  let suma = 0;
  let multiplo = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += Number(cuerpo[i]) * multiplo;
    multiplo = multiplo === 7 ? 2 : multiplo + 1;
  }
  const resto = 11 - (suma % 11);
  if (resto === 11) return "0";
  if (resto === 10) return "K";
  return String(resto);
}

function normalizarRut(raw) {
  const limpio = raw.trim().replace(/\./g, "").replace(/\s+/g, "").toUpperCase();
  const match = limpio.match(RUT_PATTERN);
  if (!match) return null;
  const [, cuerpo, dvIngresado] = match;
  const dvEsperado = calcularDigitoVerificador(cuerpo);
  if (dvEsperado !== dvIngresado) return null;
  return `${cuerpo}-${dvEsperado.toLowerCase()}`;
}

const casos = await prisma.casoReembolso.findMany({
  select: { id: true, folio: true, conceptoGasto: true, datosImportados: true },
});

let invalidos = 0;

for (const caso of casos) {
  const rutRaw = caso.datosImportados?.RUT;
  if (typeof rutRaw !== "string" || normalizarRut(rutRaw) === null) {
    console.log(`Folio ${caso.folio} (${caso.conceptoGasto}): RUT inválido -> "${rutRaw}"`);
    invalidos++;
  }
}

console.log(`\nCasos con RUT inválido: ${invalidos} / ${casos.length}`);
await prisma.$disconnect();
