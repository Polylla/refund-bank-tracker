"use client";

import { useEffect } from "react";

export function Toast({
  mensaje,
  onClose,
}: {
  mensaje: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 2500);
    return () => clearTimeout(timer);
  }, [mensaje, onClose]);

  return (
    <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-lg">
      {mensaje}
    </div>
  );
}
