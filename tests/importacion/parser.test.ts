import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  parseReembolsosXlsx,
  parseReembolsosCsv,
} from "@/lib/importacion/parser";

const FIXTURE_XLSX = path.join(
  __dirname,
  "..",
  "fixtures",
  "reembolsos-ejemplo.xlsx"
);
const FIXTURE_CSV = path.join(
  __dirname,
  "..",
  "fixtures",
  "reembolsos-ejemplo.csv"
);

describe("parseReembolsosXlsx", () => {
  it("importa las 15 filas válidas y descarta la fila de totales", async () => {
    const buffer = readFileSync(FIXTURE_XLSX);
    const result = await parseReembolsosXlsx(buffer);

    expect(result.columnasFaltantes).toEqual([]);
    expect(result.errores).toEqual([]);
    expect(result.filasDescartadas).toBe(1);
    expect(result.filasValidas).toHaveLength(15);
    expect(result.filasValidas[0].folio).toBe("90000001");
    expect(result.filasValidas[0].monto).toBe(40000);
  });

  it("rechaza el archivo completo si falta una columna obligatoria", async () => {
    // Simula un archivo sin la columna RUT quitándola del buffer no es trivial;
    // en vez de eso probamos el caso vía CSV, más fácil de mutar como texto.
    const csv = readFileSync(FIXTURE_CSV, "utf-8");
    const sinRut = csv
      .split("\n")
      .map((line) => {
        const cols = line.split(",");
        cols.splice(2, 1); // quita la columna RUT (header y datos, para no desalinear)
        return cols.join(",");
      })
      .join("\n");

    const result = parseReembolsosCsv(sinRut);
    expect(result.columnasFaltantes).toContain("RUT");
    expect(result.filasValidas).toEqual([]);
  });

  it("reporta un error de fila específico sin insertar nada si un monto no es numérico", async () => {
    const csv = readFileSync(FIXTURE_CSV, "utf-8");
    const lines = csv.split("\n");
    const cols = lines[1].split(",");
    cols[8] = "no-es-numero"; // columna "Costo de diligencia"
    lines[1] = cols.join(",");
    const corrupto = lines.join("\n");

    const result = parseReembolsosCsv(corrupto);
    expect(result.filasValidas).toEqual([]);
    expect(result.errores.length).toBeGreaterThan(0);
    expect(result.errores[0].campo).toBe("Costo de diligencia");
    expect(result.errores[0].fila).toBe(1);
  });

  it("no cuenta la fila de totales como error ni como caso importado", async () => {
    const buffer = readFileSync(FIXTURE_XLSX);
    const result = await parseReembolsosXlsx(buffer);
    const folios = result.filasValidas.map((f) => f.folio);
    expect(folios).not.toContain(null);
    expect(result.filasValidas.every((f) => f.conceptoGasto !== "TOTAL")).toBe(
      true
    );
  });

  it("retorna 0 filas válidas y 0 errores para un archivo solo con encabezados", async () => {
    const csv = readFileSync(FIXTURE_CSV, "utf-8");
    const soloEncabezado = csv.split("\n")[0];
    const result = parseReembolsosCsv(soloEncabezado);
    expect(result.filasValidas).toEqual([]);
    expect(result.errores).toEqual([]);
    expect(result.filasDescartadas).toBe(0);
  });
});

describe("parseReembolsosCsv", () => {
  it("produce el mismo resultado que el XLSX equivalente", async () => {
    const bufferXlsx = readFileSync(FIXTURE_XLSX);
    const xlsxResult = await parseReembolsosXlsx(bufferXlsx);

    const csvContent = readFileSync(FIXTURE_CSV, "utf-8");
    const csvResult = parseReembolsosCsv(csvContent);

    expect(csvResult.filasValidas).toHaveLength(xlsxResult.filasValidas.length);
    expect(csvResult.filasValidas.map((f) => f.folio)).toEqual(
      xlsxResult.filasValidas.map((f) => f.folio)
    );
    expect(csvResult.filasDescartadas).toBe(xlsxResult.filasDescartadas);
  });
});
