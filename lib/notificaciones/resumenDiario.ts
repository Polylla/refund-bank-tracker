import { prisma } from "@/lib/prisma";
import { casosSinDocumento } from "@/lib/documentos/alertas";
import { notificarATodosLosUsuarios } from "./crear";

export interface ResumenDiario {
  casosSinDocumento: number;
  duplicadosSinRevisar: number;
}

export async function calcularResumenDiario(): Promise<ResumenDiario> {
  const [sinDocumento, duplicadosSinRevisar] = await Promise.all([
    casosSinDocumento(),
    prisma.casoReembolso.count({
      where: { posibleDuplicado: true, duplicadoRevisadoEn: null },
    }),
  ]);

  return {
    casosSinDocumento: sinDocumento.length,
    duplicadosSinRevisar,
  };
}

export async function generarNotificacionesResumenDiario(): Promise<void> {
  const resumen = await calcularResumenDiario();
  if (resumen.casosSinDocumento === 0 && resumen.duplicadosSinRevisar === 0) {
    return;
  }

  const partes: string[] = [];
  if (resumen.casosSinDocumento > 0) {
    partes.push(
      `${resumen.casosSinDocumento} caso(s) con boleta pendiente de documento`
    );
  }
  if (resumen.duplicadosSinRevisar > 0) {
    partes.push(
      `${resumen.duplicadosSinRevisar} caso(s) con posible duplicado sin revisar`
    );
  }

  // Si solo hay un tipo de pendiente, el link va directo a su vista
  // (documentos o casos); si hay de los dos, no hay una sola vista que
  // los muestre juntos, así que va al dashboard.
  let enlace = "/dashboard";
  if (resumen.casosSinDocumento > 0 && resumen.duplicadosSinRevisar === 0) {
    enlace = "/documentos";
  } else if (resumen.duplicadosSinRevisar > 0 && resumen.casosSinDocumento === 0) {
    enlace = "/casos";
  }

  await notificarATodosLosUsuarios(
    "RESUMEN_DIARIO",
    `Resumen diario: ${partes.join(" — ")}.`,
    enlace
  );
}
