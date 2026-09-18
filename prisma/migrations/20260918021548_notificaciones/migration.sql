-- CreateEnum
CREATE TYPE "TipoNotificacion" AS ENUM ('DOCUMENTO_SIN_MATCH', 'FILA_EN_REVISION', 'RESUMEN_DIARIO');

-- AlterTable
ALTER TABLE "casos_reembolso" ADD COLUMN     "duplicadoRevisadoEn" TIMESTAMP(3),
ADD COLUMN     "duplicadoRevisadoPorId" TEXT;

-- CreateTable
CREATE TABLE "notificaciones" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tipo" "TipoNotificacion" NOT NULL,
    "mensaje" TEXT NOT NULL,
    "enlace" TEXT,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificaciones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notificaciones_usuarioId_leida_idx" ON "notificaciones"("usuarioId", "leida");

-- AddForeignKey
ALTER TABLE "casos_reembolso" ADD CONSTRAINT "casos_reembolso_duplicadoRevisadoPorId_fkey" FOREIGN KEY ("duplicadoRevisadoPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
