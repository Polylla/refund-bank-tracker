import { COLUMNAS, FOLIO_KEY, normalizeHeader, type ColumnDef } from "./columns";
import { readXlsxRows, readCsvRows, type RawSheet } from "./readers";

export interface ErrorFila {
  fila: number;
  campo: string;
  mensaje: string;
}

export interface CasoImportado {
  folio: string;
  nombreCliente: string;
  rut: string;
  tribunal: string;
  numeroRol: number;
  anoRol: number;
  nombreReceptor: string;
  conceptoGasto: string;
  monto: number;
  nBoleta: string | null;
  fechaPago: Date | null;
  estudioAbogado: string;
  fechaEnvioPago: Date | null;
  estadoInicial: string | null;
  posibleDuplicado: boolean;
  datosImportados: Record<string, unknown>;
}

export interface ParseResult {
  filasValidas: CasoImportado[];
  errores: ErrorFila[];
  filasDescartadas: number;
  columnasFaltantes: string[];
}

export async function parseReembolsosXlsx(buffer: Buffer): Promise<ParseResult> {
  return parseSheet(await readXlsxRows(buffer));
}

export function parseReembolsosCsv(content: string): ParseResult {
  return parseSheet(readCsvRows(content));
}

function nombreCanonico(def: ColumnDef): string {
  return def.headers[0];
}

function parseSheet(sheet: RawSheet): ParseResult {
  const normalizedHeaders = sheet.headers.map(normalizeHeader);
  const columnaIndexPorClave = new Map<string, number>();

  for (const def of COLUMNAS) {
    const idx = normalizedHeaders.findIndex((h) =>
      def.headers.some((alias) => normalizeHeader(alias) === h)
    );
    if (idx !== -1) columnaIndexPorClave.set(def.key, idx);
  }

  const columnasFaltantes = COLUMNAS.filter(
    (def) => def.required && !columnaIndexPorClave.has(def.key)
  ).map(nombreCanonico);

  if (columnasFaltantes.length > 0) {
    return { filasValidas: [], errores: [], filasDescartadas: 0, columnasFaltantes };
  }

  const errores: ErrorFila[] = [];
  const filasValidas: CasoImportado[] = [];
  let filasDescartadas = 0;

  const getRaw = (row: unknown[], key: string): unknown => {
    const idx = columnaIndexPorClave.get(key);
    return idx === undefined ? undefined : row[idx];
  };

  sheet.rows.forEach((row, i) => {
    const filaNumero = i + 1;

    if (isBlank(getRaw(row, FOLIO_KEY))) {
      filasDescartadas++;
      return;
    }

    const rowErrors: ErrorFila[] = [];
    const parsed: Record<string, unknown> = {};

    for (const def of COLUMNAS) {
      const raw = getRaw(row, def.key);
      const { value, error } = parseValue(raw, def);
      if (error) {
        rowErrors.push({ fila: filaNumero, campo: nombreCanonico(def), mensaje: error });
      }
      parsed[def.key] = value;
    }

    if (rowErrors.length > 0) {
      errores.push(...rowErrors);
      return;
    }

    const datosImportados = Object.fromEntries(
      COLUMNAS.map((def) => [nombreCanonico(def), getRaw(row, def.key) ?? null])
    );

    filasValidas.push({
      folio: String(parsed.folio),
      nombreCliente: parsed.nombreCliente as string,
      rut: parsed.rut as string,
      tribunal: parsed.tribunal as string,
      numeroRol: parsed.numeroRol as number,
      anoRol: parsed.anoRol as number,
      nombreReceptor: parsed.nombreReceptor as string,
      conceptoGasto: parsed.conceptoGasto as string,
      monto: parsed.monto as number,
      nBoleta: parsed.nBoleta !== null ? String(parsed.nBoleta) : null,
      fechaPago: (parsed.fechaPago as Date | null) ?? null,
      estudioAbogado: parsed.estudioAbogado as string,
      fechaEnvioPago: (parsed.fechaEnvioPago as Date | null) ?? null,
      estadoInicial: (parsed.estadoInicial as string | null) || null,
      posibleDuplicado: false,
      datosImportados,
    });
  });

  if (errores.length > 0) {
    return { filasValidas: [], errores, filasDescartadas, columnasFaltantes: [] };
  }

  return { filasValidas, errores: [], filasDescartadas, columnasFaltantes: [] };
}

function isBlank(value: unknown): boolean {
  return value === undefined || value === null || String(value).trim() === "";
}

function parseValue(
  raw: unknown,
  def: ColumnDef
): { value: unknown; error?: string } {
  if (isBlank(raw)) {
    if (def.required) {
      return { value: null, error: `"${nombreCanonico(def)}" es obligatorio` };
    }
    return { value: null };
  }

  switch (def.type) {
    case "integer": {
      const n = typeof raw === "number" ? raw : Number(String(raw).trim());
      if (!Number.isInteger(n)) {
        return { value: null, error: `"${nombreCanonico(def)}" debe ser un número entero` };
      }
      return { value: n };
    }
    case "number": {
      const n = typeof raw === "number" ? raw : Number(String(raw).trim());
      if (Number.isNaN(n)) {
        return { value: null, error: `"${nombreCanonico(def)}" debe ser un número` };
      }
      return { value: n };
    }
    case "date": {
      if (raw instanceof Date) return { value: raw };
      const d = new Date(String(raw));
      if (Number.isNaN(d.getTime())) {
        return { value: null, error: `"${nombreCanonico(def)}" debe ser una fecha válida` };
      }
      return { value: d };
    }
    case "string":
    default:
      return { value: String(raw).trim() };
  }
}
