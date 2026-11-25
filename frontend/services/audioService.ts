export interface AudioRecord {
  id: string;
  nomeOriginal: string;
  caminhoServidor: string;
  dataEnvio: string;
}

export interface UploadAudioResponse {
  message: string;
  audio: AudioRecord;
}

export interface AudioResponse {
  message: string;
  audio: AudioRecord;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";


export async function uploadAudio(file: File): Promise<UploadAudioResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/api/audios`, {
    method: "POST",
    body: formData,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Falha no envio do arquivo "${file.name}".`);
  }

  return data as UploadAudioResponse;
}


export async function listarAudios(): Promise<AudioRecord[]> {
  const response = await fetch(`${API_URL}/api/audios`);

  const data = await response.json().catch(() => []);

  if (!response.ok) {
    throw new Error(data.error || "Erro ao buscar áudios.");
  }

  return data as AudioRecord[];
}


export async function renomearAudio(
  id: string,
  nomeOriginal: string
): Promise<AudioResponse> {

  const response = await fetch(`${API_URL}/api/audios/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      nomeOriginal,
    }),
  });


  const data = await response.json().catch(() => ({}));


  if (!response.ok) {
    throw new Error(data.error || "Erro ao renomear áudio.");
  }


  return data as AudioResponse;
}


export async function excluirAudio(id: string): Promise<void> {

  const response = await fetch(`${API_URL}/api/audios/${id}`, {
    method: "DELETE",
  });


  const data = await response.json().catch(() => ({}));


  if (!response.ok) {
    throw new Error(data.error || "Erro ao excluir áudio.");
  }
}