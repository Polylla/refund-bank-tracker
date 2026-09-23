"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const COLOR_POR_ESTADO: Record<string, string> = {
  Pendiente: "#d97706",
  "Enviado a pago": "#2563eb",
  Pagado: "#16a34a",
  Rechazado: "#dc2626",
};

export function DonutCasosPorEstado({
  data,
}: {
  data: { estado: string; cantidad: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="cantidad"
          nameKey="estado"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={2}
        >
          {data.map((d) => (
            <Cell key={d.estado} fill={COLOR_POR_ESTADO[d.estado] ?? "#9ca3af"} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function BarrasCasosPorMes({
  data,
}: {
  data: { label: string; cantidad: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
        <Tooltip />
        <Bar dataKey="cantidad" fill="#f26522" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
