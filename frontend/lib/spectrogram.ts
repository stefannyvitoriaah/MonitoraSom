/**
 * Análise de áudio feita inteiramente no navegador:
 * decodifica o arquivo (Web Audio API), calcula um espectrograma (STFT com
 * janela de Hann) e os picos da forma de onda.
 */

export interface AnaliseAudio {
  duracao: number;
  taxaAmostragem: number;
  /** Imagem do espectrograma (largura = quadros, altura = faixas de frequência). */
  espectrograma: HTMLCanvasElement;
  /** Pares [min, max] por coluna da forma de onda. */
  picos: Float32Array;
}

const FFT_SIZE = 1024;
const MAX_COLUNAS = 1400;
const FAIXA_DINAMICA_DB = 80;
const COLUNAS_ONDA = 2000;

// Paleta "inferno" simplificada (do escuro ao claro).
const PALETA: [number, number, number][] = [
  [0, 0, 4],
  [66, 10, 104],
  [147, 38, 103],
  [221, 81, 58],
  [252, 165, 10],
  [252, 255, 164],
];

function cor(t: number): [number, number, number] {
  const x = Math.min(1, Math.max(0, t)) * (PALETA.length - 1);
  const i = Math.min(PALETA.length - 2, Math.floor(x));
  const f = x - i;
  const a = PALETA[i];
  const b = PALETA[i + 1];
  return [
    a[0] + (b[0] - a[0]) * f,
    a[1] + (b[1] - a[1]) * f,
    a[2] + (b[2] - a[2]) * f,
  ];
}

function fft(re: Float32Array, im: Float32Array) {
  const n = re.length;

  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]];
    }
  }

  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len;
    const wRe = Math.cos(ang);
    const wIm = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let curRe = 1;
      let curIm = 0;
      for (let k = 0; k < len / 2; k++) {
        const uRe = re[i + k];
        const uIm = im[i + k];
        const vRe = re[i + k + len / 2] * curRe - im[i + k + len / 2] * curIm;
        const vIm = re[i + k + len / 2] * curIm + im[i + k + len / 2] * curRe;
        re[i + k] = uRe + vRe;
        im[i + k] = uIm + vIm;
        re[i + k + len / 2] = uRe - vRe;
        im[i + k + len / 2] = uIm - vIm;
        const nRe = curRe * wRe - curIm * wIm;
        curIm = curRe * wIm + curIm * wRe;
        curRe = nRe;
      }
    }
  }
}

function mixarParaMono(buffer: AudioBuffer): Float32Array {
  const canais = buffer.numberOfChannels;
  const mono = new Float32Array(buffer.length);
  for (let c = 0; c < canais; c++) {
    const dados = buffer.getChannelData(c);
    for (let i = 0; i < dados.length; i++) mono[i] += dados[i] / canais;
  }
  return mono;
}

function calcularPicos(amostras: Float32Array): Float32Array {
  const picos = new Float32Array(COLUNAS_ONDA * 2);
  const passo = Math.max(1, amostras.length / COLUNAS_ONDA);
  for (let c = 0; c < COLUNAS_ONDA; c++) {
    const ini = Math.floor(c * passo);
    const fim = Math.min(amostras.length, Math.floor((c + 1) * passo));
    let min = 0;
    let max = 0;
    for (let i = ini; i < fim; i++) {
      if (amostras[i] < min) min = amostras[i];
      if (amostras[i] > max) max = amostras[i];
    }
    picos[c * 2] = min;
    picos[c * 2 + 1] = max;
  }
  return picos;
}

function calcularEspectrograma(
  amostras: Float32Array
): HTMLCanvasElement {
  const bins = FFT_SIZE / 2;
  const hop = Math.max(
    256,
    Math.floor((amostras.length - FFT_SIZE) / (MAX_COLUNAS - 1))
  );
  const colunas = Math.max(
    1,
    Math.floor((Math.max(amostras.length, FFT_SIZE) - FFT_SIZE) / hop) + 1
  );

  const janela = new Float32Array(FFT_SIZE);
  for (let i = 0; i < FFT_SIZE; i++) {
    janela[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (FFT_SIZE - 1));
  }

  const db = new Float32Array(colunas * bins);
  const re = new Float32Array(FFT_SIZE);
  const im = new Float32Array(FFT_SIZE);
  let maxDb = -Infinity;

  for (let c = 0; c < colunas; c++) {
    const ini = c * hop;
    for (let i = 0; i < FFT_SIZE; i++) {
      re[i] = (amostras[ini + i] ?? 0) * janela[i];
      im[i] = 0;
    }
    fft(re, im);
    for (let b = 0; b < bins; b++) {
      const v = 20 * Math.log10(Math.hypot(re[b], im[b]) + 1e-10);
      db[c * bins + b] = v;
      if (v > maxDb) maxDb = v;
    }
  }

  const canvas = document.createElement("canvas");
  canvas.width = colunas;
  canvas.height = bins;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas indisponível.");
  const imagem = ctx.createImageData(colunas, bins);

  for (let c = 0; c < colunas; c++) {
    for (let b = 0; b < bins; b++) {
      const t = (db[c * bins + b] - (maxDb - FAIXA_DINAMICA_DB)) / FAIXA_DINAMICA_DB;
      const [r, g, bl] = cor(t);
      const y = bins - 1 - b; // frequências altas no topo
      const p = (y * colunas + c) * 4;
      imagem.data[p] = r;
      imagem.data[p + 1] = g;
      imagem.data[p + 2] = bl;
      imagem.data[p + 3] = 255;
    }
  }
  ctx.putImageData(imagem, 0, 0);
  return canvas;
}

export async function analisarAudio(
  url: string,
  signal?: AbortSignal
): Promise<AnaliseAudio> {
  const resposta = await fetch(url, { signal });
  if (!resposta.ok) throw new Error("Não foi possível baixar o áudio.");
  const bytes = await resposta.arrayBuffer();

  const Ctx =
    window.AudioContext ||
    (window as Window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctx) throw new Error("Web Audio API não suportada neste navegador.");

  const contexto = new Ctx();
  try {
    const buffer = await contexto.decodeAudioData(bytes);
    const mono = mixarParaMono(buffer);
    return {
      duracao: buffer.duration,
      taxaAmostragem: buffer.sampleRate,
      espectrograma: calcularEspectrograma(mono),
      picos: calcularPicos(mono),
    };
  } finally {
    void contexto.close();
  }
}
