-- CreateTable
CREATE TABLE "Film" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "release_date" TEXT NOT NULL,
    "realId" INTEGER NOT NULL,

    CONSTRAINT "Film_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Réalisateur" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "nationality" TEXT NOT NULL,

    CONSTRAINT "Réalisateur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Film_Acteur" (
    "id" SERIAL NOT NULL,
    "acteurId" INTEGER NOT NULL,
    "filmId" INTEGER NOT NULL,

    CONSTRAINT "Film_Acteur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Acteur" (
    "id" SERIAL NOT NULL,
    "content" INTEGER NOT NULL,

    CONSTRAINT "Acteur_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Film" ADD CONSTRAINT "Film_realId_fkey" FOREIGN KEY ("realId") REFERENCES "Réalisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Film_Acteur" ADD CONSTRAINT "Film_Acteur_acteurId_fkey" FOREIGN KEY ("acteurId") REFERENCES "Acteur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Film_Acteur" ADD CONSTRAINT "Film_Acteur_filmId_fkey" FOREIGN KEY ("filmId") REFERENCES "Film"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
