import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  parseReembolsosCsv,
  parseReembolsosXlsx,
  type ParseResult,
} from "./parser";
import { marcarDuplicadosIntraArchivo } from "./duplicados";

export interface ResultadoImportacion {
  ok: boolean;
  mensaje?: string;
  columnasFaltantes?: string[];
  errores?: ParseResult["errores"];
  resumen?: {
    filasImportadas: number;
    filasDescartadas: number;
    filasDuplicadas: number;
  };
}

export async function procesarImportacion(
  buffer: Buffer,
  nombreArchivo: string,
  usuarioId: string
): Promise<ResultadoImportacion> {
  const esCsv = nombreArchivo.toLowerCase().endsWith(".csv");
  const resultado = esCsv
    ? parseReembolsosCsv(buffer.toString("utf-8"))
    : await parseReembolsosXlsx(buffer);

  if (resultado.columnasFaltantes.length > 0) {
    return {
      ok: false,
      mensaje: "Faltan columnas obligatorias",
      columnasFaltantes: resultado.columnasFaltantes,
    };
  }

  if (resultado.errores.length > 0) {
    return {
      ok: false,
      mensaje: "El archivo tiene errores, no se importó nada",
      errores: resultado.errores,
    };
  }

  const filasConDuplicados = marcarDuplicadosIntraArchivo(resultado.filasValidas);
  const filasDuplicadas = filasConDuplicados.filter((f) => f.posibleDuplicado).length;

  try {
    await prisma.$transaction(
      async (tx) => {
        const importacion = await tx.importacionExcel.create({
          data: {
            nombreArchivoOriginal: nombreArchivo,
            usuarioId,
            cantidadFilas: filasConDuplicados.length,
            cantidadDuplicados: filasDuplicadas,
            cantidadErrores: 0,
          },
        });

        for (const fila of filasConDuplicados) {
          const estadoActual = fila.estadoInicial ?? "Pendiente";
          const caso = await tx.casoReembolso.create({
            data: {
              folio: fila.folio,
              conceptoGasto: fila.conceptoGasto,
              posibleDuplicado: fila.posibleDuplicado,
              datosImportados: fila.datosImportados as Prisma.InputJsonValue,
              estadoActual,
              importacionId: importacion.id,
            },
          });
          await tx.historialEstado.create({
            data: {
              casoId: caso.id,
              estadoAnterior: null,
              estadoNuevo: estadoActual,
              usuarioId,
            },
          });
        }
      },
      { timeout: 20000 }
    );
  } catch (err) {
    return {
      ok: false,
      mensaje:
        err instanceof Error
          ? `No se pudo importar: ${err.message}`
          : "No se pudo importar el archivo",
    };
  }

  return {
    ok: true,
    resumen: {
      filasImportadas: filasConDuplicados.length,
      filasDescartadas: resultado.filasDescartadas,
      filasDuplicadas,
    },
  };
}
