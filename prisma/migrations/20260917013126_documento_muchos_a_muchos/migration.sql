/*
  Warnings:

  - You are about to drop the column `casoId` on the `documentos` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "documentos" DROP CONSTRAINT "documentos_casoId_fkey";

-- AlterTable
ALTER TABLE "documentos" DROP COLUMN "casoId",
ADD COLUMN     "nBoletaExtraido" TEXT;

-- CreateTable
CREATE TABLE "_CasoReembolsoToDocumento" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CasoReembolsoToDocumento_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CasoReembolsoToDocumento_B_index" ON "_CasoReembolsoToDocumento"("B");

-- AddForeignKey
ALTER TABLE "_CasoReembolsoToDocumento" ADD CONSTRAINT "_CasoReembolsoToDocumento_A_fkey" FOREIGN KEY ("A") REFERENCES "casos_reembolso"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CasoReembolsoToDocumento" ADD CONSTRAINT "_CasoReembolsoToDocumento_B_fkey" FOREIGN KEY ("B") REFERENCES "documentos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
