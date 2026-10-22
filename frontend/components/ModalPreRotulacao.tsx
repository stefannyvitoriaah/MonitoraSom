import React, { useState } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (rotulo: string) => void;
  nomeAudio: string;
}

export default function ModalPreRotulacao({ isOpen, onClose, onConfirm, nomeAudio }: ModalProps) {
  const [rotulo, setRotulo] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-96 text-black">
        <h2 className="text-xl font-bold mb-4">Pré-rotulação de Áudio</h2>
        <p className="mb-4 text-sm text-gray-600">
          Upload de <strong>{nomeAudio}</strong> concluído com sucesso. Confirme os dados iniciais.
        </p>
        
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Rótulo inicial:</label>
          <input 
            type="text" 
            value={rotulo}
            onChange={(e) => setRotulo(e.target.value)}
            className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
            placeholder="Ex: Entrevista 01" 
          />
        </div>

        <div className="flex justify-end gap-2">
          <button 
            onClick={onClose} 
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={() => onConfirm(rotulo)} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}