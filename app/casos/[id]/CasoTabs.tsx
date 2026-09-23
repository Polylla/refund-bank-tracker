"use client";

import { useState, type ReactNode } from "react";

type TabId = "informacion" | "historial" | "documentos";

const TABS: { id: TabId; label: string }[] = [
  { id: "informacion", label: "Información" },
  { id: "historial", label: "Historial" },
  { id: "documentos", label: "Documentos" },
];

export function CasoTabs({
  informacion,
  historial,
  documentos,
}: {
  informacion: ReactNode;
  historial: ReactNode;
  documentos: ReactNode;
}) {
  const [tab, setTab] = useState<TabId>("informacion");

  const contenido = {
    informacion,
    historial,
    documentos,
  };

  return (
    <div className="mt-6">
      <div className="flex gap-1 border-b">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.id
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="pt-4">{contenido[tab]}</div>
    </div>
  );
}
