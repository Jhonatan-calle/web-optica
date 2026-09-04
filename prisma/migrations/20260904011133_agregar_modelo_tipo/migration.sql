/*
  Warnings:

  - Added the required column `tipoId` to the `Linea` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Linea" ADD COLUMN     "tipoId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Tipo" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Tipo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tipo_nombre_key" ON "Tipo"("nombre");

-- AddForeignKey
ALTER TABLE "Linea" ADD CONSTRAINT "Linea_tipoId_fkey" FOREIGN KEY ("tipoId") REFERENCES "Tipo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
