-- AlterTable
ALTER TABLE "casos_reembolso" ADD COLUMN     "motivoRechazo" TEXT,
ADD COLUMN     "motivoRechazoDetalle" TEXT;

-- AlterTable
ALTER TABLE "historial_estados" ADD COLUMN     "motivoRechazo" TEXT,
ADD COLUMN     "motivoRechazoDetalle" TEXT;
