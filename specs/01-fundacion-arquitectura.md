# Spec 01 — Fundación técnica y modelo de datos

## Objetivo
Dejar listo el esqueleto del proyecto y el modelo de datos base sobre el que se construyen todas las demás specs. No implementa funcionalidad de negocio visible todavía.

## Alcance
- Inicializar proyecto Next.js 16 (App Router), configurado para desplegar en Vercel.
- Configurar Prisma + conexión a PostgreSQL (Neon).
- Configurar Vercel Blob Storage (credenciales, cliente de subida/descarga).
- Configurar Tailwind CSS + shadcn/ui.
- Autenticación multi-usuario con roles (decisión #5 en [00-decisiones.md](00-decisiones.md)):
  - **Proveedor: Clerk** (decidido).
  - Roles mínimos: `importador`, `revisor`. Un usuario puede tener uno o ambos roles.
- Modelo de datos inicial en Prisma (borrador de la sección 4 del documento original, ajustado):
  - `CasoReembolso`: id, folio (único, ver decisión #2), campos importados del Excel (placeholder hasta spec 02), estado actual, fecha de creación, fecha de última actualización, importacionId (FK).
  - `HistorialEstado`: id, casoId (FK), estadoAnterior, estadoNuevo, fecha, usuarioId (FK, nullable si es un cambio automático del sistema).
  - `Documento`: id, casoId (FK, nullable si no matchea), nombreArchivo, tipoArchivo, urlBlob, fechaCarga, estadoMatching (`matcheado` / `sin_match`).
  - `ImportacionExcel`: id, nombreArchivoOriginal, fecha, usuarioId (FK), cantidadFilas, cantidadDuplicados, cantidadErrores.
  - `Usuario`: id, email, nombre, roles (relación o enum array).
- Estructura de carpetas del proyecto (`/app`, `/lib`, `/prisma`, `/specs`, `/tests`).
- Configuración de entorno (`.env.example` con las variables necesarias: `DATABASE_URL`, `BLOB_READ_WRITE_TOKEN`, credenciales de auth).

## Fuera de alcance
- Cualquier UI de negocio (listados, formularios de importación, dashboards).
- Lógica de parseo de Excel, duplicados, matching o exportación (specs 02–07).

## Criterios de aceptación
- `npx prisma migrate dev` corre sin errores y genera las 5 tablas descritas.
- Existe al menos un flujo de login funcional con al menos un rol asignado a un usuario de prueba.
- Subir un archivo de prueba a Vercel Blob y recuperar su URL funciona desde un script o test manual.
- El proyecto deployado en Vercel responde en una ruta raíz (aunque sea una página en blanco/placeholder).

## Dependencias
Ninguna (es la base). Todas las demás specs dependen de esta.

## Notas
- Este spec no requiere TDD estricto (es configuración de infraestructura), pero si se agrega lógica de autorización por rol, esa lógica sí debe tener tests.
