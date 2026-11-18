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

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

export async function uploadAudio(file: File): Promise<UploadAudioResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/api/audios`, {
    method: "POST",
    body: formData,
    // Não defina Content-Type manualmente: o navegador precisa gerar o boundary do multipart/form-data
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Falha no envio do arquivo "${file.name}".`);
  }

  return data as UploadAudioResponse;
}