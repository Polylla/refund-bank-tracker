import { NextResponse } from "next/server";
import { get } from "@vercel/blob";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/documentos/[id]">
) {
  const user = await currentUser();
  if (!user) {
    return new NextResponse("No autenticado", { status: 401 });
  }

  const { id } = await ctx.params;
  const documento = await prisma.documento.findUnique({ where: { id } });
  if (!documento) {
    return new NextResponse("No encontrado", { status: 404 });
  }

  const result = await get(documento.urlBlob, { access: "private" });
  if (!result || result.statusCode !== 200 || !result.stream) {
    return new NextResponse("No encontrado", { status: 404 });
  }

  return new NextResponse(result.stream, {
    headers: {
      "Content-Type": result.blob.contentType,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    },
  });
}
