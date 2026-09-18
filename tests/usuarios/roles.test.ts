import { describe, expect, it } from "vitest";
import { requireRole, requireAnyRole, puedeActuar } from "@/lib/usuarios";
import { getRoles } from "@/lib/roles";

describe("requireRole", () => {
  it("permite si el usuario tiene el rol exacto", () => {
    expect(() => requireRole(["revisor"], "revisor")).not.toThrow();
  });

  it("rechaza si el usuario no tiene el rol ni es admin", () => {
    expect(() => requireRole(["visor"], "revisor")).toThrow();
  });

  it("permite si el usuario es admin, sin importar el rol pedido", () => {
    expect(() => requireRole(["admin"], "revisor")).not.toThrow();
    expect(() => requireRole(["admin"], "importador")).not.toThrow();
  });
});

describe("requireAnyRole", () => {
  it("permite si el usuario tiene alguno de los roles permitidos", () => {
    expect(() =>
      requireAnyRole(["revisor"], ["importador", "revisor"])
    ).not.toThrow();
  });

  it("rechaza si el usuario no tiene ninguno ni es admin", () => {
    expect(() => requireAnyRole(["visor"], ["importador", "revisor"])).toThrow();
  });

  it("permite si el usuario es admin", () => {
    expect(() =>
      requireAnyRole(["admin"], ["importador", "revisor"])
    ).not.toThrow();
  });
});

describe("puedeActuar", () => {
  it("es true para importador, revisor o admin", () => {
    expect(puedeActuar(["importador"])).toBe(true);
    expect(puedeActuar(["revisor"])).toBe(true);
    expect(puedeActuar(["admin"])).toBe(true);
  });

  it("es false para visor o sin roles", () => {
    expect(puedeActuar(["visor"])).toBe(false);
    expect(puedeActuar([])).toBe(false);
  });
});

describe("getRoles", () => {
  it("acepta los 4 roles válidos desde publicMetadata", () => {
    const roles = getRoles({ roles: ["importador", "revisor", "admin", "visor"] });
    expect(roles).toEqual(["importador", "revisor", "admin", "visor"]);
  });

  it("filtra valores inválidos", () => {
    const roles = getRoles({ roles: ["importador", "hacker", 123, null] });
    expect(roles).toEqual(["importador"]);
  });

  it("retorna [] si publicMetadata no trae roles", () => {
    expect(getRoles({})).toEqual([]);
    expect(getRoles(null)).toEqual([]);
  });
});
