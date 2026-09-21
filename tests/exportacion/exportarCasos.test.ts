import { afterAll, beforeAll, describe, expect, it } from "vitest";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";
import {
  generarExcelCasos,
  obtenerCasosParaExportar,
  obtenerHistorialParaExportar,
} from "@/lib/exportacion/exportarCasos";

describe("exportación de casos a Excel", () => {
  let importacionId: string;
  let usuarioId: string;
  let usuarioEmail: string;
  const casoIds: string[] = [];
  const rutUnico = `test-rut-${Date.now()}`;

  beforeAll(async () => {
    usuarioEmail = `test-export-${Date.now()}@example.com`;
    const usuario = await prisma.usuario.create({
      data: {
        clerkId: `test-clerk-export-${Date.now()}`,
        email: usuarioEmail,
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
        estudioAbogado: "Estudio Test",
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
        estudioAbogado: "Estudio Test",
        importacionId,
      },
    });
    casoIds.push(pagado.id);

    await prisma.historialEstado.create({
      data: {
        casoId: pendiente.id,
        estadoAnterior: null,
        estadoNuevo: "Pendiente",
        usuarioId,
      },
    });
    await prisma.historialEstado.create({
      data: {
        casoId: pagado.id,
        estadoAnterior: "Pendiente",
        estadoNuevo: "Pagado",
        usuarioId: null, // corrección de sistema, sin usuario (ver spec 04)
      },
    });
  });

  afterAll(async () => {
    await prisma.historialEstado.deleteMany({ where: { casoId: { in: casoIds } } });
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

  it("busqueda única encuentra por RUT", async () => {
    const casos = await obtenerCasosParaExportar({ busqueda: rutUnico });
    const ids = casos.map((c) => c.id);
    expect(ids).toEqual([casoIds[0]]);
  });

  it("busqueda única encuentra por OT (folio)", async () => {
    const casos = await obtenerCasosParaExportar({ busqueda: "export-2" });
    const ids = casos.map((c) => c.id);
    expect(ids).toContain(casoIds[1]);
    expect(ids).not.toContain(casoIds[0]);
  });

  it("estadoIn filtra por varios estados a la vez", async () => {
    const casos = await obtenerCasosParaExportar({
      busqueda: rutUnico,
      estadoIn: ["Pendiente", "Rechazado"],
    });
    const ids = casos.map((c) => c.id);
    expect(ids).toEqual([casoIds[0]]); // Pendiente, matchea

    const casosPagado = await obtenerCasosParaExportar({
      busqueda: "otro-rut",
      estadoIn: ["Pendiente", "Rechazado"],
    });
    expect(casosPagado.map((c) => c.id)).not.toContain(casoIds[1]); // Pagado, excluido
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

  it("obtenerHistorialParaExportar respeta los mismos filtros que los casos", async () => {
    const historialSinFiltro = await obtenerHistorialParaExportar({
      campoImportado: "RUT",
      valorImportado: rutUnico,
    });
    expect(historialSinFiltro).toHaveLength(1);
    expect(historialSinFiltro[0].casoId).toBe(casoIds[0]);
    expect(historialSinFiltro[0].estadoNuevo).toBe("Pendiente");
    expect(historialSinFiltro[0].usuario?.email).toBe(usuarioEmail);
  });

  it("incluye la hoja Historial con las filas esperadas, usuario o 'Sistema'", async () => {
    const buffer = await generarExcelCasos({
      campoImportado: "RUT",
      valorImportado: "otro-rut",
    });

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as never);
    const sheet = workbook.getWorksheet("Historial")!;
    expect(sheet).toBeDefined();

    const headerRow = sheet.getRow(1).values as unknown[];
    expect(headerRow.slice(1).map(String)).toEqual([
      "OT",
      "Concepto gasto",
      "Fecha",
      "Estado anterior",
      "Estado nuevo",
      "Usuario",
    ]);

    expect(sheet.rowCount).toBe(2); // header + 1 entrada (caso "otro-rut")
    const dataRow = sheet.getRow(2).values as unknown[];
    expect(dataRow).toContain("export-2");
    expect(dataRow).toContain("Pendiente");
    expect(dataRow).toContain("Pagado");
    expect(dataRow).toContain("Sistema");
  });
});
