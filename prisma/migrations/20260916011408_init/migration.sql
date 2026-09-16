-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('IMPORTADOR', 'REVISOR');

-- CreateEnum
CREATE TYPE "EstadoMatching" AS ENUM ('MATCHEADO', 'SIN_MATCH');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nombre" TEXT,
    "roles" "Rol"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "casos_reembolso" (
    "id" TEXT NOT NULL,
    "folio" TEXT NOT NULL,
    "datosImportados" JSONB NOT NULL,
    "estadoActual" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "importacionId" TEXT NOT NULL,

    CONSTRAINT "casos_reembolso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historial_estados" (
    "id" TEXT NOT NULL,
    "casoId" TEXT NOT NULL,
    "estadoAnterior" TEXT,
    "estadoNuevo" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" TEXT,

    CONSTRAINT "historial_estados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documentos" (
    "id" TEXT NOT NULL,
    "casoId" TEXT,
    "nombreArchivo" TEXT NOT NULL,
    "tipoArchivo" TEXT NOT NULL,
    "urlBlob" TEXT NOT NULL,
    "fechaCarga" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estadoMatching" "EstadoMatching" NOT NULL,

    CONSTRAINT "documentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "importaciones_excel" (
    "id" TEXT NOT NULL,
    "nombreArchivoOriginal" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" TEXT NOT NULL,
    "cantidadFilas" INTEGER NOT NULL,
    "cantidadDuplicados" INTEGER NOT NULL,
    "cantidadErrores" INTEGER NOT NULL,

    CONSTRAINT "importaciones_excel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_clerkId_key" ON "usuarios"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "casos_reembolso_folio_key" ON "casos_reembolso"("folio");

-- AddForeignKey
ALTER TABLE "casos_reembolso" ADD CONSTRAINT "casos_reembolso_importacionId_fkey" FOREIGN KEY ("importacionId") REFERENCES "importaciones_excel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_estados" ADD CONSTRAINT "historial_estados_casoId_fkey" FOREIGN KEY ("casoId") REFERENCES "casos_reembolso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_estados" ADD CONSTRAINT "historial_estados_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos" ADD CONSTRAINT "documentos_casoId_fkey" FOREIGN KEY ("casoId") REFERENCES "casos_reembolso"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "importaciones_excel" ADD CONSTRAINT "importaciones_excel_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
