import { prisma } from "./db.js";

async function main() {
  const result = await prisma.$queryRaw`SELECT 1 AS ok`;
  console.log("Conexão com o banco OK:", result);
}

main()
  .catch((error) => {
    console.error("Falha ao conectar no banco:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });