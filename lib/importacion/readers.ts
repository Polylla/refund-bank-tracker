import ExcelJS from "exceljs";
import Papa from "papaparse";

export interface RawSheet {
  headers: string[];
  rows: unknown[][];
}

export async function readXlsxRows(buffer: Buffer): Promise<RawSheet> {
  const workbook = new ExcelJS.Workbook();
  // exceljs shadows the global `Buffer` type with a minimal ambient
  // declaration that newer @types/node's generic Buffer doesn't satisfy
  // structurally, even though the real runtime value is a plain Buffer.
  await workbook.xlsx.load(buffer as never);
  const worksheet = workbook.worksheets[0];

  const headers: string[] = [];
  const rows: unknown[][] = [];

  if (!worksheet) return { headers, rows };

  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    const values = row.values as unknown[];
    const cells = values.slice(1).map(normalizeCellValue);
    if (rowNumber === 1) {
      headers.push(...cells.map((c) => String(c ?? "").trim()));
    } else {
      rows.push(cells);
    }
  });

  return { headers, rows };
}

function normalizeCellValue(value: unknown): unknown {
  if (value && typeof value === "object") {
    if (value instanceof Date) return value;
    if ("text" in (value as Record<string, unknown>)) {
      return (value as { text: unknown }).text;
    }
    if ("result" in (value as Record<string, unknown>)) {
      return (value as { result: unknown }).result;
    }
  }
  return value ?? null;
}

export function readCsvRows(content: string): RawSheet {
  const parsed = Papa.parse<string[]>(content.replace(/\r?\n$/, ""), {
    skipEmptyLines: true,
  });
  const [headerRow, ...rest] = parsed.data;
  return {
    headers: (headerRow ?? []).map((h) => String(h).trim()),
    rows: rest,
  };
}
