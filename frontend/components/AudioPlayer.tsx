"use client";

import { RefObject, useEffect, useRef, useState } from "react";
import { useSoundSystem } from "@/contexts/SoundContext";
import styles from "./rotulacao.module.css";

const VELOCIDADES = [0.5, 0.75, 1, 1.25, 1.5, 2];

interface AudioPlayerProps {
  audioRef: RefObject<HTMLAudioElement | null>;
  src: string;
  onTempoChange: (tempo: number) => void;
  onDuracaoChange: (duracao: number) => void;
}

function formatarTempo(segundos: number) {
  if (!Number.isFinite(segundos) || segundos < 0) return "0:00";
  const min = Math.floor(segundos / 60);
  const seg = Math.floor(segundos % 60);
  return `${min}:${seg.toString().padStart(2, "0")}`;
}

export default function AudioPlayer({
  audioRef,
  src,
  onTempoChange,
  onDuracaoChange,
}: AudioPlayerProps) {
  const { settings } = useSoundSystem();

  const [volume, setVolume] = useState(settings.volume);
  const [mudo, setMudo] = useState(settings.muted);
  const [velocidade, setVelocidade] = useState(settings.playbackRate);
  const [tocando, setTocando] = useState(false);
  const [tempo, setTempo] = useState(0);
  const [duracao, setDuracao] = useState(0);
  const [erro, setErro] = useState(false);
  const quadroRef = useRef<number | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume / 100;
    audio.muted = mudo;
    audio.playbackRate = velocidade;
    audio.loop = settings.loop;
  }, [audioRef, volume, mudo, velocidade, settings.loop]);

  useEffect(() => {
    if (!tocando) return;
    const atualizar = () => {
      const audio = audioRef.current;
      if (audio) {
        setTempo(audio.currentTime);
        onTempoChange(audio.currentTime);
      }
      quadroRef.current = requestAnimationFrame(atualizar);
    };
    quadroRef.current = requestAnimationFrame(atualizar);
    return () => {
      if (quadroRef.current !== null) cancelAnimationFrame(quadroRef.current);
    };
  }, [tocando, audioRef, onTempoChange]);

  const alternarReproducao = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      void audio.play().catch(() => setErro(true));
    } else {
      audio.pause();
    }
  };

  // play/pause
  useEffect(() => {
    if (!settings.keyboardShortcuts) return;
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      const alvo = e.target as HTMLElement | null;
      const tag = alvo?.tagName;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        tag === "BUTTON" ||
        alvo?.isContentEditable
      ) {
        return;
      }
      e.preventDefault();
      const audio = audioRef.current;
      if (!audio) return;
      if (audio.paused) {
        void audio.play().catch(() => setErro(true));
      } else {
        audio.pause();
      }
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [settings.keyboardShortcuts, audioRef]);

  const buscar = (valor: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = valor;
    setTempo(valor);
    onTempoChange(valor);
  };

  const volumeEfetivo = mudo ? 0 : volume;

  return (
    <div className={styles.player}>
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        autoPlay={settings.autoPlay}
        onPlay={() => setTocando(true)}
        onPause={() => setTocando(false)}
        onEnded={() => setTocando(false)}
        onError={() => setErro(true)}
        onLoadedMetadata={(e) => {
          const d = e.currentTarget.duration;
          if (Number.isFinite(d)) {
            setDuracao(d);
            onDuracaoChange(d);
          }
        }}
        onTimeUpdate={(e) => {
          setTempo(e.currentTarget.currentTime);
          onTempoChange(e.currentTarget.currentTime);
        }}
      />

      <div className={styles.playLinha}>
        <button
          type="button"
          onClick={alternarReproducao}
          aria-label={tocando ? "Pausar" : "Reproduzir"}
          title={tocando ? "Pausar" : "Reproduzir"}
          className={styles.playBtn}
        >
          {tocando ? (
            <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6 4h3v12H6zM11 4h3v12h-3z" />
            </svg>
          ) : (
            <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20" style={{ marginLeft: 2 }}>
              <path d="M6 4l10 6-10 6z" />
            </svg>
          )}
        </button>

        <span className={styles.tempo}>
          {formatarTempo(tempo)} / {formatarTempo(duracao)}
        </span>

        <input
          type="range"
          aria-label="Linha do tempo"
          min={0}
          max={duracao || 0}
          step={0.01}
          value={Math.min(tempo, duracao || 0)}
          disabled={!duracao}
          onChange={(e) => buscar(Number(e.target.value))}
          className={styles.range}
        />
      </div>

      <div className={styles.grupo}>
        <button
          type="button"
          onClick={() => setMudo((m) => !m)}
          aria-label={mudo ? "Ativar som" : "Silenciar"}
          title={mudo ? "Ativar som" : "Silenciar"}
          className={styles.iconBtn}
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5L6 9H3v6h3l5 4V5z" />
            {mudo || volumeEfetivo === 0 ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 9l4 6m0-6l-4 6" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15.5 8.5a5 5 0 010 7M18 6a8.5 8.5 0 010 12" />
            )}
          </svg>
        </button>
        <input
          type="range"
          aria-label="Volume"
          min={0}
          max={100}
          value={volumeEfetivo}
          onChange={(e) => {
            const v = Number(e.target.value);
            setVolume(v);
            setMudo(v === 0);
          }}
          className={styles.rangeVol}
        />
        <span className={styles.pct}>{volumeEfetivo}%</span>
      </div>

      <div className={styles.grupo}>
        <label htmlFor="velocidade-player" className={styles.legenda}>
          Velocidade
        </label>
        <select
          id="velocidade-player"
          value={velocidade}
          onChange={(e) => setVelocidade(Number(e.target.value))}
          className={styles.selectPequeno}
        >
          {VELOCIDADES.map((v) => (
            <option key={v} value={v}>
              {v}x{v === 1 ? " (Normal)" : ""}
            </option>
          ))}
        </select>
      </div>

      {erro && (
        <div role="alert" className={`${styles.erro} ${styles.larguraTotal}`}>
          Não foi possível reproduzir este arquivo.
        </div>
      )}
    </div>
  );
}
