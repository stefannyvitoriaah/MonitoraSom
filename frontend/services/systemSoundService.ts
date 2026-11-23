import {
  SoundSettings,
  SOUND_SETTINGS_STORAGE_KEY,
  DEFAULT_SOUND_SETTINGS,
} from "@/app/hooks/useSoundSettings";

export type SystemSoundEvent = "success" | "error" | "notification" | "click";

interface PlaySoundOptions {
  /** Sobrescreve as configurações salvas (útil para testes imediatos na tela de configurações) */
  settingsOverride?: Partial<SoundSettings>;
  /** Ignora o toggle individual do evento (mantendo o bloqueio de systemSounds e volume 0) */
  ignoreEventToggle?: boolean;
}

let sharedAudioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;

  const AudioCtx =
    window.AudioContext ||
    (window as Window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;

  if (!AudioCtx) return null;

  if (!sharedAudioContext || sharedAudioContext.state === "closed") {
    sharedAudioContext = new AudioCtx();
  }

  return sharedAudioContext;
}

function readStoredSettings(): SoundSettings {
  if (typeof window === "undefined") return DEFAULT_SOUND_SETTINGS;

  try {
    const raw = window.localStorage.getItem(SOUND_SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_SOUND_SETTINGS;
    return { ...DEFAULT_SOUND_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SOUND_SETTINGS;
  }
}

function scheduleTone(
  ctx: AudioContext,
  frequency: number,
  startOffset: number,
  duration: number,
  gainPeak: number,
  type: OscillatorType = "sine"
) {
  const startTime = ctx.currentTime + startOffset;
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startTime);

  // Envelope suave para evitar estalos (clicks) no áudio
  gainNode.gain.setValueAtTime(0.0001, startTime);
  gainNode.gain.linearRampToValueAtTime(gainPeak, startTime + 0.015);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.02);
}

/**
 * Reproduz um som de notificação/evento respeitando o volume global do sistema.
 * Retorna true se o som foi reproduzido, ou false se estava silenciado/bloqueado.
 */
export async function playSystemSound(
  event: SystemSoundEvent,
  options: PlaySoundOptions = {}
): Promise<boolean> {
  if (typeof window === "undefined") return false;

  const settings: SoundSettings = {
    ...readStoredSettings(),
    ...options.settingsOverride,
  };

  // Respeita o controle global de ativação e volume
  if (!settings.systemSounds || settings.systemVolume <= 0) {
    return false;
  }

  // Respeita os toggles individuais por categoria de evento
  if (!options.ignoreEventToggle) {
    if (event === "success" && !settings.uploadSuccessSound) return false;
    if (event === "error" && !settings.errorAlertSound) return false;
  }

  const ctx = getAudioContext();
  if (!ctx) return false;

  try {
    if (ctx.state === "suspended") {
      await ctx.resume();
    }

    // Normaliza 0–100 para ganho confortável (máximo 0.30 para não distorcer)
    const normalizedVolume = Math.min(100, Math.max(0, settings.systemVolume)) / 100;
    const peakGain = Math.max(0.005, normalizedVolume * 0.3);

    switch (event) {
      case "success":
        // Acorde ascendente suave (C5 -> E5 -> G5)
        scheduleTone(ctx, 523.25, 0, 0.14, peakGain, "sine");
        scheduleTone(ctx, 659.25, 0.08, 0.16, peakGain, "sine");
        scheduleTone(ctx, 783.99, 0.16, 0.22, peakGain * 0.9, "sine");
        break;

      case "error":
        // Dois tons graves descendentes de alerta
        scheduleTone(ctx, 260, 0, 0.14, peakGain * 0.9, "triangle");
        scheduleTone(ctx, 185, 0.13, 0.22, peakGain * 0.9, "triangle");
        break;

      case "notification":
        // Sino curto de notificação (D5 -> A5)
        scheduleTone(ctx, 587.33, 0, 0.12, peakGain, "sine");
        scheduleTone(ctx, 880, 0.09, 0.2, peakGain * 0.85, "sine");
        break;

      case "click":
        // Feedback sutil de interface
        scheduleTone(ctx, 520, 0, 0.045, peakGain * 0.45, "sine");
        break;
    }

    return true;
  } catch (error) {
    console.warn("Não foi possível reproduzir o som do sistema:", error);
    return false;
  }
}