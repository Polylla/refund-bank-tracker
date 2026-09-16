"use server";

import { currentUser } from "@clerk/nextjs/server";
import { Rol } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getRoles } from "@/lib/roles";
import {
  procesarImportacion,
  type ResultadoImportacion,
} from "@/lib/importacion/procesar";

async function getUsuarioImportador() {
  const user = await currentUser();
  if (!user) throw new Error("No autenticado");

  const rolesClerk = getRoles(user.publicMetadata);
  if (!rolesClerk.includes("importador")) {
    throw new Error("Requiere rol importador");
  }

  const roles = rolesClerk.map((r) =>
    r === "importador" ? Rol.IMPORTADOR : Rol.REVISOR
  );

  return prisma.usuario.upsert({
    where: { clerkId: user.id },
    update: {
      email: user.primaryEmailAddress?.emailAddress ?? "",
      nombre: user.fullName,
      roles,
    },
    create: {
      clerkId: user.id,
      email: user.primaryEmailAddress?.emailAddress ?? "",
      nombre: user.fullName,
      roles,
    },
  });
}

export async function importarArchivo(
  formData: FormData
): Promise<ResultadoImportacion> {
  const usuario = await getUsuarioImportador();

  const file = formData.get("archivo");
  if (!(file instanceof File)) {
    return { ok: false, mensaje: "No se recibió ningún archivo" };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  return procesarImportacion(buffer, file.name, usuario.id);
}
