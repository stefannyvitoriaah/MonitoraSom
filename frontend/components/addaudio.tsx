"use client";

import { useRef } from "react";
export default function AddAudioButton() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleClick = () => {
    fileInputRef.current?.click();};

  return (
    <div>
      <button
        onClick={handleClick}
        className="bg-[#4F46E5] hover:bg-[#4F46E5] text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2 text-sm whitespace-nowrap">
        + Adicionar áudios
      </button>

      <input
        type="file"
        ref={fileInputRef}
        multiple
        accept="audio/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            console.log("Arquivos selecionados:", e.target.files);}
        }}/>
    </div>);
}