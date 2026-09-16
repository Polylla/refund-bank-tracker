// Corrección retroactiva única (Spec 04): los casos importados antes de
// esta spec quedaron todos en "Pendiente" (spec 02 original), pero el
// estado inicial debe inferirse desde "Fecha pago" / "Fecha envío a
// pago" cuando ya vienen completadas en el Excel. Ver
// specs/04-estados-reembolso.md.
// Uso: node --env-file=.env scripts/corregir-estado-inicial.mjs
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function inferirEstadoInicial(fechaPago, fechaEnvioPago) {
  if (fechaPago) return "Pagado";
  if (fechaEnvioPago) return "Enviado a pago";
  return "Pendiente";
}

const casos = await prisma.casoReembolso.findMany();
let corregidos = 0;

for (const caso of casos) {
  const datos = caso.datosImportados;
  const fechaPagoRaw = datos["Fecha pago"];
  const fechaEnvioPagoRaw = datos["Fecha envío a pago"];
  const fechaPago = fechaPagoRaw ? new Date(fechaPagoRaw) : null;
  const fechaEnvioPago = fechaEnvioPagoRaw ? new Date(fechaEnvioPagoRaw) : null;

  const estadoInferido = inferirEstadoInicial(fechaPago, fechaEnvioPago);
  const cambiaEstado = estadoInferido !== caso.estadoActual;

  await prisma.$transaction(async (tx) => {
    await tx.casoReembolso.update({
      where: { id: caso.id },
      data: { fechaPago, fechaEnvioPago, estadoActual: estadoInferido },
    });

    if (cambiaEstado) {
      await tx.historialEstado.create({
        data: {
          casoId: caso.id,
          estadoAnterior: caso.estadoActual,
          estadoNuevo: estadoInferido,
          usuarioId: null, // corrección de datos, no una decisión de un usuario
        },
      });
    }
  });

  if (cambiaEstado) {
    console.log(`Folio ${caso.folio} (${caso.conceptoGasto}): ${caso.estadoActual} -> ${estadoInferido}`);
    corregidos++;
  }
}

console.log(`\nCasos corregidos: ${corregidos} / ${casos.length}`);
await prisma.$disconnect();
