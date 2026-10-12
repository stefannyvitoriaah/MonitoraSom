"use client";

import { useState } from "react";
interface AudioDropzoneProps {
  onDropFiles?: (files: FileList) => void;}

export default function AudioDropzone({ onDropFiles }: AudioDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);};

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);};

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onDropFiles?.(files);
      console.log("Ficheiros largados:", files);}
  };

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`rounded-xl p-5 border-2 border-dashed shadow-sm w-full h-[350px] flex flex-col items-center justify-center transition-all cursor-pointer ${
        isDragging 
          ? "border-indigo-500 bg-indigo-50/50 text-indigo-700 scale-[1.01]" 
          : "border-gray-200 bg-white text-gray-400 hover:border-gray-300"
      }`}>
      <svg className="w-10 h-10 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
      <span className="text-sm font-medium">Arraste arquivo ou pasta para cá</span>
      <span className="text-xs text-gray-400 mt-1">Espectrograma</span>
    </div>
  );
}