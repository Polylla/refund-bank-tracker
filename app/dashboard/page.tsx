import { currentUser } from "@clerk/nextjs/server";
import { getRoles } from "@/lib/roles";

export default async function DashboardPage() {
  const user = await currentUser();
  const roles = getRoles(user?.publicMetadata);

  return (
    <div className="flex-1 p-8">
      <h1 className="text-xl font-semibold">Dashboard (ruta protegida)</h1>
      <p className="mt-2 text-sm text-gray-600">
        Sesión activa: {user?.primaryEmailAddress?.emailAddress}
      </p>
      <p className="mt-1 text-sm text-gray-600">
        Roles: {roles.length > 0 ? roles.join(", ") : "sin roles asignados"}
      </p>
    </div>
  );
}
