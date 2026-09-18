export type ColumnType = "integer" | "number" | "string" | "date" | "rut";

export interface ColumnDef {
  key: string;
  /** Nombres de columna aceptados; el primero es el canónico (usado en
   * mensajes de error y como clave dentro de datosImportados). El
   * formato de columnas del Excel de origen evoluciona entre archivos
   * (ver specs/02-ingesta-excel.md), así que cada campo puede aceptar
   * más de un nombre. */
  headers: string[];
  required: boolean;
  type: ColumnType;
}

export const COLUMNAS: ColumnDef[] = [
  { key: "folio", headers: ["OT"], required: true, type: "integer" },
  { key: "nombreCliente", headers: ["Nombre cliente"], required: true, type: "string" },
  { key: "rut", headers: ["RUT"], required: true, type: "rut" },
  { key: "tribunal", headers: ["Tribunal"], required: true, type: "string" },
  { key: "numeroRol", headers: ["N° de Rol"], required: true, type: "integer" },
  { key: "anoRol", headers: ["Año Rol"], required: true, type: "integer" },
  { key: "nombreReceptor", headers: ["Nombre receptor"], required: true, type: "string" },
  {
    key: "conceptoGasto",
    headers: ["Conceptos gasto de receptor", "Concepto gasto de receptor"],
    required: true,
    type: "string",
  },
  { key: "monto", headers: ["Costo de diligencia"], required: true, type: "number" },
  { key: "nBoleta", headers: ["N° BOLETA"], required: false, type: "integer" },
  {
    key: "fechaPago",
    headers: ["Fecha pago", "Fecha pago diligencia receptor"],
    required: false,
    type: "date",
  },
  { key: "estudioAbogado", headers: ["Estudio/Abogado"], required: true, type: "string" },
  { key: "fechaEnvioPago", headers: ["Fecha envío a pago"], required: false, type: "date" },
  { key: "estadoInicial", headers: ["Estado reembolso"], required: false, type: "string" },
];

export const FOLIO_KEY = "folio";

export function normalizeHeader(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}
