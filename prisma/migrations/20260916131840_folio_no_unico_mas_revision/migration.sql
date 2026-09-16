-- CreateEnum
CREATE TYPE "EstadoRevisionFila" AS ENUM ('PENDIENTE', 'APROBADA', 'DESCARTADA');

-- DropIndex
DROP INDEX "casos_reembolso_folio_key";

-- AlterTable
-- conceptoGasto se agrega nullable primero porque la tabla ya tiene filas
-- reales (importacion de junio); se backfillea desde datosImportados y
-- recien despues se marca NOT NULL.
ALTER TABLE "casos_reembolso" ADD COLUMN     "conceptoGasto" TEXT,
ADD COLUMN     "posibleDuplicado" BOOLEAN NOT NULL DEFAULT false;

-- Backfill de conceptoGasto para filas existentes desde el JSON original
UPDATE "casos_reembolso"
SET "conceptoGasto" = "datosImportados"->>'Conceptos gasto de receptor'
WHERE "conceptoGasto" IS NULL;

-- Ahora que todas las filas tienen valor, se exige NOT NULL
ALTER TABLE "casos_reembolso" ALTER COLUMN "conceptoGasto" SET NOT NULL;

-- CreateTable
CREATE TABLE "filas_en_revision" (
    "id" TEXT NOT NULL,
    "importacionId" TEXT NOT NULL,
    "casoExistenteId" TEXT NOT NULL,
    "datosNuevos" JSONB NOT NULL,
    "estado" "EstadoRevisionFila" NOT NULL DEFAULT 'PENDIENTE',
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revisadoPorId" TEXT,
    "fechaRevision" TIMESTAMP(3),

    CONSTRAINT "filas_en_revision_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "casos_reembolso_folio_conceptoGasto_idx" ON "casos_reembolso"("folio", "conceptoGasto");

-- AddForeignKey
ALTER TABLE "filas_en_revision" ADD CONSTRAINT "filas_en_revision_importacionId_fkey" FOREIGN KEY ("importacionId") REFERENCES "importaciones_excel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "filas_en_revision" ADD CONSTRAINT "filas_en_revision_casoExistenteId_fkey" FOREIGN KEY ("casoExistenteId") REFERENCES "casos_reembolso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "filas_en_revision" ADD CONSTRAINT "filas_en_revision_revisadoPorId_fkey" FOREIGN KEY ("revisadoPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
