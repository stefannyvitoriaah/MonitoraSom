"use client";

import { FormEvent, useId, useState } from "react";
import styles from "./rotulacao.module.css";

export type TipoVocalizacao = "chamado" | "canto";
export type CertezaIdentificacao = "incerta" | "certa";
export type CompletudeRotulacao = "incompleto" | "completo";

export interface DadosRotulo {
  texto: string;
  tipo: TipoVocalizacao;
  certeza: CertezaIdentificacao;
  completo: CompletudeRotulacao;
  comentario: string;
}

export interface OpcaoAudio {
  id: string;
  nome: string;
}

interface FormularioRotulacaoProps {
  audios: OpcaoAudio[];
  audioAtualId: string;
  anteriorId: string | null;
  proximoId: string | null;
  anteriorNaoRotuladoId: string | null;
  proximoNaoRotuladoId: string | null;
  onSelecionarAudio: (id: string) => void;
  onAdicionar: (dados: DadosRotulo) => Promise<void>;
}

type DestinoAuto = "proximo" | "proximoSemRotulo";

export default function FormularioRotulacao({
  audios,
  audioAtualId,
  anteriorId,
  proximoId,
  anteriorNaoRotuladoId,
  proximoNaoRotuladoId,
  onSelecionarAudio,
  onAdicionar,
}: FormularioRotulacaoProps) {
  const uid = useId();
  const idAudio = `${uid}-audio`;
  const idTexto = `${uid}-texto`;
  const idTipo = `${uid}-tipo`;
  const idCerteza = `${uid}-certeza`;
  const idCompleto = `${uid}-completo`;
  const idComentario = `${uid}-comentario`;

  const [texto, setTexto] = useState("");
  const [tipo, setTipo] = useState<TipoVocalizacao>("chamado");
  const [certeza, setCerteza] = useState<CertezaIdentificacao>("certa");
  const [completo, setCompleto] = useState<CompletudeRotulacao>("completo");
  const [comentario, setComentario] = useState("");
  const [avancarAuto, setAvancarAuto] = useState(false);
  const [destinoAuto, setDestinoAuto] = useState<DestinoAuto>("proximoSemRotulo");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Ao trocar de áudio (pelo formulário ou pela barra lateral), limpa o que foi
  // digitado para não rotular o áudio novo com o texto do anterior.
  // tipo / certeza / completo continuam como estavam para agilizar a rotulação.
  const [audioAnterior, setAudioAnterior] = useState(audioAtualId);
  if (audioAnterior !== audioAtualId) {
    setAudioAnterior(audioAtualId);
    setTexto("");
    setComentario("");
    setErro(null);
  }

  const enviar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const textoLimpo = texto.trim();
    if (!textoLimpo || enviando) return;

    setErro(null);
    setEnviando(true);
    try {
      await onAdicionar({
        texto: textoLimpo,
        tipo,
        certeza,
        completo,
        comentario: comentario.trim(),
      });
      setTexto("");
      setComentario("");

      if (avancarAuto) {
        const destino =
          destinoAuto === "proximo" ? proximoId : proximoNaoRotuladoId;
        if (destino) onSelecionarAudio(destino);
      }
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao adicionar o rótulo.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={(e) => void enviar(e)}>
      <div className={styles.nav}>
        <button
          type="button"
          className={styles.navBtn}
          disabled={!anteriorNaoRotuladoId}
          onClick={() => anteriorNaoRotuladoId && onSelecionarAudio(anteriorNaoRotuladoId)}
        >
          ⏮ Anterior sem rótulo
        </button>
        <button
          type="button"
          className={styles.navBtn}
          disabled={!anteriorId}
          onClick={() => anteriorId && onSelecionarAudio(anteriorId)}
        >
          ◀ Anterior
        </button>
        <button
          type="button"
          className={styles.navBtn}
          disabled={!proximoId}
          onClick={() => proximoId && onSelecionarAudio(proximoId)}
        >
          Próximo ▶
        </button>
        <button
          type="button"
          className={styles.navBtn}
          disabled={!proximoNaoRotuladoId}
          onClick={() => proximoNaoRotuladoId && onSelecionarAudio(proximoNaoRotuladoId)}
        >
          Próximo sem rótulo ⏭
        </button>
      </div>

      <div className={styles.grade}>
        <div className={`${styles.campo} ${styles.audio}`}>
          <label className={styles.etiqueta} htmlFor={idAudio}>
            Áudio
          </label>
          <select
            id={idAudio}
            className={styles.input}
            value={audioAtualId}
            onChange={(e) => onSelecionarAudio(e.target.value)}
          >
            {audios.map((audio) => (
              <option key={audio.id} value={audio.id}>
                {audio.nome}
              </option>
            ))}
          </select>
        </div>

        <div className={`${styles.campo} ${styles.rotulo}`}>
          <label className={styles.etiqueta} htmlFor={idTexto}>
            Rótulo
          </label>
          <input
            id={idTexto}
            type="text"
            className={styles.input}
            value={texto}
            placeholder="Ex.: espécie ou som"
            autoComplete="off"
            disabled={enviando}
            onChange={(e) => setTexto(e.target.value)}
          />
        </div>

        <div className={`${styles.campo} ${styles.tipo}`}>
          <label className={styles.etiqueta} htmlFor={idTipo}>
            Tipo
          </label>
          <select
            id={idTipo}
            className={styles.input}
            value={tipo}
            onChange={(e) => setTipo(e.target.value as TipoVocalizacao)}
          >
            <option value="chamado">Chamado</option>
            <option value="canto">Canto</option>
          </select>
        </div>

        <div className={`${styles.campo} ${styles.certeza}`}>
          <label className={styles.etiqueta} htmlFor={idCerteza}>
            Identificação
          </label>
          <select
            id={idCerteza}
            className={styles.input}
            value={certeza}
            onChange={(e) => setCerteza(e.target.value as CertezaIdentificacao)}
          >
            <option value="certa">Certa</option>
            <option value="incerta">Incerta</option>
          </select>
        </div>

        <div className={`${styles.campo} ${styles.completo}`}>
          <label className={styles.etiqueta} htmlFor={idCompleto}>
            Rotulação
          </label>
          <select
            id={idCompleto}
            className={styles.input}
            value={completo}
            onChange={(e) => setCompleto(e.target.value as CompletudeRotulacao)}
          >
            <option value="completo">Completa</option>
            <option value="incompleto">Incompleta</option>
          </select>
        </div>

        <div className={`${styles.campo} ${styles.comentario}`}>
          <label className={styles.etiqueta} htmlFor={idComentario}>
            Comentários
          </label>
          <input
            id={idComentario}
            type="text"
            className={styles.input}
            value={comentario}
            placeholder="Opcional"
            autoComplete="off"
            disabled={enviando}
            onChange={(e) => setComentario(e.target.value)}
          />
        </div>

        <div className={styles.acao}>
          <label className={styles.auto}>
            <input
              type="checkbox"
              checked={avancarAuto}
              onChange={(e) => setAvancarAuto(e.target.checked)}
            />
            Avançar
          </label>
          <select
            className={styles.selectPequeno}
            aria-label="Para onde avançar depois de adicionar"
            value={destinoAuto}
            disabled={!avancarAuto}
            onChange={(e) => setDestinoAuto(e.target.value as DestinoAuto)}
          >
            <option value="proximoSemRotulo">Próx. sem rótulo</option>
            <option value="proximo">Próximo</option>
          </select>
          <button
            type="submit"
            className={styles.adicionar}
            disabled={enviando || !texto.trim()}
          >
            {enviando ? "Adicionando..." : "Adicionar rótulo"}
          </button>
        </div>
      </div>

      {erro && (
        <div role="alert" className={styles.erro}>
          {erro}
        </div>
      )}
    </form>
  );
}
