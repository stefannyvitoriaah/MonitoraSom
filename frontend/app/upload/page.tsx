'use client';

import { useState, useEffect } from 'react';
import BarraProgresso from '@/components/BarraProgresso';

export default function UploadPage() {
  const [progresso, setProgresso] = useState(0);
  const [aFazerUpload, setAFazerUpload] = useState(false);

  // Simula o progresso do upload a aumentar com o tempo
  useEffect(() => {
    let intervalo: NodeJS.Timeout;
    if (aFazerUpload && progresso < 100) {
      intervalo = setInterval(() => {
        setProgresso((prev) => Math.min(prev + 10, 100)); // Aumenta 10% de cada vez
      }, 500);
    } else if (progresso >= 100) {
      setAFazerUpload(false);
      // Aqui entraria a chamada para abrir o Modal de Pré-rotulação (Issue #20)
    }
    return () => clearInterval(intervalo);
  }, [aFazerUpload, progresso]);

  const iniciarUploadMock = () => {
    setProgresso(0);
    setAFazerUpload(true);
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-white">Upload de Áudio</h1>
      
      <button 
        onClick={iniciarUploadMock}
        disabled={aFazerUpload}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-500 w-full"
      >
        {aFazerUpload ? 'A enviar...' : 'Testar Barra de Progresso'}
      </button>

      {/* A barra só aparece quando o upload inicia ou está concluído na tela */}
      {(aFazerUpload || progresso > 0) && (
        <BarraProgresso progresso={progresso} />
      )}
    </div>
  );
}