"use client";

import { useState, useEffect, useCallback } from "react";

export interface SoundSettings {
  // Player de áudio
  volume: number;
  muted: boolean;
  playbackRate: number;
  autoPlay: boolean;
  loop: boolean;

  // Sons do sistema
  systemSounds: boolean;
  systemVolume: number;
  uploadSuccessSound: boolean;
  errorAlertSound: boolean;

  // Preferências do usuário
  keyboardShortcuts: boolean;
  confirmBeforeDelete: boolean;
}

export const SOUND_SETTINGS_STORAGE_KEY = "monitorasom:sound-settings";
const SOUND_SETTINGS_UPDATED_EVENT = "monitorasom:sound-settings-updated";

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

function saveSettingsToStorage(settings: SoundSettings) {
  try {
    window.localStorage.setItem(
      SOUND_SETTINGS_STORAGE_KEY,
      JSON.stringify(settings)
    );
    window.dispatchEvent(new Event(SOUND_SETTINGS_UPDATED_EVENT));
  } catch (error) {
    console.error("Erro ao salvar preferências de som no localStorage:", error);
  }
}

export function useSoundSettings() {
  const [settings, setSettings] = useState<SoundSettings>(DEFAULT_SOUND_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setSettings(loadSettingsFromStorage());
    setIsLoaded(true);

    const syncFromStorage = () => {
      setSettings(loadSettingsFromStorage());
    };

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === SOUND_SETTINGS_STORAGE_KEY) {
        syncFromStorage();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(SOUND_SETTINGS_UPDATED_EVENT, syncFromStorage);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(SOUND_SETTINGS_UPDATED_EVENT, syncFromStorage);
    };
  }, []);

  const updateSettings = useCallback((partial: Partial<SoundSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...partial };
      saveSettingsToStorage(updated);
      return updated;
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SOUND_SETTINGS);
    saveSettingsToStorage(DEFAULT_SOUND_SETTINGS);
  }, []);

  return {
    settings,
    isLoaded,
    updateSettings,
    resetSettings,
  };
}