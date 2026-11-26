"use client";

import { useRef, useState } from "react";
import { uploadAudio, AudioRecord } from "@/services/audioService";
import { useSoundSystem } from "@/contexts/SoundContext";
import { GlassButton } from "@/components/expo-glass-effect";

interface AddAudioButtonProps {
  onUploadSuccess?: (audios: AudioRecord[]) => void;
}

export default function AddAudioButton({ onUploadSuccess }: AddAudioButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { playSound } = useSoundSystem();
  const [isUploading, setIsUploading] = useState(false);

  const handleClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleFilesSelected = async (files: FileList) => {
    setIsUploading(true);
    const uploadedAudios: AudioRecord[] = [];

    try {
      for (const file of Array.from(files)) {
        const result = await uploadAudio(file);
        uploadedAudios.push(result.audio);
      }

      if (uploadedAudios.length > 0) {
        onUploadSuccess?.(uploadedAudios);
        void playSound("success");
      }
    } catch (error) {
      console.error("Erro ao enviar áudio pelo botão:", error);
      void playSound("error");
      alert("Erro ao enviar o arquivo. Verifique se o backend está online.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <GlassButton
        type="button"
        variant="primary"
        size="md"
        onClick={handleClick}
        disabled={isUploading}
        className="whitespace-nowrap"
      >
        {isUploading ? "Enviando..." : "+ Adicionar áudios"}
      </GlassButton>

      <input
        type="file"
        ref={fileInputRef}
        multiple
        accept="audio/*,video/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            void handleFilesSelected(e.target.files);
            e.target.value = "";
          }
        }}
      />
    </div>
  );
}