# Tasks — Spec 01: Fundación técnica y modelo de datos

Cada task se implementa y se da por completa solo cuando cumple su criterio de verificación. No se pasa a la siguiente sin confirmar la anterior.

## Task 1.1 — Inicializar proyecto Next.js 16 ✅ completada
- Crear proyecto Next.js 16 (App Router, TypeScript).
- Configurar Tailwind CSS + shadcn/ui (`components.json`, tema base).
- Estructura de carpetas: `/app`, `/lib`, `/prisma`, `/tests`, `/specs` (ya existe).
- `.gitignore`, `.env.example` (vacío por ahora, se llena en tasks siguientes).
- **Verificación:** `npm run dev` levanta una página placeholder sin errores en consola.

## Task 1.2 — Prisma + conexión a Neon ✅ completada
(Nota: Prisma CLI no lee `.env.local` — necesita `DATABASE_URL` también en un `.env` en la raíz del proyecto, ambos gitignored.)
- Instalar Prisma, inicializar `schema.prisma` con datasource PostgreSQL.
- Variable `DATABASE_URL` en `.env.example` (documentada, sin valor real).
- **Verificación:** `npx prisma db pull` o `npx prisma migrate dev` conecta correctamente contra una base Neon de desarrollo (el usuario provee la connection string real fuera del repo).

## Task 1.3 — Modelo de datos inicial ✅ completada
- Definir en `schema.prisma`: `Usuario`, `CasoReembolso`, `HistorialEstado`, `Documento`, `ImportacionExcel` (campos según [01-fundacion-arquitectura.md](01-fundacion-arquitectura.md)).
- Generar migración inicial.
- **Verificación:** `npx prisma migrate dev` crea las 5 tablas sin errores; `npx prisma studio` las muestra vacías y con las relaciones correctas (FKs visibles).

## Task 1.4 — Autenticación con roles ✅ completada
- **Decisión confirmada: Clerk.**
- `proxy.ts` (Next.js 16 renombró `middleware.ts` a `proxy.ts`) con `clerkMiddleware` protegiendo `/dashboard(.*)`.
- `<ClerkProvider>` en `app/layout.tsx`, con `<Show when="signed-in">` / `<Show when="signed-out">` (en `@clerk/nextjs` Core 3, lanzado 2026-03-03, se eliminaron `<SignedIn>`/`<SignedOut>`/`<Protect>` a favor de `<Show>`).
- Páginas `/sign-in` y `/sign-up` (catch-all) con los componentes de Clerk.
- Roles `importador` / `revisor` vía `publicMetadata.roles` de Clerk (helper en `lib/roles.ts`), no todavía sincronizados al modelo `Usuario` de Prisma — eso se conecta cuando una spec necesite `usuarioId` real (ImportacionExcel, HistorialEstado).
- Ruta de prueba `/dashboard` protegida.
- **Verificación:** ✅ un usuario sin sesión que visita `/dashboard` es redirigido a `/sign-in` (confirmado en navegador, sin errores de consola).

## Task 1.5 — Vercel Blob Storage ✅ completada (verificación diferida a producción)
- `@vercel/blob` instalado. `lib/blob.ts` (`uploadFile` / `getFileUrl`) implementado.
- **Decisión del proyecto: un solo ambiente en Vercel (Production), sin Development/Preview separados.** Por eso no se conectó el store al ambiente "Development" (el CLI de Vercel siempre pide ese ambiente para OIDC local, aunque el proyecto no lo use).
- Consecuencia: el script `tests/manual/verify-blob.mjs` no corre en local vía OIDC. La verificación real de subida/matching de documentos se hace en producción cuando se implemente la spec 05 (matching de documentos), que es cuando `lib/blob.ts` se usa por primera vez de verdad.
- Autenticación vía OIDC en producción: `BLOB_STORE_ID` + `VERCEL_OIDC_TOKEN` (automático, sin `BLOB_READ_WRITE_TOKEN` estático).

## Task 1.6 — Deploy inicial a Vercel ✅ completada
- Proyecto conectado a GitHub (`Polylla/refund-bank-tracker`): cada push a `main` dispara build+deploy automático a Production.
- Deployment Protection ("Vercel Authentication") desactivada para Production por el usuario, para que Clerk sea la única puerta de entrada.
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL` / `NEXT_PUBLIC_CLERK_SIGN_UP_URL` agregadas a las env vars de Production en Vercel (no solo en `.env.local`) — de lo contrario Clerk redirige a su Account Portal hosteado en vez de nuestras páginas propias.
- **Verificación:** ✅ https://refund-bank-tracker.vercel.app carga la app; `/dashboard` redirige correctamente a `/sign-in` propio (confirmado en navegador, sin errores de consola).

---
**Nota TDD:** esta spec es mayormente configuración de infraestructura, sin lógica de negocio compleja, por lo que no exige TDD estricto salvo en Task 1.4 (control de acceso por rol), donde sí debe existir un test que verifique que una ruta protegida rechaza correctamente a un usuario sin el rol requerido.
