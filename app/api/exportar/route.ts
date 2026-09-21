import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { generarExcelCasos } from "@/lib/exportacion/exportarCasos";

export async function GET(request: NextRequest) {
  const user = await currentUser();
  if (!user) {
    return new NextResponse("No autenticado", { status: 401 });
  }

  const params = request.nextUrl.searchParams;
  const estados = params.getAll("estado");
  const desde = params.get("desde");
  const hasta = params.get("hasta");
  const campo = params.get("campo") || undefined;
  const valor = params.get("valor") || undefined;
  const busqueda = params.get("busqueda") || undefined;

  const buffer = await generarExcelCasos({
    estado: estados.length === 1 ? estados[0] : undefined,
    estadoIn: estados.length > 1 ? estados : undefined,
    fechaDesde: desde ? new Date(desde) : undefined,
    fechaHasta: hasta ? new Date(hasta) : undefined,
    campoImportado: campo,
    valorImportado: valor,
    busqueda,
  });

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="casos-reembolso.xlsx"',
    },
  });
}
