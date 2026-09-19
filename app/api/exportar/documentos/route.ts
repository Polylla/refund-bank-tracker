import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { generarZipDocumentos } from "@/lib/exportacion/exportarDocumentos";

export async function GET(request: NextRequest) {
  const user = await currentUser();
  if (!user) {
    return new NextResponse("No autenticado", { status: 401 });
  }

  const params = request.nextUrl.searchParams;
  const estado = params.get("estado") || undefined;
  const desde = params.get("desde");
  const hasta = params.get("hasta");
  const campo = params.get("campo") || undefined;
  const valor = params.get("valor") || undefined;

  const buffer = await generarZipDocumentos({
    estado,
    fechaDesde: desde ? new Date(desde) : undefined,
    fechaHasta: hasta ? new Date(hasta) : undefined,
    campoImportado: campo,
    valorImportado: valor,
  });

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": 'attachment; filename="documentos-casos.zip"',
    },
  });
}
