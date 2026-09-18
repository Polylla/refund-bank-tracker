import { NextRequest, NextResponse } from "next/server";
import { generarNotificacionesResumenDiario } from "@/lib/notificaciones/resumenDiario";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  await generarNotificacionesResumenDiario();
  return NextResponse.json({ ok: true });
}
