"use client";

import { useCallback, useEffect, useState } from "react";
import AcoesTabela from "@/components/acoestabela";
import {
  excluirAudio,
  editarAudio,
  listarAudios,
} from "@/services/audioActionsService";

interface ItemData {
  id: string;
  name: string;
  current: number;
  total: number;}

interface UploadsSidebarProps{
  folders?: ItemData[];
  files?: ItemData[];
  onSelectFolder?: (folder: ItemData) => void;
  onSelectFile?: (file: ItemData) => void;
  onFileDeleted?: (file: ItemData) => void;
  selectedFileId?: string | null;
  folderProgressColor?: string;
  fileColors?: {
    background?: string;
    hover?: string;
    border?: string;
    icon?: string;
    iconBackground?: string;};
}
export default function UploadsSidebar({
  folders = [],
  files,
  onSelectFolder,
  onSelectFile,
  onFileDeleted,
  selectedFileId = null,
  folderProgressColor = "#4F46E5",
  fileColors = {
    background: "bg-indigo-50/50",
    hover: "hover:bg-indigo-50",
    border: "border-indigo-100/60",
    icon: "text-indigo-600",
    iconBackground: "bg-indigo-100",},
}:
  UploadsSidebarProps){
  const [arquivos, setArquivos] = useState<ItemData[]>(files ?? []);
  const [carregando, setCarregando] = useState(files === undefined);
  const [idEmAcao, setIdEmAcao] = useState<string | null>(null);
  const [erroAcao, setErroAcao] = useState<string | null>(null);

  const carregarArquivos = useCallback(async () => {
    try {
      const audios = await listarAudios();
      setArquivos(
        audios.map((audio) =>({
          id: audio.id,
          name: audio.nomeOriginal,
          current: 1,
          total: 1,
        }))
      );
      setErroAcao(null);
    } catch (error) {
      setErroAcao(
        error instanceof Error ? error.message : "Erro ao carregar os áudios."
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    if (files !== undefined) return;
    void carregarArquivos();

    const handleAtualizar = () => void carregarArquivos();
    window.addEventListener("audios:atualizados", handleAtualizar);
    return () =>
      window.removeEventListener("audios:atualizados", handleAtualizar);
  }, [files, carregarArquivos]);

const handleExcluirArquivo = async (file: ItemData) => {
  const confirmar = window.confirm(
    `Tem certeza que deseja excluir o áudio "${file.name}"?`
  );

  if (!confirmar) {
    return;
  }

  setErroAcao(null);
  setIdEmAcao(file.id);

  try {
    await excluirAudio(file.id);
    setArquivos((atuais) => atuais.filter((a) => a.id !== file.id));
    onFileDeleted?.(file);
    window.dispatchEvent(new Event("audios:atualizados"));
  } catch (error) {
    setErroAcao(error instanceof Error ? error.message : "Erro ao excluir.");
  } finally {
    setIdEmAcao(null);
  }
};

  const handleEditarArquivo = async (file: ItemData) => {
    const novoNome = window.prompt("Novo nome:", file.name)?.trim();
    if (!novoNome || novoNome === file.name) return;

    setErroAcao(null);
    setIdEmAcao(file.id);
    try {
      const audio = await editarAudio(file.id, novoNome);
      setArquivos((atuais) =>
        atuais.map((a) =>
          a.id === file.id ? { ...a, name: audio.nomeOriginal } : a
        )
      );
    } catch (error) {
      setErroAcao(error instanceof Error ? error.message : "Erro ao editar.");
    } finally {
      setIdEmAcao(null);
    }
  };

  const handleCopiarArquivo = (file: ItemData) =>{
    console.log("copiar", file.id);
  };

  return (
    <div className="flex flex-col gap-2.5 w-full max-w-xs h-full">

      <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex flex-col max-h-[48%]">
        <div className="mb-3 flex-shrink-0">
          <h3 className="text-sm font-semibold text-gray-900">
            Pastas carregadas
          </h3>
          <p className="text-xs text-gray-400">
            Continue de onde parou.
          </p>
        </div>

        <div className="overflow-y-auto space-y-2 pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-300">
          {folders.length === 0 && (
            <p className="text-xs text-gray-400">Nenhuma pasta enviada ainda.</p>
          )}
          {folders.map((folder) => {
            const progressPercent =
              folder.total > 0
                ? (folder.current / folder.total) * 100 : 0;
            return (
              <div
                key={folder.id}
                onClick={() => onSelectFolder?.(folder)}
                className="bg-purple-50/50 hover:bg-purple-50 border border-purple-100/60 rounded-xl p-3 cursor-pointer transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-indigo-600 bg-indigo-100 p-1.5 rounded-lg flex-shrink-0">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20">
                      <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                    </svg>
                  </div>

                  <span className="text-xs font-medium text-gray-800 truncate">
                    {folder.name}
                  </span>
                </div>

                <div className="text-[11px] text-gray-500 mb-1.5">
                  Parou em {folder.current} de {folder.total}
                </div>

                <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(progressPercent, 100)}%`,
                      backgroundColor: folderProgressColor,}}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex flex-col max-h-[48%]">
        <div className="mb-3 flex-shrink-0">
          <h3 className="text-sm font-semibold text-gray-900">
            Arquivos carregados
          </h3>
          <p className="text-xs text-gray-400">
            Áudios enviados individualmente.
          </p>
        </div>

        <div className="overflow-y-auto space-y-2 pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-300">
          {carregando && (
            <p className="text-xs text-gray-400">Carregando...</p>
          )}
          {!carregando && arquivos.length === 0 && (
            <p className="text-xs text-gray-400">Nenhum áudio enviado ainda.</p>
          )}
          {arquivos.map((file) => (
            <div key={file.id}
              onClick={() => onSelectFile?.(file)}
              className={`${fileColors.background ?? "bg-gray-50"} ${fileColors.hover ?? "hover:bg-gray-100/80"} border ${fileColors.border ?? "border-gray-200/60"} rounded-xl p-3 cursor-pointer transition-colors flex items-center gap-2 ${
                selectedFileId === file.id ? "ring-2 ring-indigo-400" : ""
              }`}>
              <div
                className={`${fileColors.icon ?? "text-indigo-600"} ${fileColors.iconBackground ?? "bg-indigo-50"} p-1.5 rounded-lg flex-shrink-0`}>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
                </svg>
              </div>
              <span className="text-xs font-medium text-gray-800 truncate flex-1 min-w-0">
                {file.name}
              </span>
              <div onClick={(e) => e.stopPropagation()}>
                <AcoesTabela
                  compacto
                  disabled={idEmAcao === file.id}
                  onEditar={() => void handleEditarArquivo(file)}
                  onExcluir={() => void handleExcluirArquivo(file)}
                  onCopiar={() => handleCopiarArquivo(file)}
                />
              </div>
            </div>
          ))}
        </div>

        {erroAcao && (
          <div
            role="alert"
            className="mt-2 px-3 py-2 text-xs rounded-lg bg-red-50 text-red-700 border border-red-200"
          >
            {erroAcao}
          </div>
        )}
      </div>
    </div>
  );
}