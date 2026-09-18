import JSZip from "jszip";
import { get } from "@vercel/blob";
import {
  obtenerCasosConDocumentosParaExportar,
  type FiltrosExportacion,
} from "./exportarCasos";

function nombreCarpetaCaso(folio: string, conceptoGasto: string): string {
  const seguro = (valor: string) => valor.replace(/[\\/:*?"<>|]/g, "_").trim();
  return `${seguro(folio)}_${seguro(conceptoGasto)}`;
}

export async function generarZipDocumentos(
  filtros: FiltrosExportacion
): Promise<Buffer> {
  const casos = await obtenerCasosConDocumentosParaExportar(filtros);
  const zip = new JSZip();
  const cacheBlobs = new Map<string, ArrayBuffer>();

  for (const caso of casos) {
    if (caso.documentos.length === 0) continue;
    const carpeta = zip.folder(
      nombreCarpetaCaso(caso.folio, caso.conceptoGasto)
    )!;

    for (const documento of caso.documentos) {
      let contenido = cacheBlobs.get(documento.urlBlob);
      if (!contenido) {
        const resultado = await get(documento.urlBlob, { access: "private" });
        if (!resultado || resultado.statusCode !== 200 || !resultado.stream) {
          continue;
        }
        contenido = await new Response(resultado.stream).arrayBuffer();
        cacheBlobs.set(documento.urlBlob, contenido);
      }
      carpeta.file(documento.nombreArchivo, contenido);
    }
  }

  return zip.generateAsync({ type: "nodebuffer" });
}
