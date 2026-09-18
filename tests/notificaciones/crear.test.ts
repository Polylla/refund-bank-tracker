import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { notificarATodosLosUsuarios } from "@/lib/notificaciones/crear";

describe("notificarATodosLosUsuarios", () => {
  const usuarioIds: string[] = [];

  beforeAll(async () => {
    for (let i = 0; i < 2; i++) {
      const usuario = await prisma.usuario.create({
        data: {
          clerkId: `test-clerk-notif-${Date.now()}-${i}`,
          email: `test-notif-${Date.now()}-${i}@example.com`,
          roles: ["IMPORTADOR"],
        },
      });
      usuarioIds.push(usuario.id);
    }
  });

  const mensajeDePrueba = `Un documento no matcheó (test ${Date.now()})`;

  afterAll(async () => {
    // notificarATodosLosUsuarios manda a TODOS los usuarios de la base
    // real compartida (no solo a los de prueba) — hay que limpiar por
    // el mensaje distintivo de este test, no solo por usuarioIds.
    await prisma.notificacion.deleteMany({
      where: { mensaje: mensajeDePrueba },
    });
    await prisma.usuario.deleteMany({ where: { id: { in: usuarioIds } } });
    await prisma.$disconnect();
  });

  it("crea una notificación para cada usuario existente", async () => {
    await notificarATodosLosUsuarios(
      "DOCUMENTO_SIN_MATCH",
      mensajeDePrueba,
      "/documentos"
    );

    const notifs = await prisma.notificacion.findMany({
      where: { mensaje: mensajeDePrueba },
    });

    const notifsDePrueba = notifs.filter((n) =>
      usuarioIds.includes(n.usuarioId)
    );

    // Llegó a ambos usuarios de prueba...
    expect(notifsDePrueba).toHaveLength(usuarioIds.length);
    // ...y a "todos los usuarios" incluye también a los que ya
    // existían en la base (no solo a los de prueba).
    const totalUsuarios = await prisma.usuario.count();
    expect(notifs).toHaveLength(totalUsuarios);

    expect(notifs.every((n) => n.tipo === "DOCUMENTO_SIN_MATCH")).toBe(true);
    expect(notifs.every((n) => n.mensaje === mensajeDePrueba)).toBe(true);
    expect(notifs.every((n) => n.enlace === "/documentos")).toBe(true);
    expect(notifs.every((n) => n.leida === false)).toBe(true);
  });
});
