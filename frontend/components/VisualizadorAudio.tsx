"use client";

import { useCallback, useRef, useState } from "react";
import AudioPlayer from "@/components/AudioPlayer";
import SpectrogramView from "@/components/SpectrogramView";
import styles from "./rotulacao.module.css";

interface VisualizadorAudioProps {
  audioUrl: string;
}

export default function VisualizadorAudio({ audioUrl }: VisualizadorAudioProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [tempo, setTempo] = useState(0);
  const [duracao, setDuracao] = useState(0);

  const buscar = useCallback((t: number) => {
    if (audioRef.current) audioRef.current.currentTime = t;
    setTempo(t);
  }, []);

  return (
    <div className={styles.visualizador}>
      <SpectrogramView
        audioUrl={audioUrl}
        tempoAtual={tempo}
        duracao={duracao}
        onBuscar={buscar}
      />
      <AudioPlayer
        audioRef={audioRef}
        src={audioUrl}
        onTempoChange={setTempo}
        onDuracaoChange={setDuracao}
      />
    </div>
  );
}
