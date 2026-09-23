"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DIAS = ["L", "M", "M", "J", "V", "S", "D"];

function formatearISO(fecha: Date): string {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

export function SidebarCalendar() {
  const hoy = new Date();
  const [mesActual, setMesActual] = useState(
    new Date(hoy.getFullYear(), hoy.getMonth(), 1)
  );
  const router = useRouter();

  const primerDiaSemana = (mesActual.getDay() + 6) % 7; // lunes = 0
  const diasEnMes = new Date(
    mesActual.getFullYear(),
    mesActual.getMonth() + 1,
    0
  ).getDate();

  const celdas: (number | null)[] = [
    ...Array(primerDiaSemana).fill(null),
    ...Array.from({ length: diasEnMes }, (_, i) => i + 1),
  ];

  function irADia(dia: number) {
    const fecha = new Date(mesActual.getFullYear(), mesActual.getMonth(), dia);
    const iso = formatearISO(fecha);
    router.push(`/casos?desde=${iso}&hasta=${iso}`);
  }

  function cambiarMes(delta: number) {
    setMesActual(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1)
    );
  }

  function esHoy(dia: number): boolean {
    return (
      dia === hoy.getDate() &&
      mesActual.getMonth() === hoy.getMonth() &&
      mesActual.getFullYear() === hoy.getFullYear()
    );
  }

  return (
    <div className="mx-3 mb-4 rounded-lg bg-white/5 p-3 text-xs text-sidebar-foreground">
      <div className="flex items-center justify-between">
        <button
          onClick={() => cambiarMes(-1)}
          aria-label="Mes anterior"
          className="rounded p-0.5 hover:bg-white/10"
        >
          <ChevronLeft size={14} />
        </button>
        <span className="font-medium capitalize">
          {mesActual.toLocaleDateString("es-CL", {
            month: "long",
            year: "numeric",
          })}
        </span>
        <button
          onClick={() => cambiarMes(1)}
          aria-label="Mes siguiente"
          className="rounded p-0.5 hover:bg-white/10"
        >
          <ChevronRight size={14} />
        </button>
      </div>
      <div className="mt-2 grid grid-cols-7 gap-y-1 text-center">
        {DIAS.map((d, i) => (
          <span key={i} className="text-sidebar-foreground-muted">
            {d}
          </span>
        ))}
        {celdas.map((dia, i) =>
          dia === null ? (
            <span key={i} />
          ) : (
            <button
              key={i}
              onClick={() => irADia(dia)}
              title={`Ver casos del ${formatearISO(
                new Date(mesActual.getFullYear(), mesActual.getMonth(), dia)
              )}`}
              className={`rounded-full py-0.5 transition-colors hover:bg-primary hover:text-white ${
                esHoy(dia) ? "bg-primary text-white" : ""
              }`}
            >
              {dia}
            </button>
          )
        )}
      </div>
    </div>
  );
}
