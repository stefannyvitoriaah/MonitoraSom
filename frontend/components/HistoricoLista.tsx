"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSoundSystem } from "@/contexts/SoundContext";
import { editarAudio, excluirAudio } from "@/services/audioActionsService";
import {
  listarAudiosComRotulos,
  type AudioComRotulos,
} from "@/services/rotuloService";

const MAX_ROTULOS_VISIVEIS = 3;

const BTN_ICONE =
  "inline-flex items-center justify-center w-8 h-8 rounded-lg border border-[#E2E8F0] bg-white transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-1 disabled:opacity-40 disabled:cursor-not-allowed";

const GRID_COLUNAS =
  "md:grid md:grid-cols-[minmax(0,2.2fr)_150px_minmax(0,2fr)_auto] md:items-center md:gap-4";

function formatarData(iso: string): string {
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return "—";
  const dia = data.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const hora = data.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${dia}, ${hora}`;
}

function IconeMusica({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
      />
    </svg>
  );
}

function IconeRelogio({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function ChipsRotulos({ rotulos }: { rotulos: AudioComRotulos["rotulos"] }) {
  if (rotulos.length === 0) {
    return <span className="text-[11px] text-gray-400">Sem rótulos</span>;
  }

  const visiveis = rotulos.slice(0, MAX_ROTULOS_VISIVEIS);
  const restantes = rotulos.length - visiveis.length;

  return (
    <ul className="flex flex-wrap items-center gap-1.5 m-0 p-0 list-none">
      {visiveis.map((rotulo) => (
        <li
          key={rotulo.id}
          title={rotulo.texto}
          className="max-w-full truncate px-2.5 py-0.5 text-[11px] font-medium text-slate-700 bg-slate-100 border border-slate-200 rounded-full"
        >
          {rotulo.texto}
        </li>
      ))}
      {restantes > 0 && (
        <li
          title={rotulos
            .slice(MAX_ROTULOS_VISIVEIS)
            .map((r) => r.texto)
            .join(", ")}
          className="px-2 py-0.5 text-[11px] font-semibold text-[#4F46E5] bg-white border border-indigo-100 rounded-full"
        >
          +{restantes}
        </li>
      )}
    </ul>
  );
}

interface HistoricoListaProps {
  onTotalChange?: (total: number) => void;
}

export default function HistoricoLista({ onTotalChange }: HistoricoListaProps) {
  const router = useRouter();
  const { playSound } = useSoundSystem();

  const [audios, setAudios] = useState<AudioComRotulos[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [idEditando, setIdEditando] = useState<string | null>(null);
  const [nomeEditado, setNomeEditado] = useState("");
  const [idEmAcao, setIdEmAcao] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let ativo = true;

    function carregar() {
      listarAudiosComRotulos()
        .then((dados) => {
          if (!ativo) return;
          const ordenados = dados
            .map((audio) => ({ ...audio, rotulos: audio.rotulos ?? [] }))
            .sort(
              (a, b) =>
                new Date(b.dataEnvio).getTime() -
                new Date(a.dataEnvio).getTime()
            );
          setAudios(ordenados);
          setErro(null);
        })
        .catch((error) => {
          if (!ativo) return;
          setErro(
            error instanceof Error
              ? error.message
              : "Erro ao carregar os áudios."
          );
        })
        .finally(() => {
          if (ativo) setCarregando(false);
        });
    }

    carregar();
    window.addEventListener("audios:atualizados", carregar);
    return () => {
      ativo = false;
      window.removeEventListener("audios:atualizados", carregar);
    };
  }, []);

  useEffect(() => {
    onTotalChange?.(audios.length);
  }, [audios.length, onTotalChange]);

  useEffect(() => {
    if (idEditando) inputRef.current?.select();
  }, [idEditando]);

  function iniciarEdicao(audio: AudioComRotulos) {
    setErro(null);
    setIdEditando(audio.id);
    setNomeEditado(audio.nomeOriginal);
  }

  function cancelarEdicao() {
    setIdEditando(null);
    setNomeEditado("");
  }

  async function confirmarEdicao(audio: AudioComRotulos) {
    const novoNome = nomeEditado.trim();
    if (!novoNome || novoNome === audio.nomeOriginal) {
      cancelarEdicao();
      return;
    }

    setErro(null);
    setIdEmAcao(audio.id);
    try {
      const atualizado = await editarAudio(audio.id, novoNome);
      setAudios((atuais) =>
        atuais.map((a) =>
          a.id === audio.id ? { ...a, nomeOriginal: atualizado.nomeOriginal } : a
        )
      );
      cancelarEdicao();
      window.dispatchEvent(new Event("audios:atualizados"));
      void playSound("success");
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao renomear.");
      void playSound("error");
    } finally {
      setIdEmAcao(null);
    }
  }

  async function excluir(audio: AudioComRotulos) {
    const confirmar = window.confirm(
      `Tem certeza que deseja excluir o áudio "${audio.nomeOriginal}"?`
    );
    if (!confirmar) return;

    setErro(null);
    setIdEmAcao(audio.id);
    try {
      await excluirAudio(audio.id);
      setAudios((atuais) => atuais.filter((a) => a.id !== audio.id));
      window.dispatchEvent(new Event("audios:atualizados"));
      void playSound("success");
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao excluir.");
      void playSound("error");
    } finally {
      setIdEmAcao(null);
    }
  }

  function abrirParaRotulacao(audio: AudioComRotulos) {
    router.push(`/?audio=${encodeURIComponent(audio.id)}`);
  }

  return (
    <section className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
      <header className="flex items-center gap-3 px-5 py-4">
        <div className="text-[#4F46E5] bg-indigo-50 p-2 rounded-lg shrink-0">
          <IconeRelogio />
        </div>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-gray-900">
            Áudios enviados
          </h2>
          <p className="text-xs text-gray-400">
            Ordenados do mais recente para o mais antigo.
          </p>
        </div>
      </header>

      {erro && (
        <div
          role="alert"
          className="mx-5 mb-4 px-3 py-2 text-xs rounded-lg bg-red-50 text-red-700 border border-red-200"
        >
          {erro}
        </div>
      )}

      <div
        className={`hidden border-y border-[#E2E8F0] bg-slate-50/60 px-5 py-2.5 text-[11px] font-bold tracking-wider text-gray-400 uppercase ${GRID_COLUNAS}`}
      >
        <span>Nome original</span>
        <span>Data de envio</span>
        <span>Rótulos</span>
        <span className="text-right">Ações</span>
      </div>

      {carregando && (
        <p className="px-5 py-8 text-sm text-center text-gray-400 border-t border-[#E2E8F0] md:border-t-0">
          Carregando...
        </p>
      )}

      {!carregando && audios.length === 0 && !erro && (
        <p className="px-5 py-8 text-sm text-center text-gray-400 border-t border-[#E2E8F0] md:border-t-0">
          Nenhum áudio enviado ainda. Use o botão &quot;Adicionar áudios&quot;
          para começar.
        </p>
      )}

      <ul className="m-0 p-0 list-none divide-y divide-[#E2E8F0] border-t border-[#E2E8F0] md:border-t-0">
        {audios.map((audio) => {
          const editando = idEditando === audio.id;
          const ocupado = idEmAcao === audio.id;

          return (
            <li
              key={audio.id}
              className={`flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-slate-50/50 ${GRID_COLUNAS}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="text-[#4F46E5] bg-indigo-50 p-2 rounded-lg shrink-0">
                  <IconeMusica />
                </div>

                {editando ? (
                  <input
                    ref={inputRef}
                    value={nomeEditado}
                    disabled={ocupado}
                    onChange={(e) => setNomeEditado(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void confirmarEdicao(audio);
                      if (e.key === "Escape") cancelarEdicao();
                    }}
                    aria-label="Novo nome do áudio"
                    className="w-full min-w-0 px-3 py-1.5 text-sm text-slate-800 bg-white border border-[#4F46E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30 disabled:opacity-60"
                  />
                ) : (
                  <span
                    title={audio.nomeOriginal}
                    className="text-sm font-medium text-slate-800 truncate"
                  >
                    {audio.nomeOriginal}
                  </span>
                )}
              </div>

              <div className="text-xs text-[#64748B]">
                <span className="md:hidden">Enviado em </span>
                {formatarData(audio.dataEnvio)}
              </div>

              <div className="min-w-0">
                <ChipsRotulos rotulos={audio.rotulos} />
              </div>

              <div className="flex items-center gap-1.5 md:justify-end">
                {editando ? (
                  <>
                    <button
                      type="button"
                      title="Salvar nome"
                      aria-label="Salvar nome"
                      disabled={ocupado}
                      onClick={() => void confirmarEdicao(audio)}
                      className={`${BTN_ICONE} text-emerald-600 hover:bg-emerald-50`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      title="Cancelar"
                      aria-label="Cancelar edição"
                      disabled={ocupado}
                      onClick={cancelarEdicao}
                      className={`${BTN_ICONE} text-[#64748B] hover:bg-slate-50`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      title="Abrir para rotulação"
                      disabled={ocupado}
                      onClick={() => abrirParaRotulacao(audio)}
                      className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-lg shadow-sm transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-1 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 7h.01M7 3h5a1.99 1.99 0 011.414.586l7 7a2 2 0 010 2.828l-5 5a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      Rotular
                    </button>
                    <button
                      type="button"
                      title="Renomear"
                      aria-label={`Renomear ${audio.nomeOriginal}`}
                      disabled={ocupado}
                      onClick={() => iniciarEdicao(audio)}
                      className={`${BTN_ICONE} text-[#4F46E5] hover:bg-indigo-50`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      title="Excluir"
                      aria-label={`Excluir ${audio.nomeOriginal}`}
                      disabled={ocupado}
                      onClick={() => void excluir(audio)}
                      className={`${BTN_ICONE} text-red-500 hover:bg-red-50`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
