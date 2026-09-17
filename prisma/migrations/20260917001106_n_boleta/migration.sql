-- AlterTable
ALTER TABLE "casos_reembolso" ADD COLUMN     "nBoleta" TEXT;

-- CreateIndex
CREATE INDEX "casos_reembolso_nBoleta_idx" ON "casos_reembolso"("nBoleta");
