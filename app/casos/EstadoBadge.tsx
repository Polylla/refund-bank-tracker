const ESTILOS_POR_ESTADO: Record<string, string> = {
  Pendiente: "bg-warning/10 text-warning",
  "Enviado a pago": "bg-info/10 text-info",
  Pagado: "bg-success/10 text-success",
  Rechazado: "bg-danger/10 text-danger",
};

export function EstadoBadge({ estado }: { estado: string }) {
  const estilo = ESTILOS_POR_ESTADO[estado] ?? "bg-black/5 text-gray-600";
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${estilo}`}
    >
      {estado}
    </span>
  );
}
