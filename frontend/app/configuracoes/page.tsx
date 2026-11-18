'use client';

import { useState } from 'react';
import { useSoundSettings } from '../hooks/useSoundSettings';

const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2];

export default function ConfiguracoesPage() {
  const { settings, isLoaded, updateSettings, resetSettings } = useSoundSettings();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const showFeedback = (message: string) => {
    setStatusMessage(message);
    window.setTimeout(() => {
      setStatusMessage((current) => (current === message ? null : current));
    }, 2500);
  };

  const handleUpdate = (partial: Partial<typeof settings>) => {
    updateSettings(partial);
    showFeedback('Preferências salvas automaticamente no navegador.');
  };

  const handleReset = () => {
    resetSettings();
    showFeedback('Preferências restauradas para o padrão.');
  };

  if (!isLoaded) {
    return (
      <div className="p-8 max-w-2xl text-zinc-100">
        <h1 className="text-2xl font-bold mb-2">Configurações de Som</h1>
        <p className="text-sm text-zinc-400">Carregando preferências salvas...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl space-y-6 text-zinc-100">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Configurações de Som</h1>
          <p className="text-sm text-zinc-400">
            Suas preferências ficam salvas neste navegador e são mantidas ao fechar o site.
          </p>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="px-4 py-2 text-sm font-medium rounded-md border border-zinc-700 bg-zinc-900 text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
        >
          Restaurar padrões
        </button>
      </div>

      {statusMessage && (
        <div
          role="status"
          className="px-4 py-2 text-sm rounded-md bg-green-950/60 text-green-300 border border-green-800"
        >
          {statusMessage}
        </div>
      )}

      <div className="space-y-6 rounded-lg border border-zinc-800 bg-zinc-900/60 p-6">
        {/* Volume padrão */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="volume-slider" className="font-medium text-zinc-100">
              Volume padrão
            </label>
            <span className="text-sm font-mono text-zinc-300">
              {settings.muted ? 'Silenciado (0%)' : `${settings.volume}%`}
            </span>
          </div>
          <input
            id="volume-slider"
            type="range"
            min={0}
            max={100}
            value={settings.volume}
            disabled={settings.muted}
            onChange={(e) => handleUpdate({ volume: Number(e.target.value) })}
            className="w-full accent-blue-500 disabled:opacity-40 cursor-pointer"
          />
        </div>

        {/* Velocidade de reprodução */}
        <div className="space-y-2">
          <label htmlFor="playback-rate" className="block font-medium text-zinc-100">
            Velocidade de reprodução padrão
          </label>
          <select
            id="playback-rate"
            value={settings.playbackRate}
            onChange={(e) => handleUpdate({ playbackRate: Number(e.target.value) })}
            className="w-full sm:w-48 rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            {PLAYBACK_RATES.map((rate) => (
              <option
                key={rate}
                value={rate}
                className="bg-zinc-900 text-zinc-100"
              >
                {rate}x {rate === 1 ? '(Normal)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Toggles booleanos */}
        <div className="space-y-4 pt-4 border-t border-zinc-800">
          <label className="flex items-center justify-between gap-4 cursor-pointer">
            <div>
              <span className="block font-medium text-zinc-100">Iniciar silenciado</span>
              <span className="text-xs text-zinc-400">
                Mantém o player no mudo ao abrir um novo áudio.
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.muted}
              onChange={(e) => handleUpdate({ muted: e.target.checked })}
              className="h-4 w-4 accent-blue-500 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between gap-4 cursor-pointer">
            <div>
              <span className="block font-medium text-zinc-100">Reprodução automática</span>
              <span className="text-xs text-zinc-400">
                Inicia o áudio automaticamente ao selecionar um arquivo para rotulação.
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.autoPlay}
              onChange={(e) => handleUpdate({ autoPlay: e.target.checked })}
              className="h-4 w-4 accent-blue-500 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between gap-4 cursor-pointer">
            <div>
              <span className="block font-medium text-zinc-100">Repetição contínua (Loop)</span>
              <span className="text-xs text-zinc-400">
                Reinicia o áudio automaticamente ao chegar no final.
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.loop}
              onChange={(e) => handleUpdate({ loop: e.target.checked })}
              className="h-4 w-4 accent-blue-500 cursor-pointer"
            />
          </label>
        </div>
      </div>
    </div>
  );
}