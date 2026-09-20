import { obtenerCasosParaExportar } from "@/lib/exportacion/exportarCasos";
import { extraerMonto } from "./monto";

export interface ResumenOt {
  folio: string;
  cantidadTotal: number;
  cantidadPagadas: number;
  montoTotal: number;
  montoPagado: number;
}

export async function resumenPorOt(folio: string): Promise<ResumenOt> {
  const folioNormalizado = folio.trim();
  const casos = await obtenerCasosParaExportar({ folio: folioNormalizado });

  let montoTotal = 0;
  let montoPagado = 0;
  let cantidadPagadas = 0;

  for (const caso of casos) {
    const monto = extraerMonto(caso.datosImportados);
    montoTotal += monto;
    if (caso.estadoActual === "Pagado") {
      cantidadPagadas++;
      montoPagado += monto;
    }
  }

  return {
    folio: folioNormalizado,
    cantidadTotal: casos.length,
    cantidadPagadas,
    montoTotal,
    montoPagado,
  };
}
