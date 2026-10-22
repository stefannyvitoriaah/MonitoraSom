import React from 'react';

interface BarraProgressoProps {
  progresso: number; // Valor de 0 a 100
}

export default function BarraProgresso({ progresso }: BarraProgressoProps) {
  // Garante que o valor visual se mantém sempre entre os limites de 0 e 100
  const progressoLimitado = Math.min(Math.max(progresso, 0), 100);

  return (
    <div className="w-full mt-4">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
          A processar envio...
        </span>
        <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
          {Math.round(progressoLimitado)}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 overflow-hidden">
        <div 
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out" 
          style={{ width: `${progressoLimitado}%` }}
        ></div>
      </div>
    </div>
  );
}