import { describe, expect, it, vi } from "vitest";

const getUserListMock = vi.fn();
const updateUserMetadataMock = vi.fn();
const deleteUserMock = vi.fn();

vi.mock("@clerk/nextjs/server", () => ({
  clerkClient: async () => ({
    users: {
      getUserList: getUserListMock,
      updateUserMetadata: updateUserMetadataMock,
      deleteUser: deleteUserMock,
    },
  }),
}));

const { listarUsuariosConRoles, actualizarRolesUsuario, eliminarUsuario } =
  await import("@/lib/usuarios/gestionRoles");

describe("listarUsuariosConRoles", () => {
  it("mapea usuarios de Clerk a email + roles válidos", async () => {
    getUserListMock.mockResolvedValueOnce({
      data: [
        {
          id: "user_1",
          primaryEmailAddress: { emailAddress: "uno@example.com" },
          emailAddresses: [{ emailAddress: "uno@example.com" }],
          publicMetadata: { roles: ["importador", "admin"] },
        },
        {
          id: "user_2",
          primaryEmailAddress: null,
          emailAddresses: [{ emailAddress: "dos@example.com" }],
          publicMetadata: {},
        },
      ],
    });

    const resultado = await listarUsuariosConRoles();
    expect(resultado).toEqual([
      { clerkUserId: "user_1", email: "uno@example.com", roles: ["importador", "admin"] },
      { clerkUserId: "user_2", email: "dos@example.com", roles: [] },
    ]);
  });
});

describe("actualizarRolesUsuario", () => {
  it("rechaza un rol inválido sin llamar a Clerk", async () => {
    const resultado = await actualizarRolesUsuario("user_1", ["superadmin"]);
    expect(resultado.ok).toBe(false);
    expect(updateUserMetadataMock).not.toHaveBeenCalled();
  });

  it("actualiza publicMetadata.roles con roles válidos", async () => {
    updateUserMetadataMock.mockResolvedValueOnce({});

    const resultado = await actualizarRolesUsuario("user_1", ["revisor", "visor"]);
    expect(resultado.ok).toBe(true);
    expect(updateUserMetadataMock).toHaveBeenCalledWith("user_1", {
      publicMetadata: { roles: ["revisor", "visor"] },
    });
  });
});

describe("eliminarUsuario", () => {
  it("llama a deleteUser con el id correcto", async () => {
    deleteUserMock.mockResolvedValueOnce({});

    const resultado = await eliminarUsuario("user_1");
    expect(resultado.ok).toBe(true);
    expect(deleteUserMock).toHaveBeenCalledWith("user_1");
  });

  it("retorna ok:false si Clerk falla", async () => {
    deleteUserMock.mockRejectedValueOnce(new Error("clerk no disponible"));

    const resultado = await eliminarUsuario("user_2");
    expect(resultado.ok).toBe(false);
  });
});
