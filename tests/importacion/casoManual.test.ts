import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/notificaciones/crear", () => ({
  notificarATodosLosUsuarios: vi.fn(),
}));

const { crearCasoManual } = await import("@/lib/importacion/casoManual");

describe("crearCasoManual", () => {
  let usuarioId: string;
  const importacionIds: string[] = [];

  beforeAll(async () => {
    const usuario = await prisma.usuario.create({
      data: {
        clerkId: `test-clerk-manual-${Date.now()}`,
        email: `test-manual-${Date.now()}@example.com`,
        roles: ["IMPORTADOR"],
      },
    });
    usuarioId = usuario.id;
  });

  afterAll(async () => {
    const casos = await prisma.casoReembolso.findMany({
      where: { importacionId: { in: importacionIds } },
      select: { id: true },
    });
    const casoIds = casos.map((c) => c.id);
    await prisma.filaEnRevision.deleteMany({
      where: { importacionId: { in: importacionIds } },
    });
    await prisma.historialEstado.deleteMany({ where: { casoId: { in: casoIds } } });
    await prisma.casoReembolso.deleteMany({
      where: { importacionId: { in: importacionIds } },
    });
    await prisma.importacionExcel.deleteMany({
      where: { id: { in: importacionIds } },
    });
    await prisma.usuario.delete({ where: { id: usuarioId } });
    await prisma.$disconnect();
  });

  const folioBase = 90000000 + (Date.now() % 1000000);

  it("crea un caso con datos válidos", async () => {
    const resultado = await crearCasoManual(
      {
        folio: `${folioBase + 1}`,
        nombreCliente: "Cliente de Prueba",
        rut: "12.345.678-5",
        tribunal: "1° Juzgado Civil",
        numeroRol: "1000",
        anoRol: "2026",
        nombreReceptor: "Receptor de Prueba",
        conceptoGasto: "NOTIF. TEST MANUAL",
        monto: "45000",
        estudioAbogado: "Estudio Manual Test",
      },
      usuarioId
    );

    expect(resultado.ok).toBe(true);
    expect(resultado.resumen?.filasImportadas).toBe(1);

    const importacion = await prisma.importacionExcel.findFirst({
      where: { usuarioId, nombreArchivoOriginal: { startsWith: "Ingreso manual" } },
      orderBy: { fecha: "desc" },
    });
    expect(importacion).not.toBeNull();
    importacionIds.push(importacion!.id);

    const caso = await prisma.casoReembolso.findFirst({
      where: { folio: `${folioBase + 1}` },
    });
    expect(caso).not.toBeNull();
    expect((caso!.datosImportados as Record<string, unknown>).RUT).toBe("12345678-5");
  });

  it("rechaza un RUT inválido con el mismo mensaje que importar", async () => {
    const resultado = await crearCasoManual(
      {
        folio: `${folioBase + 2}`,
        nombreCliente: "Cliente de Prueba",
        rut: "12.345.678-9", // dígito verificador incorrecto
        tribunal: "1° Juzgado Civil",
        numeroRol: "1001",
        anoRol: "2026",
        nombreReceptor: "Receptor de Prueba",
        conceptoGasto: "NOTIF. TEST MANUAL",
        monto: "45000",
        estudioAbogado: "Estudio Manual Test",
      },
      usuarioId
    );

    expect(resultado.ok).toBe(false);
    expect(resultado.mensaje).toBe("El archivo tiene errores, no se importó nada");

    const caso = await prisma.casoReembolso.findFirst({
      where: { folio: `${folioBase + 2}` },
    });
    expect(caso).toBeNull();
  });

  it("una OT+Concepto ya existente va a la cola de revisión, no crea un duplicado", async () => {
    // primero, crea el caso original
    await crearCasoManual(
      {
        folio: `${folioBase + 3}`,
        nombreCliente: "Cliente Original",
        rut: "1-9",
        tribunal: "1° Juzgado Civil",
        numeroRol: "1002",
        anoRol: "2026",
        nombreReceptor: "Receptor de Prueba",
        conceptoGasto: "NOTIF. DUPLICADO",
        monto: "10000",
        estudioAbogado: "Estudio Manual Test",
      },
      usuarioId
    );
    const primeraImportacion = await prisma.importacionExcel.findFirst({
      where: { usuarioId, nombreArchivoOriginal: { startsWith: "Ingreso manual" } },
      orderBy: { fecha: "desc" },
    });
    importacionIds.push(primeraImportacion!.id);

    // segunda vez, misma OT + mismo concepto
    const resultado = await crearCasoManual(
      {
        folio: `${folioBase + 3}`,
        nombreCliente: "Cliente Original",
        rut: "1-9",
        tribunal: "1° Juzgado Civil",
        numeroRol: "1002",
        anoRol: "2026",
        nombreReceptor: "Receptor de Prueba",
        conceptoGasto: "NOTIF. DUPLICADO",
        monto: "99999",
        estudioAbogado: "Estudio Manual Test",
      },
      usuarioId
    );
    expect(resultado.ok).toBe(true);
    expect(resultado.resumen?.filasImportadas).toBe(0);
    expect(resultado.resumen?.filasEnRevision).toBe(1);

    const segundaImportacion = await prisma.importacionExcel.findFirst({
      where: {
        usuarioId,
        nombreArchivoOriginal: { startsWith: "Ingreso manual" },
        id: { not: primeraImportacion!.id },
      },
      orderBy: { fecha: "desc" },
    });
    importacionIds.push(segundaImportacion!.id);

    const casosConEsaClave = await prisma.casoReembolso.findMany({
      where: { folio: `${folioBase + 3}` },
    });
    expect(casosConEsaClave).toHaveLength(1); // no se duplicó
  }, 30000);
});
