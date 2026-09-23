"use client";

import { useRouter } from "next/navigation";
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

function rangoDelMes(mes: string): { desde: string; hasta: string } {
  const [anio, mesNum] = mes.split("-").map(Number);
  const desde = new Date(anio, mesNum - 1, 1);
  const hasta = new Date(anio, mesNum, 0);
  const formatear = (d: Date) => d.toISOString().slice(0, 10);
  return { desde: formatear(desde), hasta: formatear(hasta) };
}

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
  const router = useRouter();

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
          onClick={(entry) => {
            const estado = (entry.payload as { estado: string }).estado;
            router.push(`/casos?estado=${encodeURIComponent(estado)}`);
          }}
          style={{ cursor: "pointer" }}
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
  data: { mes: string; label: string; cantidad: number }[];
}) {
  const router = useRouter();

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
        <Tooltip />
        <Bar
          dataKey="cantidad"
          fill="#f26522"
          radius={[4, 4, 0, 0]}
          style={{ cursor: "pointer" }}
          onClick={(entry) => {
            const mes = (entry.payload as { mes: string }).mes;
            const { desde, hasta } = rangoDelMes(mes);
            router.push(`/casos?desde=${desde}&hasta=${hasta}`);
          }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
