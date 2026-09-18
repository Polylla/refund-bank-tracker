import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export default async function NotificacionesPage() {
  const user = await currentUser();
  if (!user) return null;

  const usuario = await prisma.usuario.findUnique({
    where: { clerkId: user.id },
  });

  const notificaciones = usuario
    ? await prisma.notificacion.findMany({
        where: { usuarioId: usuario.id },
        orderBy: { fecha: "desc" },
        take: 50,
      })
    : [];

  if (usuario && notificaciones.some((n) => !n.leida)) {
    await prisma.notificacion.updateMany({
      where: { usuarioId: usuario.id, leida: false },
      data: { leida: true },
    });
  }

  return (
    <div className="flex-1 p-8 max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold text-primary">Notificaciones</h1>

      {notificaciones.length === 0 ? (
        <p className="mt-6 text-sm text-gray-500">No tenés notificaciones.</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-2 text-sm">
          {notificaciones.map((n) => (
            <li key={n.id} className="rounded-lg border p-3">
              <div className="flex items-start justify-between gap-4">
                <p>{n.mensaje}</p>
                <span className="whitespace-nowrap text-xs text-gray-500">
                  {n.fecha.toLocaleString("es-CL")}
                </span>
              </div>
              {n.enlace && (
                <Link
                  href={n.enlace}
                  className="mt-1 inline-block text-primary underline"
                >
                  Ver
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
