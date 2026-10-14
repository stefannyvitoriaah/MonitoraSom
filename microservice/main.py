from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import os
import subprocess

app = FastAPI(
    title="API de Processamento - MonitoraSom",
    description="Microsserviço responsável pelo processamento de dados em Python.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "message": "API de processamento FastAPI rodando com sucesso!"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/api/converter")
async def converter_video(arquivo: UploadFile = File(...)):
    # 1. Define os caminhos temporários dentro do contentor
    caminho_video = f"/tmp/{arquivo.filename}"
    nome_base = os.path.splitext(arquivo.filename)[0]
    caminho_audio = f"/tmp/{nome_base}.mp3"

    # 2. Guarda o vídeo enviado na pasta temporária
    with open(caminho_video, "wb") as buffer:
        buffer.write(await arquivo.read())

    # 3. Executa o FFmpeg no terminal do contentor para extrair o áudio
    # -vn (ignora o vídeo), -ar 44100 (frequência), -b:a 192k (qualidade)
    subprocess.run([
        "ffmpeg", "-y", "-i", caminho_video, 
        "-vn", "-ar", "44100", "-ac", "2", "-b:a", "192k", 
        caminho_audio
    ], check=True)

    # 4. Apaga o vídeo original para não sobrecarregar a memória do servidor
    os.remove(caminho_video)

    # 5. Devolve o MP3 pronto como ficheiro de download
    return FileResponse(caminho_audio, media_type="audio/mpeg", filename=f"{nome_base}.mp3")