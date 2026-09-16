export type ColumnType = "integer" | "number" | "string" | "date";

export interface ColumnDef {
  key: string;
  header: string;
  required: boolean;
  type: ColumnType;
}

export const COLUMNAS: ColumnDef[] = [
  { key: "folio", header: "OT", required: true, type: "integer" },
  { key: "nombreCliente", header: "Nombre cliente", required: true, type: "string" },
  { key: "rut", header: "RUT", required: true, type: "string" },
  { key: "tribunal", header: "Tribunal", required: true, type: "string" },
  { key: "numeroRol", header: "N° de Rol", required: true, type: "integer" },
  { key: "anoRol", header: "Año Rol", required: true, type: "integer" },
  { key: "nombreReceptor", header: "Nombre receptor", required: true, type: "string" },
  { key: "conceptoGasto", header: "Conceptos gasto de receptor", required: true, type: "string" },
  { key: "monto", header: "Costo de diligencia", required: true, type: "number" },
  { key: "fechaPago", header: "Fecha pago", required: false, type: "date" },
  { key: "estudioAbogado", header: "Estudio/Abogado", required: true, type: "string" },
  { key: "fechaEnvioPago", header: "Fecha envío a pago", required: false, type: "date" },
  { key: "estadoInicial", header: "Estado reembolso", required: false, type: "string" },
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
