import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 3333;

// Middlewares
app.use(cors());
app.use(express.json());

// Rota de teste original mantida
app.get('/', (req, res) => {
  res.json({ message: 'API do MonitoraSom rodando perfeitamente!' });
});

// ==========================================
// ETAPA 3: Rota DELETE (Issue #27)
// ==========================================
app.delete('/api/audios/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Verifica se o áudio existe antes de tentar apagar
    const audio = await prisma.audio.findUnique({
      where: { id }
    });

    if (!audio) {
      return res.status(404).json({ error: 'Áudio não encontrado.' });
    }

    // 2. Apaga o áudio (o Prisma cuida de apagar os rótulos vinculados automaticamente via Cascade)
    await prisma.audio.delete({
      where: { id }
    });

    return res.status(200).json({ message: 'Áudio e rótulos vinculados excluídos com sucesso!' });
  } catch (error) {
    console.error('Erro ao excluir áudio:', error);
    return res.status(500).json({ error: 'Erro interno do servidor ao tentar excluir o áudio.' });
  }
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});