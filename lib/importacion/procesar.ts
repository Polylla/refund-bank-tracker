import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  parseReembolsosCsv,
  parseReembolsosXlsx,
  type ParseResult,
} from "./parser";
import { marcarDuplicadosIntraArchivo } from "./duplicados";
import { claveIdentidad } from "./identidad";
import { inferirEstadoInicial } from "@/lib/estados/estados";

export interface ResultadoImportacion {
  ok: boolean;
  mensaje?: string;
  columnasFaltantes?: string[];
  errores?: ParseResult["errores"];
  resumen?: {
    filasImportadas: number;
    filasDescartadas: number;
    filasDuplicadas: number;
    filasEnRevision: number;
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

  const filasConDuplicados = marcarDuplicadosIntraArchivo(
    resultado.filasValidas
  );

  // Task 3.2: filas cuya clave de identidad (folio + conceptoGasto) ya
  // existe en un CasoReembolso de una importación anterior. Se consulta
  // ANTES de insertar nada de esta importación, para no confundir
  // duplicados intra-archivo (Task 3.1) con coincidencias reales contra
  // la base.
  const foliosDelArchivo = [
    ...new Set(filasConDuplicados.map((f) => f.folio.trim())),
  ];
  const casosExistentes = await prisma.casoReembolso.findMany({
    where: { folio: { in: foliosDelArchivo } },
  });
  const existentePorClave = new Map<string, (typeof casosExistentes)[number]>();
  for (const caso of casosExistentes) {
    existentePorClave.set(claveIdentidad(caso.folio, caso.conceptoGasto), caso);
  }

  let filasDuplicadas = 0;
  let filasEnRevision = 0;

  try {
    await prisma.$transaction(
      async (tx) => {
        const importacion = await tx.importacionExcel.create({
          data: {
            nombreArchivoOriginal: nombreArchivo,
            usuarioId,
            cantidadFilas: filasConDuplicados.length,
            cantidadDuplicados: 0,
            cantidadErrores: 0,
            cantidadEnRevision: 0,
          },
        });

        for (const fila of filasConDuplicados) {
          const clave = claveIdentidad(fila.folio, fila.conceptoGasto);
          const existente = existentePorClave.get(clave);

          if (existente) {
            // Precedencia: una coincidencia contra la base siempre gana
            // sobre el marcado de duplicado intra-archivo. No se crea
            // un CasoReembolso nuevo para esta fila.
            await tx.filaEnRevision.create({
              data: {
                importacionId: importacion.id,
                casoExistenteId: existente.id,
                datosNuevos: fila.datosImportados as Prisma.InputJsonValue,
              },
            });
            filasEnRevision++;
            continue;
          }

          const estadoActual = inferirEstadoInicial(
            fila.fechaPago,
            fila.fechaEnvioPago,
            fila.estadoInicial
          );
          const caso = await tx.casoReembolso.create({
            data: {
              folio: fila.folio,
              conceptoGasto: fila.conceptoGasto,
              posibleDuplicado: fila.posibleDuplicado,
              datosImportados: fila.datosImportados as Prisma.InputJsonValue,
              estadoActual,
              fechaPago: fila.fechaPago,
              fechaEnvioPago: fila.fechaEnvioPago,
              importacionId: importacion.id,
            },
          });
          if (fila.posibleDuplicado) filasDuplicadas++;

          await tx.historialEstado.create({
            data: {
              casoId: caso.id,
              estadoAnterior: null,
              estadoNuevo: estadoActual,
              usuarioId,
            },
          });
        }

        await tx.importacionExcel.update({
          where: { id: importacion.id },
          data: {
            cantidadDuplicados: filasDuplicadas,
            cantidadEnRevision: filasEnRevision,
          },
        });
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
      filasImportadas: filasConDuplicados.length - filasEnRevision,
      filasDescartadas: resultado.filasDescartadas,
      filasDuplicadas,
      filasEnRevision,
    },
  };
}
