/*
  Warnings:

  - You are about to drop the `Audio` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Audio";

-- CreateTable
CREATE TABLE "audios" (
    "id" TEXT NOT NULL,
    "nomeOriginal" TEXT NOT NULL,
    "caminhoServidor" TEXT NOT NULL,
    "dataEnvio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audios_pkey" PRIMARY KEY ("id")
);
