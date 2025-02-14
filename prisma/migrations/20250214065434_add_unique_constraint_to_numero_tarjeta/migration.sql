/*
  Warnings:

  - A unique constraint covering the columns `[numeroTarjeta]` on the table `Tarjeta` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Tarjeta_numeroTarjeta_key" ON "Tarjeta"("numeroTarjeta");
