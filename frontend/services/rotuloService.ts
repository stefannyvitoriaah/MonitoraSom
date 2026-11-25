import type { AudioAtualizado } from "@/services/audioActionsService";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

export interface RotuloRegistro {
  id: string;
  texto: string;
  audioId: string;
}

async function lerJson(response: Response) {
  return response.json().catch(() => ({}));
}

export function montarUrlAudio(caminhoServidor: string): string {
  return `${API_URL}/${caminhoServidor.replace(/^\/+/, "")}`;
}

export interface AudioComRotulos extends AudioAtualizado {
  rotulos: RotuloRegistro[];
}


// Buscar todos os áudios com seus rótulos
export async function listarAudiosComRotulos(): Promise<AudioComRotulos[]> {
  const response = await fetch(`${API_URL}/api/audios`);

  const data = await lerJson(response);

  if (!response.ok) {
    throw new Error(data.error || "Falha ao carregar os áudios.");
  }

  return data as AudioComRotulos[];
}


// Buscar rótulos de um áudio específico
export async function listarRotulos(
  audioId: string
): Promise<RotuloRegistro[]> {

  const response = await fetch(
    `${API_URL}/api/audios/${audioId}/rotulos`
  );

  const data = await lerJson(response);

  if (!response.ok) {
    throw new Error(data.error || "Falha ao carregar os rótulos.");
  }

  return data as RotuloRegistro[];
}


// Criar novo rótulo
export async function criarRotulo(
  audioId: string,
  texto: string
): Promise<RotuloRegistro> {

  const response = await fetch(
    `${API_URL}/api/audios/${audioId}/rotulos`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        texto,
      }),
    }
  );

  const data = await lerJson(response);

  if (!response.ok) {
    throw new Error(
      data.error || "Falha ao criar o rótulo."
    );
  }

  return data.rotulo as RotuloRegistro;
}


// Editar rótulo existente
export async function editarRotulo(
  id: string,
  texto: string
): Promise<RotuloRegistro> {

  const response = await fetch(
    `${API_URL}/api/rotulos/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        texto,
      }),
    }
  );

  const data = await lerJson(response);

  if (!response.ok) {
    throw new Error(
      data.error || "Falha ao editar o rótulo."
    );
  }

  return data.rotulo as RotuloRegistro;
}


// Excluir rótulo
export async function excluirRotulo(
  id: string
): Promise<void> {

  const response = await fetch(
    `${API_URL}/api/rotulos/${id}`,
    {
      method: "DELETE",
    }
  );

  const data = await lerJson(response);

  if (!response.ok) {
    throw new Error(
      data.error || "Falha ao excluir o rótulo."
    );
  }
}