import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SignInButton } from "@clerk/nextjs";

export default async function Home() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-semibold text-primary">
          Gestión de Reembolsos
        </h1>
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          Sistema de seguimiento de reembolsos a receptores judiciales:
          importación de casos, detección de duplicados, estados de pago y
          matching de documentos de respaldo.
        </p>
        <div className="mt-6">
          <SignInButton>
            <button className="rounded bg-primary px-5 py-2 text-sm font-medium text-primary-foreground">
              Iniciar sesión
            </button>
          </SignInButton>
        </div>
      </div>
    </div>
  );
}
