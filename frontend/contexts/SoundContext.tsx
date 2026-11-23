"use client";

import { createContext, useContext, useCallback, ReactNode } from "react";
import {
  useSoundSettings,
  SoundSettings,
} from "@/app/hooks/useSoundSettings";
import {
  playSystemSound,
  SystemSoundEvent,
} from "@/services/systemSoundService";

interface SoundContextValue {
  settings: SoundSettings;
  isLoaded: boolean;
  updateSettings: (partial: Partial<SoundSettings>) => void;
  resetSettings: () => void;
  setGlobalSystemVolume: (volume: number) => void;
  toggleSystemSounds: () => void;
  playSound: (
    event: SystemSoundEvent,
    options?: { ignoreEventToggle?: boolean }
  ) => Promise<boolean>;
}

const SoundContext = createContext<SoundContextValue | null>(null);

export function SoundProvider({ children }: { children: ReactNode }) {
  const { settings, isLoaded, updateSettings, resetSettings } =
    useSoundSettings();

  const setGlobalSystemVolume = useCallback(
    (volume: number) => {
      const clamped = Math.min(100, Math.max(0, Math.round(volume)));
      updateSettings({ systemVolume: clamped });
    },
    [updateSettings]
  );

  const toggleSystemSounds = useCallback(() => {
    updateSettings({ systemSounds: !settings.systemSounds });
  }, [settings.systemSounds, updateSettings]);

  const playSound = useCallback(
    (event: SystemSoundEvent, options?: { ignoreEventToggle?: boolean }) => {
      return playSystemSound(event, {
        settingsOverride: settings,
        ignoreEventToggle: options?.ignoreEventToggle,
      });
    },
    [settings]
  );

  return (
    <SoundContext.Provider
      value={{
        settings,
        isLoaded,
        updateSettings,
        resetSettings,
        setGlobalSystemVolume,
        toggleSystemSounds,
        playSound,
      }}
    >
      {children}
    </SoundContext.Provider>
  );
}

export function useSoundSystem(): SoundContextValue {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error(
      "useSoundSystem deve ser usado dentro de um <SoundProvider>."
    );
  }
  return context;
}