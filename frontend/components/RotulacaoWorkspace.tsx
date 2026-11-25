"use client";

import { useEffect, useState } from "react";
import FormularioRotulacao, {
  type DadosRotulo,
} from "@/components/FormularioRotulacao";
import PainelRotulos from "@/components/PainelRotulos";
import VisualizadorAudio from "@/components/VisualizadorAudio";
import { useSoundSystem } from "@/contexts/SoundContext";
import styles from "./rotulacao.module.css";
import {
  criarRotulo,
  excluirRotulo,
  listarAudiosComRotulos,
  listarRotulos,
  montarUrlAudio,
  RotuloRegistro,
} from "@/services/rotuloService";

interface RotulacaoWorkspaceProps {
  audioId: string;
  onSelecionarAudio: (id: string) => void;
  onFechar: () => void;
}

interface ItemLista {
  id: string;
  nomeOriginal: string;
  caminhoServidor: string;
  totalRotulos: number;
}

export default function RotulacaoWorkspace({
  audioId,
  onSelecionarAudio,
  onFechar,
}: RotulacaoWorkspaceProps) {
  const { playSound, settings } = useSoundSystem();
  const [lista, setLista] = useState<ItemLista[] | null>(null);
  const [erroLista, setErroLista] = useState<string | null>(null);
  const [rotulosDados, setRotulosDados] = useState<{
    audioId: string;
    itens: RotuloRegistro[];
  } | null>(null);
  const [erroRotulos, setErroRotulos] = useState<{
    audioId: string;
    mensagem: string;
  } | null>(null);
  const [erroExclusao, setErroExclusao] = useState<string | null>(null);
  const [idExcluindo, setIdExcluindo] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    const carregar = () => {
      listarAudiosComRotulos()
        .then((audios) => {
          if (!ativo) return;
          setLista(
            audios.map((a) => ({
              id: a.id,
              nomeOriginal: a.nomeOriginal,
              caminhoServidor: a.caminhoServidor,
              totalRotulos: a.rotulos.length,
            }))
          );
          setErroLista(null);
        })
        .catch((e: unknown) => {
          if (ativo)
            setErroLista(
              e instanceof Error ? e.message : "Erro ao carregar os áudios."
            );
        });
    };
    carregar();
    window.addEventListener("audios:atualizados", carregar);
    return () => {
      ativo = false;
      window.removeEventListener("audios:atualizados", carregar);
    };
  }, []);

  // Rótulos áudio atual.
  useEffect(() => {
    let ativo = true;
    listarRotulos(audioId)
      .then((itens) => {
        if (ativo) setRotulosDados({ audioId, itens });
      })
      .catch((e: unknown) => {
        if (ativo)
          setErroRotulos({
            audioId,
            mensagem:
              e instanceof Error ? e.message : "Erro ao carregar os rótulos.",
          });
      });
    return () => {
      ativo = false;
    };
  }, [audioId]);

  const rotulos =
    rotulosDados?.audioId === audioId ? rotulosDados.itens : null;
  const mensagemErroRotulos =
    erroExclusao ??
    (erroRotulos?.audioId === audioId ? erroRotulos.mensagem : null);

  const ajustarTotal = (id: string, delta: number) =>
    setLista((atual) =>
      atual
        ? atual.map((a) =>
            a.id === id
              ? { ...a, totalRotulos: Math.max(0, a.totalRotulos + delta) }
              : a
          )
        : atual
    );

  const remover = async (rotulo: RotuloRegistro) => {
    if (
      settings.confirmBeforeDelete &&
      !window.confirm(`Excluir o rótulo "${rotulo.texto}"?`)
    ) {
      return;
    }
    setErroExclusao(null);
    setIdExcluindo(rotulo.id);
    try {
      await excluirRotulo(rotulo.id);
      setRotulosDados((d) =>
        d && d.audioId === audioId
          ? { ...d, itens: d.itens.filter((r) => r.id !== rotulo.id) }
          : d
      );
      ajustarTotal(audioId, -1);
    } catch (error) {
      setErroExclusao(
        error instanceof Error ? error.message : "Erro ao excluir rótulo."
      );
      void playSound("error");
    } finally {
      setIdExcluindo(null);
    }
  };

  const adicionar = async (dados: DadosRotulo) => {
    setErroExclusao(null);
    try {
      const novo = await criarRotulo(audioId, dados.texto);
      setRotulosDados((d) =>
        d && d.audioId === audioId ? { ...d, itens: [...d.itens, novo] } : d
      );
      ajustarTotal(audioId, 1);
      void playSound("success");
    } catch (error) {
      void playSound("error");
      throw error;
    }
  };

  const selecionar = (id: string) => {
    setErroExclusao(null);
    onSelecionarAudio(id);
  };

  const cabecalho = (nome?: string) => (
    <div className={styles.cabecalho}>
      <div className={styles.cabecalhoTitulo}>
        <span className={styles.rotulando}>Rotulando</span>
        <h2 className={styles.nome}>{nome ?? "Carregando..."}</h2>
      </div>
      <button type="button" onClick={onFechar} className={styles.fechar}>
        Fechar
      </button>
    </div>
  );

  if (erroLista) {
    return (
      <div className={styles.workspace}>
        {cabecalho()}
        <div role="alert" className={styles.erro}>
          {erroLista}
        </div>
      </div>
    );
  }

  if (!lista) {
    return (
      <div className={styles.workspace}>
        {cabecalho()}
        <p className={styles.mensagem}>Carregando áudios...</p>
      </div>
    );
  }

  const indice = lista.findIndex((a) => a.id === audioId);
  if (indice === -1) {
    return (
      <div className={styles.workspace}>
        {cabecalho()}
        <div role="alert" className={styles.erro}>
          Áudio não encontrado.
        </div>
      </div>
    );
  }

  const atual = lista[indice];

  const vizinho = (passo: 1 | -1, apenasSemRotulo: boolean): string | null => {
    for (let i = indice + passo; i >= 0 && i < lista.length; i += passo) {
      if (!apenasSemRotulo || lista[i].totalRotulos === 0) return lista[i].id;
    }
    return null;
  };

  return (
    <div className={styles.workspace}>
      {cabecalho(atual.nomeOriginal)}

      <VisualizadorAudio
        key={atual.id}
        audioUrl={montarUrlAudio(atual.caminhoServidor)}
      />

      <FormularioRotulacao
        audios={lista.map((a) => ({ id: a.id, nome: a.nomeOriginal }))}
        audioAtualId={atual.id}
        anteriorId={vizinho(-1, false)}
        proximoId={vizinho(1, false)}
        anteriorNaoRotuladoId={vizinho(-1, true)}
        proximoNaoRotuladoId={vizinho(1, true)}
        onSelecionarAudio={selecionar}
        onAdicionar={adicionar}
      />

      <PainelRotulos
        rotulos={rotulos}
        erro={mensagemErroRotulos}
        idExcluindo={idExcluindo}
        onRemover={(r) => void remover(r)}
      />
    </div>
  );
}