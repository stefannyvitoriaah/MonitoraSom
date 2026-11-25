"use client";

import { useEffect, useState } from "react";
import { AudioRecord, listarAudios } from "@/services/audioService";


export default function HistoricoPage() {

  const [audios, setAudios] = useState<AudioRecord[]>([]);
  const [erro, setErro] = useState<string>("");


  async function carregarAudios() {
    try {

      const dados = await listarAudios();

      setAudios(dados);

    } catch (error) {

      console.error(error);

      setErro("Não foi possível carregar os áudios.");

    }
  }


  useEffect(() => {

    carregarAudios();

  }, []);


  return (
    <div className="p-8">

      <h1 className="text-2xl font-bold mb-4">
        Histórico de Áudios
      </h1>


      {erro && (
        <p className="text-red-500">
          {erro}
        </p>
      )}


      {audios.length === 0 ? (

        <p>
          Nenhum áudio encontrado.
        </p>

      ) : (

        <div className="space-y-3">

          {audios.map((audio) => (

            <div
              key={audio.id}
              className="border rounded p-4"
            >

              <p>
                <strong>Nome:</strong> {audio.nomeOriginal}
              </p>

              <p>
                <strong>Data:</strong>{" "}
                {new Date(audio.dataEnvio).toLocaleString()}
              </p>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}