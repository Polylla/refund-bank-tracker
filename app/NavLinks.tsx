"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/casos", label: "Casos" },
  { href: "/importaciones", label: "Importar" },
  { href: "/revision", label: "Revisión" },
  { href: "/documentos", label: "Documentos" },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-1">
      {LINKS.map((link) => {
        const activo =
          pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
              activo
                ? "bg-primary text-primary-foreground"
                : "text-gray-600 hover:bg-black/5 dark:text-gray-300 dark:hover:bg-white/10"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
