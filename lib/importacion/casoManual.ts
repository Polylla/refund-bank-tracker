import Papa from "papaparse";
import { COLUMNAS } from "./columns";
import { procesarImportacion, type ResultadoImportacion } from "./procesar";

export interface DatosCasoManual {
  folio: string;
  nombreCliente: string;
  rut: string;
  tribunal: string;
  numeroRol: string;
  anoRol: string;
  nombreReceptor: string;
  conceptoGasto: string;
  monto: string;
  nBoleta?: string;
  fechaPago?: string;
  estudioAbogado: string;
  fechaEnvioPago?: string;
  estadoInicial?: string;
}

export async function crearCasoManual(
  datos: DatosCasoManual,
  usuarioId: string
): Promise<ResultadoImportacion> {
  const headers = COLUMNAS.map((def) => def.headers[0]);
  const datosPorClave = datos as unknown as Record<string, string | undefined>;
  const fila = COLUMNAS.map((def) => datosPorClave[def.key] ?? "");

  const csv = Papa.unparse({ fields: headers, data: [fila] });
  const buffer = Buffer.from(csv, "utf-8");
  const nombreArchivo = `Ingreso manual - ${new Date().toISOString()}.csv`;

  return procesarImportacion(buffer, nombreArchivo, usuarioId);
}
