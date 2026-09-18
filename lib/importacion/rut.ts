const RUT_PATTERN = /^(\d{1,8})-?([\dK])$/;

function calcularDigitoVerificador(cuerpo: string): string {
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

export function normalizarRut(raw: string): string | null {
  const limpio = raw.trim().replace(/\./g, "").replace(/\s+/g, "").toUpperCase();
  const match = limpio.match(RUT_PATTERN);
  if (!match) return null;

  const [, cuerpo, dvIngresado] = match;
  const dvEsperado = calcularDigitoVerificador(cuerpo);
  if (dvEsperado !== dvIngresado) return null;

  return `${cuerpo}-${dvEsperado.toLowerCase()}`;
}
