const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

export interface AudioAtualizado {
  id: string;
  nomeOriginal: string;
  caminhoServidor: string;
  dataEnvio: string;
  pastaId?: string | null;
}

export async function excluirAudio(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/audios/${id}`, {
    method: "DELETE",
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Falha ao excluir o áudio.");
  }
}

export async function editarAudio(
  id: string,
  nomeOriginal: string
): Promise<AudioAtualizado> {
  const response = await fetch(`${API_URL}/api/audios/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nomeOriginal }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Falha ao atualizar o áudio.");
  }
  return data.audio as AudioAtualizado;
}

export async function listarAudios(): Promise<AudioAtualizado[]> {
  const response = await fetch(`${API_URL}/api/audios`);

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Falha ao carregar os áudios.");
  }
  if (Array.isArray(data)) {
    return data as AudioAtualizado[];
  }
  return (data.audios ?? []) as AudioAtualizado[];
}

export interface PastaRegistro {
  id: string;
  nome: string;
  dataEnvio: string;
  _count: { audios: number };
}

export async function criarPasta(nome: string): Promise<PastaRegistro> {
  const response = await fetch(`${API_URL}/api/pastas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Falha ao criar a pasta.");
  }
  return data.pasta as PastaRegistro;
}

export async function listarPastas(): Promise<PastaRegistro[]> {
  const response = await fetch(`${API_URL}/api/pastas`);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Falha ao carregar as pastas.");
  }
  return (data.pastas ?? []) as PastaRegistro[];
}

export async function enviarArquivoParaPasta(
  file: File,
  pastaId: string
): Promise<AudioAtualizado> {
  const formData = new FormData();
  formData.append("pastaId", pastaId);
  formData.append("file", file);

  const response = await fetch(`${API_URL}/api/audios`, {
    method: "POST",
    body: formData,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `Falha no envio do arquivo "${file.name}".`);
  }
  return data.audio as AudioAtualizado;
}

export async function editarPasta(
  id: string,
  nome: string
): Promise<PastaRegistro> {
  const response = await fetch(`${API_URL}/api/pastas/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Falha ao atualizar a pasta.");
  }
  return data.pasta as PastaRegistro;
}

export async function excluirPasta(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/pastas/${id}`, {
    method: "DELETE",
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Falha ao excluir a pasta.");
  }
}
