-- CreateTable
CREATE TABLE "rotulos" (
    "id" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "audioId" TEXT NOT NULL,

    CONSTRAINT "rotulos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "rotulos" ADD CONSTRAINT "rotulos_audioId_fkey" FOREIGN KEY ("audioId") REFERENCES "audios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
