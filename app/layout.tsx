import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider, Show, SignInButton, UserButton } from "@clerk/nextjs";
import { Sidebar } from "./Sidebar";
import { NotificacionesBadge } from "./NotificacionesBadge";
import { getOrCreateUsuarioActual } from "@/lib/usuarios";
import type { Role } from "@/lib/roles";
import "./globals.css";

async function getRolesUsuarioActual(): Promise<Role[]> {
  try {
    const { roles } = await getOrCreateUsuarioActual();
    return roles;
  } catch {
    return [];
  }
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gestión de Reembolsos",
  description: "Gestión del ciclo de vida de reembolsos a receptores judiciales",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const roles = await getRolesUsuarioActual();

  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#f26522",
        },
      }}
    >
      <html
        lang="es"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="flex min-h-screen">
          <Show when="signed-in">
            <Sidebar roles={roles} />
          </Show>
          <div className="flex min-h-screen flex-1 flex-col">
            <Show when="signed-out">
              <header className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 bg-surface px-4 py-3 shadow-sm sm:px-6">
                <Link
                  href="/"
                  className="text-base font-semibold text-primary whitespace-nowrap"
                >
                  Gestión de Reembolsos
                </Link>
                <SignInButton />
              </header>
            </Show>
            <Show when="signed-in">
              <header className="flex items-center justify-end gap-4 border-b border-black/5 bg-surface px-4 py-3 shadow-sm sm:px-6">
                <NotificacionesBadge />
                <UserButton />
              </header>
            </Show>
            {children}
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
