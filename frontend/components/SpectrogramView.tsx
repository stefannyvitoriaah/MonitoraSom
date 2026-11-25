"use client";

import { useEffect, useRef, useState } from "react";
import { analisarAudio, AnaliseAudio } from "@/lib/spectrogram";
import styles from "./rotulacao.module.css";

interface SpectrogramViewProps {
  audioUrl: string;
  tempoAtual: number;
  duracao: number;
  onBuscar: (tempo: number) => void;
}

export default function SpectrogramView({
  audioUrl,
  tempoAtual,
  duracao,
  onBuscar,
}: SpectrogramViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [analise, setAnalise] = useState<AnaliseAudio | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [largura, setLargura] = useState(0);
  const [altura, setAltura] = useState(0);
  const [khzMax, setKhzMax] = useState<number>(10);

  useEffect(() => {
    const controle = new AbortController();
    analisarAudio(audioUrl, controle.signal)
      .then((res) => {
        setAnalise(res);
        const nyquistKhz = Math.round((res.taxaAmostragem / 2 / 1000) * 10) / 10;
        if (nyquistKhz > 0 && nyquistKhz < 10) {
          setKhzMax(nyquistKhz);
        }
      })
      .catch((e: unknown) => {
        if (controle.signal.aborted) return;
        setErro(
          e instanceof Error
            ? e.message
            : "Não foi possível gerar a visualização."
        );
      });
    return () => controle.abort();
  }, [audioUrl]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(() => {
      setLargura(el.clientWidth);
      setAltura(el.clientHeight);
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const duracaoTotal = duracao || analise?.duracao || 0;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !analise || largura === 0 || altura === 0) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(largura * dpr);
    canvas.height = Math.floor(altura * dpr);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.fillStyle = "#000004";
    ctx.fillRect(0, 0, largura, altura);

    ctx.imageSmoothingEnabled = true;
    const nyquistKhz = analise.taxaAmostragem / 2 / 1000;
    const fracaoAltura = Math.min(1, Math.max(0.05, khzMax / nyquistKhz));
    const srcH = Math.floor(analise.espectrograma.height * fracaoAltura);
    const srcY = analise.espectrograma.height - srcH;
    ctx.drawImage(
      analise.espectrograma,
      0,
      srcY,
      analise.espectrograma.width,
      srcH,
      0,
      0,
      largura,
      altura
    );

    ctx.font = "10px sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.strokeStyle = "rgba(0,0,0,0.6)";
    ctx.lineWidth = 3;

    for (let i = 0; i <= 4; i++) {
      const y = altura - (i / 4) * altura;
      const valorKhz = ((khzMax * i) / 4).toFixed(1);
      const texto = `${valorKhz} kHz`;
      const yTexto = i === 0 ? y - 4 : i === 4 ? y + 11 : y + 3;
      ctx.strokeText(texto, 6, yTexto);
      ctx.fillText(texto, 6, yTexto);
    }

    if (duracaoTotal > 0) {
      const passos = Math.max(2, Math.min(10, Math.floor(largura / 90)));
      for (let i = 1; i < passos; i++) {
        const t = (duracaoTotal * i) / passos;
        const x = (i / passos) * largura;
        const texto = `${Math.floor(t / 60)}:${Math.floor(t % 60)
          .toString()
          .padStart(2, "0")}`;
        ctx.strokeText(texto, x + 3, altura - 4);
        ctx.fillText(texto, x + 3, altura - 4);
      }
    }
  }, [analise, largura, altura, duracaoTotal, khzMax]);

  const aoClicar = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duracaoTotal) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const fracao = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    onBuscar(fracao * duracaoTotal);
  };

  const posicao = duracaoTotal > 0 ? Math.min(1, tempoAtual / duracaoTotal) : 0;
  const maxSlider = analise ? Math.max(1, Math.round((analise.taxaAmostragem / 2 / 1000) * 10) / 10) : 22;

  return (
    <div className={styles.espectroWrapper}>
      <div className={styles.painelKhz} title="Ajustar escala máxima de frequência (kHz)">
        <span className={styles.khzTitulo}>kHz</span>
        <div className={styles.khzSliderContainer}>
          <input
            type="range"
            aria-label="Escala máxima em kHz"
            min={1}
            max={maxSlider}
            step={0.5}
            value={Math.min(khzMax, maxSlider)}
            onChange={(e) => setKhzMax(Number(e.target.value))}
            className={styles.khzSlider}
          />
        </div>
        <div className={styles.khzBadge}>
          {Math.min(khzMax, maxSlider).toFixed(1)}
        </div>
      </div>

      <div
        ref={containerRef}
        className={styles.espectro}
        onClick={aoClicar}
        title="Clique para ir até este ponto"
      >
        <canvas ref={canvasRef} className={styles.canvas} />

        {!analise && !erro && (
          <div className={styles.estado}>Gerando visualização...</div>
        )}

        {erro && (
          <div role="alert" className={`${styles.estado} ${styles.estadoErro}`}>
            {erro} A reprodução continua disponível no player.
          </div>
        )}

        {analise && (
          <div className={styles.cursor} style={{ left: `${posicao * 100}%` }} />
        )}
      </div>
    </div>
  );
}
