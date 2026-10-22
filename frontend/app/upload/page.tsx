'use client';

import { useState } from 'react';
import ModalPreRotulacao from '@/components/ModalPreRotulacao';

export default function UploadPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nomeArquivoAProcessar, setNomeArquivoAProcessar] = useState('');

  // Função que simula o fim do upload e aciona o modal
  const simularUpload = () => {
    setNomeArquivoAProcessar('gravacao_reuniao_01.mp4');
    setIsModalOpen(true);
  };

  const handleConfirmar = (rotulo: string) => {
    console.log(`Rótulo confirmado: ${rotulo}`);
    setIsModalOpen(false);
    // Aqui entrará a lógica para enviar os dados para a tabela de áudios (Issue #18)
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4 text-white">Upload de Áudio</h1>
      
      {/* Botão temporário para simular o término do upload com sucesso */}
      <button 
        onClick={simularUpload}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Simular Upload Concluído
      </button>

      <ModalPreRotulacao 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmar}
        nomeAudio={nomeArquivoAProcessar}
      />
    </div>
  );
}