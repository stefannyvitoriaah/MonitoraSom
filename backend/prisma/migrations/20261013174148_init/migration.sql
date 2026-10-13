-- CreateTable
CREATE TABLE "Audio" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "caminho" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Audio_pkey" PRIMARY KEY ("id")
);
