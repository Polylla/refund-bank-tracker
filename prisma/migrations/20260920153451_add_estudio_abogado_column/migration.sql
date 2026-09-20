-- AlterTable
ALTER TABLE "casos_reembolso" ADD COLUMN     "estudioAbogado" TEXT;

-- CreateIndex
CREATE INDEX "casos_reembolso_estudioAbogado_idx" ON "casos_reembolso"("estudioAbogado");
