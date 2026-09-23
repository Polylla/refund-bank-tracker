"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Wallet,
  Upload,
  ClipboardCheck,
  FileText,
  BarChart3,
  ShieldCheck,
} from "lucide-react";
import type { Role } from "@/lib/roles";

const LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/casos", label: "Casos", icon: FolderKanban },
  { href: "/casos/pagos-pendientes", label: "Pagos pendientes", icon: Wallet },
  { href: "/importaciones", label: "Importar", icon: Upload },
  { href: "/revision", label: "Revisión", icon: ClipboardCheck },
  { href: "/documentos", label: "Documentos", icon: FileText },
  {
    href: "/reportes/estudios",
    label: "Reportes por estudio",
    icon: BarChart3,
  },
];

export function Sidebar({ roles }: { roles: Role[] }) {
  const pathname = usePathname();
  const links = roles.includes("admin")
    ? [
        ...LINKS,
        { href: "/admin/usuarios", label: "Administración", icon: ShieldCheck },
      ]
    : LINKS;

  return (
    <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col bg-sidebar text-sidebar-foreground">
      <div className="px-5 py-5">
        <Link href="/" className="block text-base font-semibold text-white">
          Gestión de Reembolsos
        </Link>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 px-3">
        {links.map((link) => {
          const Icon = link.icon;
          const activo =
            pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                activo
                  ? "bg-primary text-white"
                  : "text-sidebar-foreground hover:bg-white/5"
              }`}
            >
              <Icon size={18} strokeWidth={2} />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
