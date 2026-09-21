import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import {
  obtenerCasosPaginados,
  calcularMontoTotal,
} from "@/lib/exportacion/exportarCasos";

describe("paginación y total de casos", () => {
  let importacionId: string;
  let usuarioId: string;
  const casoIds: string[] = [];
  const busqueda = `pag-test-${Date.now()}`;

  beforeAll(async () => {
    const usuario = await prisma.usuario.create({
      data: {
        clerkId: `test-clerk-pag-${Date.now()}`,
        email: `test-pag-${Date.now()}@example.com`,
        roles: ["IMPORTADOR"],
      },
    });
    usuarioId = usuario.id;

    const importacion = await prisma.importacionExcel.create({
      data: {
        nombreArchivoOriginal: "test-pag.xlsx",
        usuarioId,
        cantidadFilas: 5,
        cantidadDuplicados: 0,
        cantidadErrores: 0,
      },
    });
    importacionId = importacion.id;

    // 5 casos de prueba, montos 10000..50000, todos con el mismo Tribunal
    // único para poder filtrarlos con busqueda sin tocar datos reales.
    for (let i = 1; i <= 5; i++) {
      const caso = await prisma.casoReembolso.create({
        data: {
          folio: `pag-${i}`,
          conceptoGasto: "X",
          datosImportados: {
            Tribunal: busqueda,
            "Costo de diligencia": i * 10000,
          },
          estadoActual: "Pendiente",
          estudioAbogado: "Estudio Test",
          importacionId,
        },
      });
      casoIds.push(caso.id);
    }
  });

  afterAll(async () => {
    await prisma.casoReembolso.deleteMany({ where: { importacionId } });
    await prisma.importacionExcel.delete({ where: { id: importacionId } });
    await prisma.usuario.delete({ where: { id: usuarioId } });
    await prisma.$disconnect();
  });

  it("retorna la página correcta y el total real (no el de la página)", async () => {
    const pagina1 = await obtenerCasosPaginados({ busqueda }, 1, 2);
    expect(pagina1.casos).toHaveLength(2);
    expect(pagina1.total).toBe(5);

    const pagina3 = await obtenerCasosPaginados({ busqueda }, 3, 2);
    expect(pagina3.casos).toHaveLength(1); // último caso, resto de página
    expect(pagina3.total).toBe(5);

    // Sin solapamiento entre páginas.
    const idsPagina1 = pagina1.casos.map((c) => c.id);
    const idsPagina2 = (await obtenerCasosPaginados({ busqueda }, 2, 2)).casos.map(
      (c) => c.id
    );
    expect(idsPagina1.some((id) => idsPagina2.includes(id))).toBe(false);
  });

  it("calcularMontoTotal suma todos los casos filtrados, no solo una página", async () => {
    const total = await calcularMontoTotal({ busqueda });
    expect(total).toBe(10000 + 20000 + 30000 + 40000 + 50000);
  });
});
