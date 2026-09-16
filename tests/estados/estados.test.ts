import { describe, expect, it } from "vitest";
import { esEstadoValido, inferirEstadoInicial } from "@/lib/estados/estados";

describe("esEstadoValido", () => {
  it("acepta los 4 estados cerrados", () => {
    expect(esEstadoValido("Pendiente")).toBe(true);
    expect(esEstadoValido("Enviado a pago")).toBe(true);
    expect(esEstadoValido("Pagado")).toBe(true);
    expect(esEstadoValido("Rechazado")).toBe(true);
  });

  it("rechaza cualquier otro valor", () => {
    expect(esEstadoValido("Aprobado")).toBe(false);
    expect(esEstadoValido("")).toBe(false);
  });
});

describe("inferirEstadoInicial", () => {
  it("con Fecha pago presente, infiere Pagado sin importar el resto", () => {
    expect(inferirEstadoInicial(new Date(), null, null)).toBe("Pagado");
    expect(inferirEstadoInicial(new Date(), new Date(), null)).toBe("Pagado");
  });

  it("con solo Fecha envío a pago presente, infiere Enviado a pago", () => {
    expect(inferirEstadoInicial(null, new Date(), null)).toBe("Enviado a pago");
  });

  it("sin fechas, usa el estado del Excel si es válido", () => {
    expect(inferirEstadoInicial(null, null, "Rechazado")).toBe("Rechazado");
  });

  it("sin fechas y sin estado válido del Excel, infiere Pendiente", () => {
    expect(inferirEstadoInicial(null, null, null)).toBe("Pendiente");
    expect(inferirEstadoInicial(null, null, "algo raro")).toBe("Pendiente");
  });
});
