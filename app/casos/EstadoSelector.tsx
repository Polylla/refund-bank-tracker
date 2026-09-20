"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ESTADOS, MOTIVOS_RECHAZO } from "@/lib/estados/estados";
import { cambiarEstadoAction } from "./actions";
import { Toast } from "../Toast";

interface Props {
  casoId: string;
  estadoActual: string;
}

export function EstadoSelector({ casoId, estadoActual }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [pendienteRechazo, setPendienteRechazo] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [motivoDetalle, setMotivoDetalle] = useState("");
  const router = useRouter();

  function aplicarCambio(
    nuevoEstado: string,
    motivoRechazo?: string,
    motivoRechazoDetalle?: string
  ) {
    setError(null);
    startTransition(async () => {
      const resultado = await cambiarEstadoAction(
        casoId,
        nuevoEstado,
        motivoRechazo,
        motivoRechazoDetalle
      );
      if (!resultado.ok) {
        setError(resultado.mensaje ?? "No se pudo cambiar");
      } else {
        router.refresh();
        setToast(`Estado actualizado a "${nuevoEstado}"`);
        setPendienteRechazo(false);
        setMotivo("");
        setMotivoDetalle("");
      }
    });
  }

  function onChangeSelect(nuevoEstado: string) {
    setError(null);
    if (nuevoEstado === "Rechazado") {
      setPendienteRechazo(true);
      return;
    }
    aplicarCambio(nuevoEstado);
  }

  function confirmarRechazo() {
    if (!motivo) {
      setError("Elegí un motivo de rechazo");
      return;
    }
    if (motivo === "Otro" && !motivoDetalle.trim()) {
      setError('Especificá el detalle del motivo "Otro"');
      return;
    }
    aplicarCambio("Rechazado", motivo, motivoDetalle || undefined);
  }

  function cancelarRechazo() {
    setPendienteRechazo(false);
    setMotivo("");
    setMotivoDetalle("");
    setError(null);
  }

  return (
    <div>
      <select
        value={pendienteRechazo ? "Rechazado" : estadoActual}
        disabled={pending}
        onChange={(e) => onChangeSelect(e.target.value)}
        className="rounded border px-2 py-1 text-sm disabled:opacity-50"
      >
        {ESTADOS.map((estado) => (
          <option key={estado} value={estado}>
            {estado}
          </option>
        ))}
      </select>

      {pendienteRechazo && (
        <div className="mt-2 flex flex-col gap-2 rounded border p-2 text-xs">
          <label className="flex flex-col gap-1">
            Motivo de rechazo
            <select
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="rounded border px-2 py-1"
            >
              <option value="">Selecciona un motivo</option>
              {MOTIVOS_RECHAZO.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>
          {motivo === "Otro" && (
            <label className="flex flex-col gap-1">
              Detalle
              <input
                type="text"
                value={motivoDetalle}
                onChange={(e) => setMotivoDetalle(e.target.value)}
                className="rounded border px-2 py-1"
              />
            </label>
          )}
          <div className="flex gap-2">
            <button
              onClick={confirmarRechazo}
              disabled={pending}
              className="rounded bg-primary px-2 py-1 font-medium text-primary-foreground disabled:opacity-50"
            >
              Confirmar rechazo
            </button>
            <button
              onClick={cancelarRechazo}
              disabled={pending}
              className="rounded border px-2 py-1 disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
      {toast && <Toast mensaje={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
