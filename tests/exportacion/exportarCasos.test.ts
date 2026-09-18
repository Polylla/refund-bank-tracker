import { afterAll, beforeAll, describe, expect, it } from "vitest";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";
import {
  generarExcelCasos,
  obtenerCasosParaExportar,
} from "@/lib/exportacion/exportarCasos";

describe("exportación de casos a Excel", () => {
  let importacionId: string;
  let usuarioId: string;
  const casoIds: string[] = [];
  const rutUnico = `test-rut-${Date.now()}`;

  beforeAll(async () => {
    const usuario = await prisma.usuario.create({
      data: {
        clerkId: `test-clerk-export-${Date.now()}`,
        email: `test-export-${Date.now()}@example.com`,
        roles: ["IMPORTADOR"],
      },
    });
    usuarioId = usuario.id;

    const importacion = await prisma.importacionExcel.create({
      data: {
        nombreArchivoOriginal: "test-export.xlsx",
        usuarioId,
        cantidadFilas: 2,
        cantidadDuplicados: 0,
        cantidadErrores: 0,
      },
    });
    importacionId = importacion.id;

    const pendiente = await prisma.casoReembolso.create({
      data: {
        folio: "export-1",
        conceptoGasto: "X",
        datosImportados: { RUT: rutUnico, OT: "export-1" },
        estadoActual: "Pendiente",
        importacionId,
      },
    });
    casoIds.push(pendiente.id);

    const pagado = await prisma.casoReembolso.create({
      data: {
        folio: "export-2",
        conceptoGasto: "X",
        datosImportados: { RUT: "otro-rut", OT: "export-2" },
        estadoActual: "Pagado",
        importacionId,
      },
    });
    casoIds.push(pagado.id);
  });

  afterAll(async () => {
    await prisma.casoReembolso.deleteMany({ where: { importacionId } });
    await prisma.importacionExcel.delete({ where: { id: importacionId } });
    await prisma.usuario.delete({ where: { id: usuarioId } });
    await prisma.$disconnect();
  });

  it("sin filtros incluye ambos casos de prueba", async () => {
    const casos = await obtenerCasosParaExportar({});
    const ids = casos.map((c) => c.id);
    expect(ids).toEqual(expect.arrayContaining(casoIds));
  });

  it("filtra por estado", async () => {
    const casos = await obtenerCasosParaExportar({ estado: "Pagado" });
    const ids = casos.map((c) => c.id);
    expect(ids).toContain(casoIds[1]);
    expect(ids).not.toContain(casoIds[0]);
  });

  it("filtra por un campo importado arbitrario (RUT)", async () => {
    const casos = await obtenerCasosParaExportar({
      campoImportado: "RUT",
      valorImportado: rutUnico,
    });
    const ids = casos.map((c) => c.id);
    expect(ids).toEqual([casoIds[0]]);
  });

  it("genera un .xlsx válido y re-leíble con las columnas esperadas", async () => {
    // Filtra por un valor único de este test (no por estado solo, que
    // matchearía también casos reales de la base compartida).
    const buffer = await generarExcelCasos({
      campoImportado: "RUT",
      valorImportado: rutUnico,
    });

    const workbook = new ExcelJS.Workbook();
    // ver lib/importacion/readers.ts: exceljs sombrea el tipo global Buffer
    await workbook.xlsx.load(buffer as never);
    const sheet = workbook.worksheets[0];

    const headerRow = sheet.getRow(1).values as unknown[];
    const headers = headerRow.slice(1).map(String);
    expect(headers).toContain("OT");
    expect(headers).toContain("RUT");
    expect(headers).toContain("Estado actual");

    expect(sheet.rowCount).toBe(2); // header + el único caso con ese RUT

    const dataRow = sheet.getRow(2).values as unknown[];
    expect(dataRow).toContain(rutUnico);
  });
});
