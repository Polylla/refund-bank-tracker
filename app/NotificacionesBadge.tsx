import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function NotificacionesBadge() {
  const user = await currentUser();
  if (!user) return null;

  const usuario = await prisma.usuario.findUnique({
    where: { clerkId: user.id },
  });
  const noLeidas = usuario
    ? await prisma.notificacion.count({
        where: { usuarioId: usuario.id, leida: false },
      })
    : 0;

  return (
    <Link href="/notificaciones" className="relative text-sm">
      🔔
      {noLeidas > 0 && (
        <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-600 px-1 text-[10px] font-medium text-white">
          {noLeidas > 9 ? "9+" : noLeidas}
        </span>
      )}
    </Link>
  );
}
