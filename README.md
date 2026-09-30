# MonitoraSom 🐦

[![Versão](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://semver.org)
[![Status](https://img.shields.io/badge/status-em%20desenvolvimento-orange.svg)]()

Projeto desenvolvido para a disciplina de Projeto Integrador do curso de Bacharelado em Ciência da Computação da UTFPR - Câmpus Campo Mourão. 

O **MonitoraSom** é uma plataforma web moderna construída para facilitar o processo de rotulação manual de eventos acústicos (como a vocalização de pássaros) em arquivos de áudio. A ferramenta visa auxiliar pesquisadores na criação de bases de dados rotuladas para o treinamento de modelos de Machine Learning, oferecendo uma alternativa rápida, não-invasiva e totalmente gratuita.

---

## 🛠️ Tecnologias Utilizadas

A arquitetura do projeto foi dividida para suportar interfaces fluidas e processamento pesado de mídia em background.

### Frontend
* **React.js + Next.js:** Construção da interface de usuário e roteamento.
* **TypeScript:** Tipagem estática para maior segurança e prevenção de bugs.
* **Tailwind CSS:** Estilização utilitária rápida e responsiva.
* **HTML5 Canvas API:** Renderização gráfica de alta performance para o espectrograma interativo.

### Backend Central
* **Node.js + Express:** API principal para orquestração das regras de negócio.
* **TypeScript:** Padronização da linguagem com o frontend.
* **PostgreSQL:** Banco de dados relacional para armazenamento de metadados, usuários, tabelas e histórico de rótulos.
* **TypeORM / Prisma:** Mapeamento objeto-relacional (ORM) para agilizar as consultas ao banco.

### Microserviço de Processamento
* **Python + FastAPI:** Serviço dedicado para tarefas que exigem alto poder computacional.
* **Librosa:** Extração de características musicais/matemáticas, geração de espectrogramas e corte de áudios.

### Infraestrutura
* **Docker & Docker Compose:** Containerização dos ambientes de banco de dados, API Node e microserviço Python.

---

## 🚀 Funcionalidades (Escopo do Projeto)

O sistema é dividido em 6 abas principais:

1. **Upload de Áudios:** Envio de arquivos `.mp3`, visualização de progresso e conversor integrado de vídeo `.mp4` para áudio `.mp3`.
2. **Histórico de Áudios:** Tabela de gerenciamento dos áudios processados, com opções de exclusão, edição de pré-rotulação e clonagem de registros.
3. **Configurações Gerais:** Gerenciamento das preferências de áudio e sons do sistema.
4. **Modificação e Anotação (Espectrograma):** Visualização interativa do áudio (espectrograma desenhado via Canvas), controles nativos de mídia, ajuste de volume de camadas e criação gráfica de rótulos exatos no tempo.
5. **Rotulação em Tabelas:** Formulários paralelos para adição rápida de anotações (autocompletar), organizados por pastas e partições.
6. **Downloads e Compartilhamento:** Geração de arquivos particionados (recortes de áudio + arquivos CSV/Excel). Suporte para download em lote (`.zip`) ou compartilhamento via link.

---

## ⚙️ Como executar o projeto localmente

**Pré-requisitos:** É necessário ter o [Docker](https://www.docker.com/) e o [Git](https://git-scm.com/) instalados na sua máquina.

1. **Clone o repositório:**
   ```bash
   git clone [https://github.com/stefannyvitoriaah/MonitoraSom.git](https://github.com/stefannyvitoriaah/MonitoraSom.git)
