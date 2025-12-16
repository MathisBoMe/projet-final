/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Réalisateur` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Réalisateur_name_key" ON "Réalisateur"("name");
