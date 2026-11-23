import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const app = express();
const port = process.env.PORT || 3333;

// Middlewares
app.use(cors());
app.use(express.json());

// ==========================================
// Configuração do Multer e Arquivos Estáticos (Issue #19 / #54)
// ==========================================
const uploadDir = path.resolve(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.use('/uploads', express.static(uploadDir));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ storage });

// Rota de teste original mantida
app.get('/', (req, res) => {
  res.json({ message: 'API do MonitoraSom rodando perfeitamente!' });
});

// ==========================================
// Rota GET para Listagem e Histórico de Áudios (Issue #54)
// ==========================================
app.get('/api/audios', async (req, res) => {
  try {
    const search =
      typeof req.query.search === 'string' ? req.query.search.trim() : '';

    const audios = await prisma.audio.findMany({
      where: search
        ? {
            OR: [
              {
                nomeOriginal: {
                  contains: search,
                  mode: 'insensitive'
                }
              },
              {
                rotulos: {
                  some: {
                    texto: {
                      contains: search,
                      mode: 'insensitive'
                    }
                  }
                }
              }
            ]
          }
        : undefined,
      include: {
        rotulos: true
      },
      orderBy: {
        dataEnvio: 'desc'
      }
    });

    return res.status(200).json(audios);
  } catch (error) {
    console.error('Erro ao listar áudios:', error);
    return res.status(500).json({
      error: 'Erro interno do servidor ao consultar os áudios.'
    });
  }
});

// ==========================================
// Rota GET para Detalhes de um Áudio Específico (Issue #54)
// ==========================================
app.get('/api/audios/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const audio = await prisma.audio.findUnique({
      where: { id },
      include: {
        rotulos: true
      }
    });

    if (!audio) {
      return res.status(404).json({ error: 'Áudio não encontrado.' });
    }

    return res.status(200).json(audio);
  } catch (error) {
    console.error('Erro ao buscar detalhes do áudio:', error);
    return res.status(500).json({
      error: 'Erro interno do servidor ao buscar o áudio.'
    });
  }
});

// ==========================================
// Rota POST para Recebimento/Upload (Issue #19)
// ==========================================
app.post('/api/audios', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo foi enviado. Use o campo "file".' });
    }

    const nomeOriginal = req.body.nomeOriginal || req.file.originalname;
    const caminhoServidor = `uploads/${req.file.filename}`;

    const novoAudio = await prisma.audio.create({
      data: {
        nomeOriginal,
        caminhoServidor
      }
    });

    return res.status(201).json({
      message: 'Arquivo recebido e registrado com sucesso!',
      audio: novoAudio
    });
  } catch (error) {
    console.error('Erro ao realizar upload do áudio:', error);
    return res.status(500).json({ error: 'Erro interno do servidor ao salvar o arquivo.' });
  }
});

// ==========================================
// Rota DELETE de Áudios (Issue #27)
// ==========================================
app.delete('/api/audios/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const audio = await prisma.audio.findUnique({
      where: { id }
    });

    if (!audio) {
      return res.status(404).json({ error: 'Áudio não encontrado.' });
    }

    await prisma.audio.delete({
      where: { id }
    });

    return res.status(200).json({ message: 'Áudio e rótulos vinculados excluídos com sucesso!' });
  } catch (error) {
    console.error('Erro ao excluir áudio:', error);
    return res.status(500).json({ error: 'Erro interno do servidor ao tentar excluir o áudio.' });
  }
});

// ==========================================
// Rota PUT para Atualização de Áudios (Issue #28)
// ==========================================
app.put('/api/audios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nomeOriginal } = req.body;

    if (!nomeOriginal) {
      return res.status(400).json({ error: 'O campo nomeOriginal é obrigatório para a atualização.' });
    }

    const audioExistente = await prisma.audio.findUnique({
      where: { id }
    });

    if (!audioExistente) {
      return res.status(404).json({ error: 'Áudio não encontrado.' });
    }

    const audioAtualizado = await prisma.audio.update({
      where: { id },
      data: {
        nomeOriginal
      }
    });

    return res.status(200).json({
      message: 'Áudio atualizado com sucesso!',
      audio: audioAtualizado
    });
  } catch (error) {
    console.error('Erro ao atualizar áudio:', error);
    return res.status(500).json({ error: 'Erro interno do servidor ao tentar atualizar o áudio.' });
  }
});

// ==========================================
// Rotas CRUD de Rótulos (Issue #55)
// ==========================================

// Listar todos os rótulos de um áudio específico
app.get('/api/audios/:audioId/rotulos', async (req, res) => {
  try {
    const { audioId } = req.params;

    const audioExistente = await prisma.audio.findUnique({
      where: { id: audioId },
      include: { rotulos: true }
    });

    if (!audioExistente) {
      return res.status(404).json({ error: 'Áudio não encontrado.' });
    }

    return res.status(200).json(audioExistente.rotulos);
  } catch (error) {
    console.error('Erro ao listar rótulos do áudio:', error);
    return res.status(500).json({ error: 'Erro interno do servidor ao listar os rótulos.' });
  }
});

// Criar um novo rótulo associado a um áudio
app.post('/api/audios/:audioId/rotulos', async (req, res) => {
  try {
    const { audioId } = req.params;
    const { texto } = req.body;

    if (typeof texto !== 'string' || !texto.trim()) {
      return res.status(400).json({ error: 'O campo "texto" é obrigatório e não pode estar vazio.' });
    }

    const audioExistente = await prisma.audio.findUnique({
      where: { id: audioId }
    });

    if (!audioExistente) {
      return res.status(404).json({ error: 'Áudio não encontrado para vincular o rótulo.' });
    }

    const novoRotulo = await prisma.rotulo.create({
      data: {
        texto: texto.trim(),
        audioId
      }
    });

    return res.status(201).json({
      message: 'Rótulo criado com sucesso!',
      rotulo: novoRotulo
    });
  } catch (error) {
    console.error('Erro ao criar rótulo:', error);
    return res.status(500).json({ error: 'Erro interno do servidor ao criar o rótulo.' });
  }
});

// Atualizar o texto de um rótulo específico
app.put('/api/rotulos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { texto } = req.body;

    if (typeof texto !== 'string' || !texto.trim()) {
      return res.status(400).json({ error: 'O campo "texto" é obrigatório e não pode estar vazio.' });
    }

    const rotuloExistente = await prisma.rotulo.findUnique({
      where: { id }
    });

    if (!rotuloExistente) {
      return res.status(404).json({ error: 'Rótulo não encontrado.' });
    }

    const rotuloAtualizado = await prisma.rotulo.update({
      where: { id },
      data: {
        texto: texto.trim()
      }
    });

    return res.status(200).json({
      message: 'Rótulo atualizado com sucesso!',
      rotulo: rotuloAtualizado
    });
  } catch (error) {
    console.error('Erro ao atualizar rótulo:', error);
    return res.status(500).json({ error: 'Erro interno do servidor ao atualizar o rótulo.' });
  }
});

// Excluir um rótulo específico (sem excluir o áudio pai)
app.delete('/api/rotulos/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const rotuloExistente = await prisma.rotulo.findUnique({
      where: { id }
    });

    if (!rotuloExistente) {
      return res.status(404).json({ error: 'Rótulo não encontrado.' });
    }

    await prisma.rotulo.delete({
      where: { id }
    });

    return res.status(200).json({ message: 'Rótulo excluído com sucesso!' });
  } catch (error) {
    console.error('Erro ao excluir rótulo:', error);
    return res.status(500).json({ error: 'Erro interno do servidor ao excluir o rótulo.' });
  }
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});