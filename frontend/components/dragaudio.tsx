"use client";

import { useRef, useState } from "react";
import { uploadAudio, AudioRecord } from "@/services/audioService";

interface AudioDropzoneProps {
  onDropFiles?: (files: FileList) => void;
  onUploadSuccess?: (audios: AudioRecord[]) => void;
}

export default function AudioDropzone({
  onDropFiles,
  onUploadSuccess,
}: AudioDropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const processFiles = async (files: FileList) => {
    if (!files || files.length === 0 || isUploading) return;

    onDropFiles?.(files);
    setIsUploading(true);
    setErrorMessage(null);
    setStatusMessage(`Enviando ${files.length} arquivo(s)...`);

    const uploadedAudios: AudioRecord[] = [];
    const failedFiles: string[] = [];

    for (const file of Array.from(files)) {
      try {
        const result = await uploadAudio(file);
        uploadedAudios.push(result.audio);
      } catch (error) {
        console.error(`Erro ao enviar ${file.name}:`, error);
        failedFiles.push(file.name);
      }
    }

    setIsUploading(false);

    if (uploadedAudios.length > 0) {
      onUploadSuccess?.(uploadedAudios);
      setStatusMessage(
        `${uploadedAudios.length} arquivo(s) enviado(s) e salvo(s) com sucesso!`
      );
    } else {
      setStatusMessage(null);
    }

    if (failedFiles.length > 0) {
      setErrorMessage(
        `Falha ao enviar: ${failedFiles.join(", ")}. Verifique se o backend está rodando.`
      );
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isUploading) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      void processFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      void processFiles(e.target.files);
      e.target.value = "";
    }
  };

  return (
    <div className="w-full space-y-3">
      <div
        onClick={() => !isUploading && fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`rounded-xl p-5 border-2 border-dashed shadow-sm w-full h-87.5 flex flex-col items-center justify-center transition-all ${
          isUploading
            ? "border-indigo-400 bg-indigo-50/40 text-indigo-600 cursor-wait"
            : isDragging
              ? "border-indigo-500 bg-indigo-50/50 text-indigo-700 scale-[1.01] cursor-pointer"
              : "border-gray-200 bg-white text-gray-400 hover:border-gray-300 cursor-pointer"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="audio/*,video/*"
          onChange={handleFileInputChange}
          className="hidden"
        />

        <svg
          className="w-10 h-10 mb-2 opacity-50"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>

        <span className="text-sm font-medium">
          {isUploading
            ? "Enviando arquivo para o servidor..."
            : "Arraste arquivo ou clique para selecionar"}
        </span>
        <span className="text-xs text-gray-400 mt-1">Espectrograma</span>
      </div>

      {statusMessage && (
        <div
          role="status"
          className="px-4 py-2 text-sm rounded-lg bg-green-50 text-green-700 border border-green-200"
        >
          {statusMessage}
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          className="px-4 py-2 text-sm rounded-lg bg-red-50 text-red-700 border border-red-200"
        >
          {errorMessage}
        </div>
      )}
    </div>
  );
}