import { claveIdentidad } from "./identidad";
import type { CasoImportado } from "./parser";

/**
 * Marca como posibleDuplicado cualquier fila cuya clave de identidad
 * (folio + conceptoGasto) se repite dentro del mismo archivo.
 */
export function marcarDuplicadosIntraArchivo(
  filas: CasoImportado[]
): CasoImportado[] {
  const conteo = new Map<string, number>();
  for (const fila of filas) {
    const clave = claveIdentidad(fila.folio, fila.conceptoGasto);
    conteo.set(clave, (conteo.get(clave) ?? 0) + 1);
  }

  return filas.map((fila) => {
    const clave = claveIdentidad(fila.folio, fila.conceptoGasto);
    return { ...fila, posibleDuplicado: (conteo.get(clave) ?? 0) > 1 };
  });
}
