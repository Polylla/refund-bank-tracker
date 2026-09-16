# Tasks — Spec 01: Fundación técnica y modelo de datos

Cada task se implementa y se da por completa solo cuando cumple su criterio de verificación. No se pasa a la siguiente sin confirmar la anterior.

## Task 1.1 — Inicializar proyecto Next.js 16
- Crear proyecto Next.js 16 (App Router, TypeScript).
- Configurar Tailwind CSS + shadcn/ui (`components.json`, tema base).
- Estructura de carpetas: `/app`, `/lib`, `/prisma`, `/tests`, `/specs` (ya existe).
- `.gitignore`, `.env.example` (vacío por ahora, se llena en tasks siguientes).
- **Verificación:** `npm run dev` levanta una página placeholder sin errores en consola.

## Task 1.2 — Prisma + conexión a Neon
- Instalar Prisma, inicializar `schema.prisma` con datasource PostgreSQL.
- Variable `DATABASE_URL` en `.env.example` (documentada, sin valor real).
- **Verificación:** `npx prisma db pull` o `npx prisma migrate dev` conecta correctamente contra una base Neon de desarrollo (el usuario provee la connection string real fuera del repo).

## Task 1.3 — Modelo de datos inicial
- Definir en `schema.prisma`: `Usuario`, `CasoReembolso`, `HistorialEstado`, `Documento`, `ImportacionExcel` (campos según [01-fundacion-arquitectura.md](01-fundacion-arquitectura.md)).
- Generar migración inicial.
- **Verificación:** `npx prisma migrate dev` crea las 5 tablas sin errores; `npx prisma studio` las muestra vacías y con las relaciones correctas (FKs visibles).

## Task 1.4 — Autenticación con roles
- **Decisión confirmada: Clerk.**
- Configurar login (al menos un proveedor, ej. email/password o magic link).
- Modelar roles `importador` / `revisor` sobre el `Usuario` de Prisma.
- **Verificación:** un usuario de prueba puede loguearse; su rol es accesible en la sesión (`session.user.roles`); una ruta protegida de ejemplo rechaza a un usuario sin sesión.

## Task 1.5 — Vercel Blob Storage
- Instalar `@vercel/blob`. Store ya conectado al proyecto en Vercel (`BLOB_STORE_ID` ya en `.env.local`).
- Autenticación vía OIDC (sin `BLOB_READ_WRITE_TOKEN` estático): el SDK usa `BLOB_STORE_ID` + `VERCEL_OIDC_TOKEN` automáticamente. En local, `VERCEL_OIDC_TOKEN` se refresca corriendo `vercel env pull` cuando expire (vida corta, ~12h).
- Función de utilidad `uploadFile` / `getFileUrl` en `/lib`.
- **Verificación:** test (unitario o script manual) que sube un archivo de prueba y recupera su URL correctamente.

## Task 1.6 — Deploy inicial a Vercel
- Conectar repo a Vercel, configurar variables de entorno de producción (`DATABASE_URL`, `BLOB_READ_WRITE_TOKEN`, secretos de auth).
- **Verificación:** la URL de producción responde con la página placeholder; login funciona en producción contra la base Neon real.

---
**Nota TDD:** esta spec es mayormente configuración de infraestructura, sin lógica de negocio compleja, por lo que no exige TDD estricto salvo en Task 1.4 (control de acceso por rol), donde sí debe existir un test que verifique que una ruta protegida rechaza correctamente a un usuario sin el rol requerido.
