"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import MainLayout from "@/components/mainlayout";
import UploadsSidebar from "@/components/loaded";
import AudioDropzone from "@/components/dragaudio";
import RotulacaoWorkspace from "@/components/RotulacaoWorkspace";

function HomeConteudo() {
  const searchParams = useSearchParams();
  const [audioSelecionadoId, setAudioSelecionadoId] = useState<string | null>(
    () => searchParams.get("audio")
  );

  return (
    <MainLayout>
      <div className="h-[calc(100vh-4rem)] p-6 overflow-hidden">
        <div
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start h-full"
          style={{ gridTemplateRows: "minmax(0, 1fr)" }}
        >
          <div className="hidden lg:flex lg:col-span-3 h-full flex-col">
            <UploadsSidebar
              selectedFileId={audioSelecionadoId}
              onSelectFile={(file) => setAudioSelecionadoId(file.id)}
              onFileDeleted={(file) =>
                setAudioSelecionadoId((atual) =>
                  atual === file.id ? null : atual
                )
              }
            />
          </div>
          <div className="col-span-1 lg:col-span-9 h-full overflow-y-auto pr-1">
            {audioSelecionadoId ? (
              <RotulacaoWorkspace
                audioId={audioSelecionadoId}
                onSelecionarAudio={setAudioSelecionadoId}
                onFechar={() => setAudioSelecionadoId(null)}
              />
            ) : (
              <AudioDropzone />
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeConteudo />
    </Suspense>
  );
}
