import { describe, expect, it } from "vitest";
import { extraerNBoleta } from "@/lib/documentos/extraerBoleta";

describe("extraerNBoleta", () => {
  it("extrae el número de un nombre simple", () => {
    expect(extraerNBoleta("740.pdf")).toBe("740");
  });

  it("ignora el sufijo (1) de descargas duplicadas", () => {
    expect(extraerNBoleta("38(1).pdf")).toBe("38");
  });

  it("es insensible a mayúsculas en la extensión", () => {
    expect(extraerNBoleta("38.PDF")).toBe("38");
  });

  it("retorna null si no hay número al inicio", () => {
    expect(extraerNBoleta("documento.pdf")).toBeNull();
  });

  it("retorna null para un nombre vacío", () => {
    expect(extraerNBoleta("")).toBeNull();
  });

  it("extrae el número aunque el nombre no tenga extensión", () => {
    expect(extraerNBoleta("740")).toBe("740");
  });
});
