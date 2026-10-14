<<<<<<< HEAD
import app from "./app";

const PORT = 3333;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
=======
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
>>>>>>> b6b5b13f0f5cd825ecc9b51bee5b214ffd1192f3
});