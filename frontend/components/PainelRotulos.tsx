"use client";

import type { RotuloRegistro } from "@/services/rotuloService";
import styles from "./rotulacao.module.css";

interface PainelRotulosProps {
  rotulos: RotuloRegistro[] | null;
  erro: string | null;
  idExcluindo: string | null;
  onRemover: (rotulo: RotuloRegistro) => void;
}

export default function PainelRotulos({
  rotulos,
  erro,
  idExcluindo,
  onRemover,
}: PainelRotulosProps) {
  const carregando = rotulos === null && !erro;
  const total = rotulos?.length ?? 0;

  return (
    <div className={styles.rotulos}>
      <div className={styles.rotulosTitulo}>
        Rótulos do arquivo
        <span className={styles.contagem}>({total})</span>
      </div>

      {carregando && <span className={styles.vazio}>Carregando...</span>}
      {rotulos && rotulos.length === 0 && !erro && (
        <span className={styles.vazio}>
          Nenhum rótulo ainda. Preencha o formulário e clique em Adicionar rótulo.
        </span>
      )}
      {erro && (
        <span role="alert" className={styles.vazio} style={{ color: "#b91c1c" }}>
          {erro}
        </span>
      )}

      {rotulos && rotulos.length > 0 && (
        <ul className={styles.chips}>
          {rotulos.map((rotulo) => (
            <li key={rotulo.id} className={styles.chip}>
              <span>{rotulo.texto}</span>
              <button
                type="button"
                title="Excluir rótulo"
                aria-label={`Excluir rótulo ${rotulo.texto}`}
                disabled={idExcluindo === rotulo.id}
                onClick={() => onRemover(rotulo)}
                className={styles.chipBtn}
              >
                <svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
