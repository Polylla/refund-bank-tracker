import { afterAll, describe, expect, it, vi } from "vitest";
import { prisma } from "@/lib/prisma";

const currentUserMock = vi.fn();
vi.mock("@clerk/nextjs/server", () => ({
  currentUser: () => currentUserMock(),
}));

const { getOrCreateUsuarioActual } = await import("@/lib/usuarios");

function usuarioClerkFalso(overrides: {
  id: string;
  email: string;
  fullName?: string | null;
  roles?: string[];
}) {
  return {
    id: overrides.id,
    fullName: overrides.fullName ?? null,
    primaryEmailAddress: { emailAddress: overrides.email },
    publicMetadata: { roles: overrides.roles ?? [] },
  };
}

describe("getOrCreateUsuarioActual", () => {
  const idsCreados: string[] = [];

  afterAll(async () => {
    await prisma.usuario.deleteMany({ where: { id: { in: idsCreados } } });
    await prisma.$disconnect();
  });

  it("un email nunca visto crea un registro nuevo", async () => {
    const clerkId = `test-clerk-reingreso-a-${Date.now()}`;
    const email = `test-reingreso-a-${Date.now()}@example.com`;
    currentUserMock.mockResolvedValueOnce(
      usuarioClerkFalso({ id: clerkId, email })
    );

    const { usuario } = await getOrCreateUsuarioActual();
    idsCreados.push(usuario.id);
    expect(usuario.clerkId).toBe(clerkId);
    expect(usuario.email).toBe(email);
  });

  it("un registro existente con el mismo clerkId solo se actualiza (mismo id)", async () => {
    const clerkId = `test-clerk-reingreso-b-${Date.now()}`;
    const email = `test-reingreso-b-${Date.now()}@example.com`;
    currentUserMock.mockResolvedValueOnce(
      usuarioClerkFalso({ id: clerkId, email, fullName: "Nombre Uno" })
    );
    const { usuario: primero } = await getOrCreateUsuarioActual();
    idsCreados.push(primero.id);

    currentUserMock.mockResolvedValueOnce(
      usuarioClerkFalso({ id: clerkId, email, fullName: "Nombre Actualizado" })
    );
    const { usuario: segundo } = await getOrCreateUsuarioActual();

    expect(segundo.id).toBe(primero.id);
    expect(segundo.nombre).toBe("Nombre Actualizado");
  });

  it("un clerkId distinto pero mismo email se re-vincula al registro histórico", async () => {
    const clerkIdOriginal = `test-clerk-reingreso-c-original-${Date.now()}`;
    const email = `test-reingreso-c-${Date.now()}@example.com`;
    currentUserMock.mockResolvedValueOnce(
      usuarioClerkFalso({ id: clerkIdOriginal, email, roles: ["revisor"] })
    );
    const { usuario: original } = await getOrCreateUsuarioActual();
    idsCreados.push(original.id);

    // Simula: se eliminó la cuenta de Clerk y la persona se volvió a
    // registrar con el mismo email -> Clerk le da un id nuevo.
    const clerkIdNuevo = `test-clerk-reingreso-c-nuevo-${Date.now()}`;
    currentUserMock.mockResolvedValueOnce(
      usuarioClerkFalso({ id: clerkIdNuevo, email, roles: [] })
    );
    const { usuario: reingresado } = await getOrCreateUsuarioActual();

    expect(reingresado.id).toBe(original.id); // mismo registro histórico
    expect(reingresado.clerkId).toBe(clerkIdNuevo); // re-vinculado al nuevo
    expect(reingresado.roles).toEqual([]); // sin roles, hay que reasignar

    const buscadoPorClerkIdViejo = await prisma.usuario.findUnique({
      where: { clerkId: clerkIdOriginal },
    });
    expect(buscadoPorClerkIdViejo).toBeNull();
  });
});
