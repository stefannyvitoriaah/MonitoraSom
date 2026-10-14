from fastapi import FastAPI, UploadFile, File


app = FastAPI()


@app.get("/")
def home():
    return {
        "status": "Microserviço funcionando"
    }


@app.post("/process")
async def process_audio(
    audio: UploadFile = File(...)
):

    conteudo = await audio.read()

    tamanho = len(conteudo)


    return {
        "status": "ok",
        "arquivo": audio.filename,
        "tamanho_bytes": tamanho
    }