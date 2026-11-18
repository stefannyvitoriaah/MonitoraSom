"use client";

import { useState } from "react";
import MainLayout from "@/components/mainlayout";
import { useSoundSettings, SoundSettings } from "../hooks/useSoundSettings";

const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2];

interface ToggleSwitchProps {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}

function ToggleSwitch({
  id,
  label,
  description,
  checked,
  disabled = false,
  onChange,
}: ToggleSwitchProps) {
  return (
    <div
      className={`flex items-center justify-between gap-4 py-3 ${
        disabled ? "opacity-50" : ""
      }`}
    >
      <div className="min-w-0">
        <label
          htmlFor={id}
          className={`block text-sm font-medium text-slate-800 ${
            disabled ? "cursor-not-allowed" : "cursor-pointer"
          }`}
        >
          {label}
        </label>
        <p className="text-xs text-[#64748B] mt-0.5">{description}</p>
      </div>

      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-2 ${
          checked ? "bg-[#4F46E5]" : "bg-slate-200"
        } ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

function playTestBeep(volumePercent: number) {
  if (typeof window === "undefined") return;

  try {
    const AudioCtx =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;

    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    oscillator.frequency.exponentialRampToValueAtTime(
      880,
      ctx.currentTime + 0.12
    ); // A5

    const normalizedGain = Math.max(0.01, (volumePercent / 100) * 0.25);
    gainNode.gain.setValueAtTime(normalizedGain, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.25);
    oscillator.onended = () => {
      void ctx.close();
    };
  } catch (error) {
    console.warn("Não foi possível reproduzir o som de teste:", error);
  }
}

export default function ConfiguracoesPage() {
  const { settings, isLoaded, updateSettings, resetSettings } =
    useSoundSettings();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const showFeedback = (message: string) => {
    setStatusMessage(message);
    window.setTimeout(() => {
      setStatusMessage((current) => (current === message ? null : current));
    }, 2500);
  };

  const handleUpdate = (partial: Partial<SoundSettings>) => {
    updateSettings(partial);
    showFeedback("Preferências salvas automaticamente.");
  };

  const handleReset = () => {
    resetSettings();
    showFeedback("Configurações restauradas para o padrão.");
  };

  const handleTestSystemSound = () => {
    if (!settings.systemSounds || settings.systemVolume === 0) {
      showFeedback("Ative os sons do sistema para ouvir o teste.");
      return;
    }
    playTestBeep(settings.systemVolume);
    showFeedback(`Som de teste reproduzido a ${settings.systemVolume}%.`);
  };

  return (
    <MainLayout title="Configurações Gerais">
      <div className="max-w-4xl mx-auto p-6 lg:p-8 space-y-6">
        {/* Cabeçalho da seção */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Configurações Gerais
            </h1>
            <p className="text-sm text-[#64748B] mt-1">
              Gerencie os sons do sistema, padrões de reprodução e preferências
              da sua conta neste navegador.
            </p>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-[#E2E8F0] bg-white text-slate-700 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer shrink-0"
          >
            <svg
              className="w-4 h-4 text-[#64748B]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Restaurar padrões
          </button>
        </div>

        {/* Feedback de salvamento */}
        {statusMessage && (
          <div
            role="status"
            className="flex items-center gap-2 px-4 py-2.5 text-sm rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200"
          >
            <svg
              className="w-4 h-4 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>{statusMessage}</span>
          </div>
        )}

        {!isLoaded ? (
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-8 text-sm text-[#64748B]">
            Carregando preferências salvas...
          </div>
        ) : (
          <div className="space-y-6">
            {/* Card 1: Sons do Sistema */}
            <section className="rounded-xl border border-[#E2E8F0] bg-white shadow-xs overflow-hidden">
              <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-cyan-800/10 text-[#06B6D4] flex items-center justify-center shrink-0">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">
                      Sons do Sistema
                    </h2>
                    <p className="text-xs text-[#64748B]">
                      Notificações e sinais sonoros para ações na plataforma.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleTestSystemSound}
                  disabled={!settings.systemSounds}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-indigo-200 bg-indigo-50 text-[#4F46E5] hover:bg-indigo-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0"
                >
                  Testar som
                </button>
              </div>

              <div className="px-6 py-4 divide-y divide-slate-100">
                <ToggleSwitch
                  id="system-sounds"
                  label="Ativar sons do sistema"
                  description="Permite que o MonitoraSom emita alertas sonoros sutis durante o uso."
                  checked={settings.systemSounds}
                  onChange={(checked) =>
                    handleUpdate({ systemSounds: checked })
                  }
                />

                <div
                  className={`py-4 space-y-2 ${
                    !settings.systemSounds ? "opacity-50" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="system-volume"
                      className="text-sm font-medium text-slate-800"
                    >
                      Volume dos alertas do sistema
                    </label>
                    <span className="text-xs font-mono font-semibold text-[#4F46E5] bg-indigo-50 px-2 py-0.5 rounded-md">
                      {settings.systemSounds
                        ? `${settings.systemVolume}%`
                        : "Desativado"}
                    </span>
                  </div>
                  <input
                    id="system-volume"
                    type="range"
                    min={0}
                    max={100}
                    value={settings.systemVolume}
                    disabled={!settings.systemSounds}
                    onChange={(e) =>
                      handleUpdate({ systemVolume: Number(e.target.value) })
                    }
                    className="w-full accent-[#4F46E5] cursor-pointer disabled:cursor-not-allowed"
                  />
                </div>

                <ToggleSwitch
                  id="upload-success-sound"
                  label="Som ao concluir upload"
                  description="Reproduz uma confirmação sonora quando o áudio for enviado e salvo."
                  checked={settings.uploadSuccessSound}
                  disabled={!settings.systemSounds}
                  onChange={(checked) =>
                    handleUpdate({ uploadSuccessSound: checked })
                  }
                />

                <ToggleSwitch
                  id="error-alert-sound"
                  label="Alerta sonoro em erros"
                  description="Emite um aviso sonoro caso ocorra falha no envio ou processamento."
                  checked={settings.errorAlertSound}
                  disabled={!settings.systemSounds}
                  onChange={(checked) =>
                    handleUpdate({ errorAlertSound: checked })
                  }
                />
              </div>
            </section>

            {/* Card 2: Controles do Player de Áudio */}
            <section className="rounded-xl border border-[#E2E8F0] bg-white shadow-xs overflow-hidden">
              <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 text-[#4F46E5] flex items-center justify-center shrink-0">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    Reprodução de Áudio
                  </h2>
                  <p className="text-xs text-[#64748B]">
                    Valores padrão aplicados ao abrir arquivos na tela de
                    rotulação.
                  </p>
                </div>
              </div>

              <div className="px-6 py-4 divide-y divide-slate-100">
                {/* Volume do Player */}
                <div className="py-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="player-volume"
                      className="text-sm font-medium text-slate-800"
                    >
                      Volume padrão do player
                    </label>
                    <span className="text-xs font-mono font-semibold text-[#4F46E5] bg-indigo-50 px-2 py-0.5 rounded-md">
                      {settings.muted ? "Silenciado (0%)" : `${settings.volume}%`}
                    </span>
                  </div>
                  <input
                    id="player-volume"
                    type="range"
                    min={0}
                    max={100}
                    value={settings.volume}
                    disabled={settings.muted}
                    onChange={(e) =>
                      handleUpdate({ volume: Number(e.target.value) })
                    }
                    className="w-full accent-[#4F46E5] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Velocidade de reprodução em botões */}
                <div className="py-4 space-y-2.5">
                  <div>
                    <span className="block text-sm font-medium text-slate-800">
                      Velocidade de reprodução padrão
                    </span>
                    <span className="text-xs text-[#64748B]">
                      Escolha a velocidade inicial para escuta dos espectrogramas.
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {PLAYBACK_RATES.map((rate) => {
                      const isSelected = settings.playbackRate === rate;
                      return (
                        <button
                          key={rate}
                          type="button"
                          onClick={() => handleUpdate({ playbackRate: rate })}
                          className={`px-3.5 py-1.5 text-sm font-medium rounded-lg border transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-[#4F46E5] text-white border-[#4F46E5] shadow-xs"
                              : "bg-white text-slate-700 border-[#E2E8F0] hover:bg-slate-50"
                          }`}
                        >
                          {rate}x {rate === 1 ? "(Normal)" : ""}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <ToggleSwitch
                  id="player-muted"
                  label="Iniciar silenciado"
                  description="Mantém o player no mudo ao carregar um novo arquivo de áudio."
                  checked={settings.muted}
                  onChange={(checked) => handleUpdate({ muted: checked })}
                />

                <ToggleSwitch
                  id="player-autoplay"
                  label="Reprodução automática"
                  description="Inicia o áudio automaticamente assim que um arquivo é selecionado."
                  checked={settings.autoPlay}
                  onChange={(checked) => handleUpdate({ autoPlay: checked })}
                />

                <ToggleSwitch
                  id="player-loop"
                  label="Repetição contínua (Loop)"
                  description="Reinicia o áudio automaticamente ao chegar no final."
                  checked={settings.loop}
                  onChange={(checked) => handleUpdate({ loop: checked })}
                />
              </div>
            </section>

            {/* Card 3: Preferências do Usuário */}
            <section className="rounded-xl border border-[#E2E8F0] bg-white shadow-xs overflow-hidden">
              <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-100 text-[#64748B] flex items-center justify-center shrink-0">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    Preferências do Usuário
                  </h2>
                  <p className="text-xs text-[#64748B]">
                    Comportamento geral da interface durante a análise e
                    rotulação.
                  </p>
                </div>
              </div>

              <div className="px-6 py-4 divide-y divide-slate-100">
                <ToggleSwitch
                  id="keyboard-shortcuts"
                  label="Atalhos de teclado na rotulação"
                  description="Permite usar a barra de espaço para reproduzir/pausar e setas para navegar no áudio."
                  checked={settings.keyboardShortcuts}
                  onChange={(checked) =>
                    handleUpdate({ keyboardShortcuts: checked })
                  }
                />

                <ToggleSwitch
                  id="confirm-delete"
                  label="Confirmar antes de excluir áudios"
                  description="Exibe um diálogo de confirmação antes de remover permanentemente um arquivo."
                  checked={settings.confirmBeforeDelete}
                  onChange={(checked) =>
                    handleUpdate({ confirmBeforeDelete: checked })
                  }
                />
              </div>
            </section>
          </div>
        )}
      </div>
    </MainLayout>
  );
}