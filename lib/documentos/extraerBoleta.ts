/**
 * Extrae el N° de boleta del nombre de un archivo subido (ver
 * specs/05-matching-documentos.md). Los PDFs vienen nombrados por el
 * número de boleta, a veces con un sufijo "(1)" típico de descargas
 * duplicadas del navegador (ej. "38(1).pdf").
 */
export function extraerNBoleta(nombreArchivo: string): string | null {
  const sinExtension = nombreArchivo.replace(/\.[^.]+$/, "");
  const match = sinExtension.match(/^(\d+)/);
  return match ? match[1] : null;
}
