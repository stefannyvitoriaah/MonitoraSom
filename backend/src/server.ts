import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3333;

// Middlewares
app.use(cors());
app.use(express.json());

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'API do MonitoraSom rodando perfeitamente!' });
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});