/*
  Warnings:

  - Made the column `estudioAbogado` on table `casos_reembolso` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "casos_reembolso" ALTER COLUMN "estudioAbogado" SET NOT NULL;
