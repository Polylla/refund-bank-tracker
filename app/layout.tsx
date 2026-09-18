import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider, Show, SignInButton, UserButton } from "@clerk/nextjs";
import { NavLinks } from "./NavLinks";
import "./globals.css";

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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <ClerkProvider>
      <html
        lang="es"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 sm:px-6">
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/"
                className="text-base font-semibold text-primary whitespace-nowrap"
              >
                Gestión de Reembolsos
              </Link>
              <Show when="signed-in">
                <NavLinks />
              </Show>
            </div>
            <div className="flex items-center gap-4">
              <Show when="signed-out">
                <SignInButton />
              </Show>
              <Show when="signed-in">
                <UserButton />
              </Show>
            </div>
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
