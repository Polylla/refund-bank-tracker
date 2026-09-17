import { describe, expect, it } from "vitest";
import { marcarDuplicadosIntraArchivo } from "@/lib/importacion/duplicados";
import type { CasoImportado } from "@/lib/importacion/parser";

function fila(overrides: Partial<CasoImportado>): CasoImportado {
  return {
    folio: "1",
    nombreCliente: "X",
    rut: "1-9",
    tribunal: "T",
    numeroRol: 1,
    anoRol: 2026,
    nombreReceptor: "R",
    conceptoGasto: "NOTIFICACION DEMANDA",
    monto: 1000,
    nBoleta: null,
    fechaPago: null,
    estudioAbogado: "E",
    fechaEnvioPago: null,
    estadoInicial: null,
    posibleDuplicado: false,
    datosImportados: {},
    ...overrides,
  };
}

describe("marcarDuplicadosIntraArchivo", () => {
  it("no marca nada si no hay repeticiones", () => {
    const filas = [
      fila({ folio: "1", conceptoGasto: "A" }),
      fila({ folio: "2", conceptoGasto: "A" }),
    ];
    const resultado = marcarDuplicadosIntraArchivo(filas);
    expect(resultado.every((f) => !f.posibleDuplicado)).toBe(true);
  });

  it("marca un par con la misma OT + concepto", () => {
    const filas = [
      fila({ folio: "1", conceptoGasto: "A" }),
      fila({ folio: "1", conceptoGasto: "A" }),
    ];
    const resultado = marcarDuplicadosIntraArchivo(filas);
    expect(resultado.every((f) => f.posibleDuplicado)).toBe(true);
  });

  it("marca un grupo de 3 o más con la misma clave", () => {
    const filas = [
      fila({ folio: "1", conceptoGasto: "A" }),
      fila({ folio: "1", conceptoGasto: "A" }),
      fila({ folio: "1", conceptoGasto: "A" }),
    ];
    const resultado = marcarDuplicadosIntraArchivo(filas);
    expect(resultado.every((f) => f.posibleDuplicado)).toBe(true);
  });

  it("NO marca la misma OT con distinto concepto (distinta diligencia)", () => {
    const filas = [
      fila({ folio: "97289364", conceptoGasto: "NOTIF. DEMANDA" }),
      fila({ folio: "97289364", conceptoGasto: "NOTIF. SENTENCIA" }),
    ];
    const resultado = marcarDuplicadosIntraArchivo(filas);
    expect(resultado.every((f) => !f.posibleDuplicado)).toBe(true);
  });

  it("es insensible a espacios extra en folio/concepto", () => {
    const filas = [
      fila({ folio: "1", conceptoGasto: "NOTIF. DEMANDA  " }),
      fila({ folio: "1 ", conceptoGasto: "NOTIF. DEMANDA" }),
    ];
    const resultado = marcarDuplicadosIntraArchivo(filas);
    expect(resultado.every((f) => f.posibleDuplicado)).toBe(true);
  });
});
