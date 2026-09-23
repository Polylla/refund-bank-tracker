import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export type StatColor = "warning" | "success" | "info" | "danger" | "neutral";

const COLOR_CLASSES: Record<StatColor, string> = {
  warning: "bg-warning/10 text-warning",
  success: "bg-success/10 text-success",
  info: "bg-info/10 text-info",
  danger: "bg-danger/10 text-danger",
  neutral: "bg-black/5 text-gray-500",
};

interface Props {
  href: string;
  icon: LucideIcon;
  value: number;
  label: string;
  color: StatColor;
}

export function StatCard({ href, icon: Icon, value, label, color }: Props) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-black/[.02]"
    >
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${COLOR_CLASSES[color]}`}
      >
        <Icon size={20} />
      </div>
      <div>
        <div className="text-2xl font-semibold">{value}</div>
        <div className="text-xs text-gray-500">{label}</div>
      </div>
    </Link>
  );
}
