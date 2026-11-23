"use client";

interface AcoesTabelaProps{
  onEditar: () => void;
  onExcluir: () => void;
  onCopiar: () => void;
  disabled?: boolean;
  compacto?: boolean;}

const BASE =
  "inline-flex items-center justify-center rounded-lg border border-[#E2E8F0] bg-white transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-1 disabled:opacity-40 disabled:cursor-not-allowed";

export default function AcoesTabela({
  onEditar,
  onExcluir,
  onCopiar,
  disabled = false,
  compacto = false,
}: AcoesTabelaProps){
  const tamanho = compacto ? "w-6 h-6" : "w-8 h-8";
  const icone = compacto ? "w-3.5 h-3.5" : "w-4 h-4";

  return(
    <div className={`flex items-center shrink-0 ${compacto ? "gap-1" : "gap-1.5"}`}>
      <button
        type="button"
        title="Editar"
        aria-label="Editar"
        onClick={onEditar}
        disabled={disabled}
        className={`${BASE} ${tamanho} text-[#4F46E5] hover:bg-indigo-50`}
      >
        <svg className={icone} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      </button>

      <button
        type="button"
        title="Copiar registro"
        aria-label="Copiar registro"
        onClick={onCopiar}
        disabled={disabled}
        className={`${BASE} ${tamanho} text-[#64748B] hover:bg-slate-50`}
      >
        <svg className={icone} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      </button>

      <button
        type="button"
        title="Excluir"
        aria-label="Excluir"
        onClick={onExcluir}
        disabled={disabled}
        className={`${BASE} ${tamanho} text-red-500 hover:bg-red-50`}
      >
        <svg className={icone} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button>
    </div>
  );
}