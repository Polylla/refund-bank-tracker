import { describe, expect, it } from "vitest";
import { normalizarRut } from "@/lib/importacion/rut";

describe("normalizarRut", () => {
  it("acepta un RUT válido con puntos y guión, y lo normaliza sin puntos", () => {
    expect(normalizarRut("12.345.678-5")).toBe("12345678-5");
  });

  it("acepta un RUT válido sin puntos, con guión", () => {
    expect(normalizarRut("12345678-5")).toBe("12345678-5");
  });

  it("acepta un RUT válido sin guión (dígito verificador pegado)", () => {
    expect(normalizarRut("123456785")).toBe("12345678-5");
  });

  it("acepta espacios extra alrededor", () => {
    expect(normalizarRut("  12345678-5  ")).toBe("12345678-5");
  });

  it("acepta un cuerpo de 7 dígitos", () => {
    expect(normalizarRut("1234567-4")).toBe("1234567-4");
  });

  it("normaliza el dígito verificador K a minúscula", () => {
    expect(normalizarRut("12345670-K")).toBe("12345670-k");
    expect(normalizarRut("12345670-k")).toBe("12345670-k");
  });

  it("rechaza un dígito verificador incorrecto", () => {
    expect(normalizarRut("12345678-9")).toBeNull();
  });

  it("rechaza un formato irreconocible", () => {
    expect(normalizarRut("abcdefg-5")).toBeNull();
    expect(normalizarRut("")).toBeNull();
    expect(normalizarRut("12345678")).toBeNull();
    expect(normalizarRut("123456789012-3")).toBeNull();
  });
});
