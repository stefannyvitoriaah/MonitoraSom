from fastapi import FastAPI, UploadFile, File, HTTPException
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

# Definição de formatos aceitos
FORMATOS_PERMITIDOS = ["video/mp4", "video/x-msvideo", "video/quicktime", "video/x-matroska"]
EXTENSOES_PERMITIDAS = [".mp4", ".avi", ".mov", ".mkv"]

@app.get("/")
def read_root():
    return {"status": "online", "message": "API de processamento FastAPI rodando com sucesso!"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/api/converter")
async def converter_video(arquivo: UploadFile = File(...)):
    # 1. Validação 1: Arquivo vazio ou sem nome
    if not arquivo.filename:
        raise HTTPException(status_code=400, detail="Nenhum arquivo foi enviado.")

    # 2. Validação 2: Verificar a extensão do arquivo
    extensao = os.path.splitext(arquivo.filename)[1].lower()
    if extensao not in EXTENSOES_PERMITIDAS:
        raise HTTPException(status_code=415, detail=f"Formato não suportado. Use vídeos do tipo: {', '.join(EXTENSOES_PERMITIDAS)}")

    # 3. Validação 3: Verificar o tipo MIME (Content-Type)
    if arquivo.content_type not in FORMATOS_PERMITIDOS:
        raise HTTPException(status_code=415, detail="O conteúdo enviado não é um formato de vídeo válido.")

    caminho_video = f"/tmp/{arquivo.filename}"
    nome_base = os.path.splitext(arquivo.filename)[0]
    caminho_audio = f"/tmp/{nome_base}.mp3"

    # Guarda o vídeo enviado
    with open(caminho_video, "wb") as buffer:
        buffer.write(await arquivo.read())

    # 4. Validação 4: Tratamento de erro caso o FFmpeg falhe (vídeo corrompido)
    try:
        subprocess.run([
            "ffmpeg", "-y", "-i", caminho_video, 
            "-vn", "-ar", "44100", "-ac", "2", "-b:a", "192k", 
            caminho_audio
        ], check=True, stderr=subprocess.PIPE)
    except subprocess.CalledProcessError:
        os.remove(caminho_video) # Apaga o lixo se der erro
        raise HTTPException(status_code=422, detail="O arquivo de vídeo está corrompido ou é ilegível para conversão.")

    os.remove(caminho_video)

    return FileResponse(caminho_audio, media_type="audio/mpeg", filename=f"{nome_base}.mp3")