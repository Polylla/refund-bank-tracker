import ExcelJS from "exceljs";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { COLUMNAS } from "@/lib/importacion/columns";
import { extraerMonto } from "@/lib/reporteria/monto";

export interface FiltrosExportacion {
  estado?: string;
  estadoIn?: string[];
  fechaDesde?: Date;
  fechaHasta?: Date;
  campoImportado?: string;
  valorImportado?: string;
  folio?: string;
  busqueda?: string;
}

const CAMPOS_BUSQUEDA_UNICA = [
  "Nombre cliente",
  "RUT",
  "Nombre receptor",
  "Tribunal",
];

function construirWhere(filtros: FiltrosExportacion): Prisma.CasoReembolsoWhereInput {
  const where: Prisma.CasoReembolsoWhereInput = {};

  if (filtros.folio) {
    where.folio = filtros.folio.trim();
  }

  if (filtros.estado) {
    where.estadoActual = filtros.estado;
  }

  if (filtros.estadoIn && filtros.estadoIn.length > 0) {
    where.estadoActual = { in: filtros.estadoIn };
  }

  if (filtros.fechaDesde || filtros.fechaHasta) {
    where.createdAt = {
      ...(filtros.fechaDesde ? { gte: filtros.fechaDesde } : {}),
      ...(filtros.fechaHasta ? { lte: filtros.fechaHasta } : {}),
    };
  }

  if (filtros.campoImportado && filtros.valorImportado) {
    where.datosImportados = {
      path: [filtros.campoImportado],
      string_contains: filtros.valorImportado,
    };
  }

  if (filtros.busqueda) {
    const q = filtros.busqueda.trim();
    where.OR = [
      { folio: { contains: q, mode: "insensitive" } },
      { estudioAbogado: { contains: q, mode: "insensitive" } },
      ...CAMPOS_BUSQUEDA_UNICA.map((campo) => ({
        datosImportados: { path: [campo], string_contains: q },
      })),
    ];
  }

  return where;
}

export function obtenerCasosParaExportar(filtros: FiltrosExportacion) {
  return prisma.casoReembolso.findMany({
    where: construirWhere(filtros),
    orderBy: { createdAt: "desc" },
  });
}

export interface ResultadoCasosPaginados {
  casos: Awaited<ReturnType<typeof obtenerCasosParaExportar>>;
  total: number;
}

export async function obtenerCasosPaginados(
  filtros: FiltrosExportacion,
  pagina: number,
  porPagina: number
): Promise<ResultadoCasosPaginados> {
  const where = construirWhere(filtros);
  const [casos, total] = await Promise.all([
    prisma.casoReembolso.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (pagina - 1) * porPagina,
      take: porPagina,
    }),
    prisma.casoReembolso.count({ where }),
  ]);

  return { casos, total };
}

export async function calcularMontoTotal(
  filtros: FiltrosExportacion
): Promise<number> {
  const casos = await prisma.casoReembolso.findMany({
    where: construirWhere(filtros),
    select: { datosImportados: true },
  });
  return casos.reduce((suma, c) => suma + extraerMonto(c.datosImportados), 0);
}

export function obtenerCasosConDocumentosParaExportar(
  filtros: FiltrosExportacion
) {
  return prisma.casoReembolso.findMany({
    where: construirWhere(filtros),
    include: { documentos: true },
    orderBy: { createdAt: "desc" },
  });
}

export function obtenerHistorialParaExportar(filtros: FiltrosExportacion) {
  return prisma.historialEstado.findMany({
    where: { caso: construirWhere(filtros) },
    include: { caso: true, usuario: true },
    orderBy: { fecha: "asc" },
  });
}

export async function generarExcelCasos(
  filtros: FiltrosExportacion
): Promise<Buffer> {
  const [casos, historial] = await Promise.all([
    obtenerCasosParaExportar(filtros),
    obtenerHistorialParaExportar(filtros),
  ]);
  const columnasImportadas = COLUMNAS.map((c) => c.headers[0]);

  const workbook = new ExcelJS.Workbook();
  const sheetCasos = workbook.addWorksheet("Casos");
  sheetCasos.columns = [
    ...columnasImportadas.map((header) => ({ header, key: header })),
    { header: "Estado actual", key: "estadoActual" },
    { header: "Fecha creación", key: "createdAt" },
    { header: "Fecha última actualización", key: "updatedAt" },
  ];

  for (const caso of casos) {
    const datos = caso.datosImportados as Record<string, unknown>;
    sheetCasos.addRow({
      ...Object.fromEntries(
        columnasImportadas.map((header) => [header, datos[header] ?? ""])
      ),
      estadoActual: caso.estadoActual,
      createdAt: caso.createdAt,
      updatedAt: caso.updatedAt,
    });
  }

  const sheetHistorial = workbook.addWorksheet("Historial");
  sheetHistorial.columns = [
    { header: "OT", key: "folio" },
    { header: "Concepto gasto", key: "conceptoGasto" },
    { header: "Fecha", key: "fecha" },
    { header: "Estado anterior", key: "estadoAnterior" },
    { header: "Estado nuevo", key: "estadoNuevo" },
    { header: "Usuario", key: "usuario" },
  ];

  for (const entrada of historial) {
    sheetHistorial.addRow({
      folio: entrada.caso.folio,
      conceptoGasto: entrada.caso.conceptoGasto,
      fecha: entrada.fecha,
      estadoAnterior: entrada.estadoAnterior ?? "",
      estadoNuevo: entrada.estadoNuevo,
      usuario: entrada.usuario?.email ?? "Sistema",
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
