/*
  Warnings:

  - You are about to drop the column `content` on the `Acteur` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Acteur` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `age` to the `Acteur` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Acteur` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nationality` to the `Acteur` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Acteur" DROP COLUMN "content",
ADD COLUMN     "age" INTEGER NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "nationality" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Acteur_name_key" ON "Acteur"("name");
