from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="API de Processamento - MonitoraSom",
    description="Microsserviço responsável pelo processamento de dados em Python.",
    version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "message": "API de processamento FastAPI rodando com sucesso!"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}