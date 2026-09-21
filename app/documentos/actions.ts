"use server";

import { revalidatePath } from "next/cache";
import { getOrCreateUsuarioActual, requireAnyRole } from "@/lib/usuarios";
import { subirDocumento } from "@/lib/documentos/subirDocumento";
import {
  buscarCasosParaVincular,
  vincularDocumentoManualmente,
  type ResultadoVinculacion,
} from "@/lib/documentos/vincularManual";
import {
  eliminarDocumento,
  type ResultadoEliminarDocumento,
} from "@/lib/documentos/eliminarDocumento";
import { prisma } from "@/lib/prisma";

export interface ResultadoSubidaDocumento {
  nombreArchivo: string;
  estadoMatching: "MATCHEADO" | "SIN_MATCH";
  nBoletaExtraido: string | null;
  casosVinculados: number;
}

export async function subirDocumentosAction(
  formData: FormData
): Promise<ResultadoSubidaDocumento[]> {
  const { roles } = await getOrCreateUsuarioActual();
  requireAnyRole(roles, ["importador", "revisor"]);

  const archivos = formData.getAll("archivos").filter((f): f is File => f instanceof File);

  const resultados: ResultadoSubidaDocumento[] = [];
  for (const archivo of archivos) {
    const buffer = Buffer.from(await archivo.arrayBuffer());
    const documento = await subirDocumento(archivo.name, archivo.type, buffer);
    const conCasos = await prisma.documento.findUnique({
      where: { id: documento.id },
      include: { casos: true },
    });
    resultados.push({
      nombreArchivo: documento.nombreArchivo,
      estadoMatching: documento.estadoMatching,
      nBoletaExtraido: documento.nBoletaExtraido,
      casosVinculados: conCasos?.casos.length ?? 0,
    });
  }

  revalidatePath("/documentos");
  return resultados;
}

export async function buscarCasosAction(query: string) {
  const { roles } = await getOrCreateUsuarioActual();
  requireAnyRole(roles, ["importador", "revisor"]);

  const casos = await buscarCasosParaVincular(query);
  return casos.map((c) => ({
    id: c.id,
    folio: c.folio,
    nBoleta: c.nBoleta,
    conceptoGasto: c.conceptoGasto,
  }));
}

export async function vincularManualAction(
  documentoId: string,
  casoIds: string[]
): Promise<ResultadoVinculacion> {
  const { roles } = await getOrCreateUsuarioActual();
  requireAnyRole(roles, ["importador", "revisor"]);

  const resultado = await vincularDocumentoManualmente(documentoId, casoIds);
  if (resultado.ok) revalidatePath("/documentos");
  return resultado;
}

export async function eliminarDocumentoAction(
  documentoId: string
): Promise<ResultadoEliminarDocumento> {
  const { roles } = await getOrCreateUsuarioActual();
  requireAnyRole(roles, ["importador", "revisor"]);

  const resultado = await eliminarDocumento(documentoId);
  if (resultado.ok) {
    revalidatePath("/documentos");
    revalidatePath("/casos");
  }
  return resultado;
}
