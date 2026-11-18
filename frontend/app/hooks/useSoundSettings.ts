"use client";

import { useState, useEffect, useCallback } from "react";

export interface SoundSettings {
  // Player de áudio
  volume: number;              // 0 a 100
  muted: boolean;              // iniciar silenciado
  playbackRate: number;        // 0.5 a 2.0
  autoPlay: boolean;           // reproduzir automaticamente ao abrir áudio
  loop: boolean;               // repetir áudio em loop

  // Sons do sistema
  systemSounds: boolean;       // ativar/desativar sons da interface
  systemVolume: number;        // 0 a 100
  uploadSuccessSound: boolean; // alerta sonoro ao concluir upload
  errorAlertSound: boolean;    // alerta sonoro em erros

  // Preferências do usuário
  keyboardShortcuts: boolean;  // atalhos de teclado no player/rotulação
  confirmBeforeDelete: boolean;// pedir confirmação antes de excluir áudios
}

export const SOUND_SETTINGS_STORAGE_KEY = "monitorasom:sound-settings";

export const DEFAULT_SOUND_SETTINGS: SoundSettings = {
  volume: 80,
  muted: false,
  playbackRate: 1,
  autoPlay: false,
  loop: false,

  systemSounds: true,
  systemVolume: 70,
  uploadSuccessSound: true,
  errorAlertSound: true,

  keyboardShortcuts: true,
  confirmBeforeDelete: true,
};

function loadSettingsFromStorage(): SoundSettings {
  if (typeof window === "undefined") return DEFAULT_SOUND_SETTINGS;

  try {
    const raw = window.localStorage.getItem(SOUND_SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_SOUND_SETTINGS;

    const parsed = JSON.parse(raw) as Partial<SoundSettings>;

    return {
      volume:
        typeof parsed.volume === "number" && parsed.volume >= 0 && parsed.volume <= 100
          ? parsed.volume
          : DEFAULT_SOUND_SETTINGS.volume,
      muted:
        typeof parsed.muted === "boolean"
          ? parsed.muted
          : DEFAULT_SOUND_SETTINGS.muted,
      playbackRate:
        typeof parsed.playbackRate === "number" &&
        parsed.playbackRate >= 0.5 &&
        parsed.playbackRate <= 2
          ? parsed.playbackRate
          : DEFAULT_SOUND_SETTINGS.playbackRate,
      autoPlay:
        typeof parsed.autoPlay === "boolean"
          ? parsed.autoPlay
          : DEFAULT_SOUND_SETTINGS.autoPlay,
      loop:
        typeof parsed.loop === "boolean"
          ? parsed.loop
          : DEFAULT_SOUND_SETTINGS.loop,
      systemSounds:
        typeof parsed.systemSounds === "boolean"
          ? parsed.systemSounds
          : DEFAULT_SOUND_SETTINGS.systemSounds,
      systemVolume:
        typeof parsed.systemVolume === "number" &&
        parsed.systemVolume >= 0 &&
        parsed.systemVolume <= 100
          ? parsed.systemVolume
          : DEFAULT_SOUND_SETTINGS.systemVolume,
      uploadSuccessSound:
        typeof parsed.uploadSuccessSound === "boolean"
          ? parsed.uploadSuccessSound
          : DEFAULT_SOUND_SETTINGS.uploadSuccessSound,
      errorAlertSound:
        typeof parsed.errorAlertSound === "boolean"
          ? parsed.errorAlertSound
          : DEFAULT_SOUND_SETTINGS.errorAlertSound,
      keyboardShortcuts:
        typeof parsed.keyboardShortcuts === "boolean"
          ? parsed.keyboardShortcuts
          : DEFAULT_SOUND_SETTINGS.keyboardShortcuts,
      confirmBeforeDelete:
        typeof parsed.confirmBeforeDelete === "boolean"
          ? parsed.confirmBeforeDelete
          : DEFAULT_SOUND_SETTINGS.confirmBeforeDelete,
    };
  } catch (error) {
    console.warn("Erro ao ler preferências de som no localStorage:", error);
    return DEFAULT_SOUND_SETTINGS;
  }
}

export function useSoundSettings() {
  const [settings, setSettings] = useState<SoundSettings>(DEFAULT_SOUND_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setSettings(loadSettingsFromStorage());
    setIsLoaded(true);

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === SOUND_SETTINGS_STORAGE_KEY) {
        setSettings(loadSettingsFromStorage());
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const updateSettings = useCallback((partial: Partial<SoundSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...partial };
      try {
        window.localStorage.setItem(
          SOUND_SETTINGS_STORAGE_KEY,
          JSON.stringify(updated)
        );
      } catch (error) {
        console.error("Erro ao salvar preferências de som no localStorage:", error);
      }
      return updated;
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SOUND_SETTINGS);
    try {
      window.localStorage.setItem(
        SOUND_SETTINGS_STORAGE_KEY,
        JSON.stringify(DEFAULT_SOUND_SETTINGS)
      );
    } catch (error) {
      console.error("Erro ao restaurar preferências de som:", error);
    }
  }, []);

  return {
    settings,
    isLoaded,
    updateSettings,
    resetSettings,
  };
}