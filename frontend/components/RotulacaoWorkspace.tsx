"use client";

import { useEffect, useState } from "react";

import PainelRotulos from "@/components/PainelRotulos";
import VisualizadorAudio from "@/components/VisualizadorAudio";
import { useSoundSystem } from "@/contexts/SoundContext";

import styles from "./rotulacao.module.css";

import {
  criarRotulo,
  excluirRotulo,
  editarRotulo,
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


  const [erroAcao, setErroAcao] = useState<string | null>(null);

  const [idExcluindo, setIdExcluindo] = useState<string | null>(null);



  // ================================
  // Carregar lista de áudios
  // ================================

  useEffect(() => {

    let ativo = true;


    const carregar = async () => {

      try {

        const audios = await listarAudiosComRotulos();


        if(!ativo) return;


        setLista(
          audios.map((a)=>({
            id:a.id,
            nomeOriginal:a.nomeOriginal,
            caminhoServidor:a.caminhoServidor,
            totalRotulos:a.rotulos.length
          }))
        );


        setErroLista(null);


      }catch(error){

        if(ativo){

          setErroLista(
            error instanceof Error
              ? error.message
              : "Erro ao carregar áudios."
          );

        }

      }

    };


    carregar();


    window.addEventListener(
      "audios:atualizados",
      carregar
    );


    return()=>{

      ativo=false;

      window.removeEventListener(
        "audios:atualizados",
        carregar
      );

    };


  },[]);



  // ================================
  // Carregar rótulos do áudio atual
  // ================================

  useEffect(()=>{


    let ativo=true;


    listarRotulos(audioId)

      .then((itens)=>{

        if(ativo){

          setRotulosDados({
            audioId,
            itens
          });

        }

      })


      .catch((error)=>{


        if(ativo){

          setErroRotulos({
            audioId,
            mensagem:
              error instanceof Error
                ? error.message
                : "Erro ao carregar rótulos."
          });

        }


      });


    return()=>{

      ativo=false;

    };


  },[audioId]);





  const rotulos =
    rotulosDados?.audioId === audioId
      ? rotulosDados.itens
      : null;



  const mensagemErro =
    erroAcao ??
    (
      erroRotulos?.audioId === audioId
        ? erroRotulos.mensagem
        : null
    );




  const ajustarTotal = (
    id:string,
    valor:number
  )=>{


    setLista((atual)=>{


      if(!atual)
        return atual;


      return atual.map((a)=>

        a.id===id

        ? {
            ...a,
            totalRotulos:
              Math.max(
                0,
                a.totalRotulos + valor
              )
          }

        : a

      );


    });


  };





  // ================================
  // Criar rótulo
  // ================================

  const adicionar = async(texto:string)=>{


    if(!texto.trim())
      return;



    try{


      setErroAcao(null);



      const novo =
        await criarRotulo(
          audioId,
          texto.trim()
        );



      setRotulosDados((dados)=>{


        if(!dados || dados.audioId!==audioId)
          return dados;



        return {

          ...dados,

          itens:[
            ...dados.itens,
            novo
          ]

        };


      });



      ajustarTotal(audioId,1);



      if(settings.soundEnabled){

        void playSound("success");

      }



    }catch(error){


      setErroAcao(
        error instanceof Error
          ? error.message
          : "Erro ao criar rótulo."
      );



      if(settings.soundEnabled){

        void playSound("error");

      }


    }


  };





  // ================================
  // Editar rótulo
  // ================================

  const editar = async(
    id:string,
    texto:string
  )=>{


    try{


      const atualizado =
        await editarRotulo(
          id,
          texto
        );



      setRotulosDados((dados)=>{


        if(!dados || dados.audioId!==audioId)
          return dados;



        return {

          ...dados,

          itens:
            dados.itens.map((r)=>

              r.id===id
                ? atualizado
                : r

            )

        };


      });



    }catch(error){


      setErroAcao(
        error instanceof Error
          ? error.message
          : "Erro ao editar rótulo."
      );



      if(settings.soundEnabled){

        void playSound("error");

      }


    }


  };





  // ================================
  // Excluir rótulo
  // ================================

  const remover = async(
    rotulo:RotuloRegistro
  )=>{


    if(
      settings.confirmBeforeDelete &&
      !window.confirm(
        `Excluir o rótulo "${rotulo.texto}"?`
      )
    ){

      return;

    }



    try{


      setIdExcluindo(rotulo.id);

      setErroAcao(null);



      await excluirRotulo(
        rotulo.id
      );



      setRotulosDados((dados)=>{


        if(!dados || dados.audioId!==audioId)
          return dados;



        return {

          ...dados,

          itens:
            dados.itens.filter(
              r=>r.id!==rotulo.id
            )

        };


      });



      ajustarTotal(
        audioId,
        -1
      );



      if(settings.soundEnabled){

        void playSound("success");

      }



    }catch(error){


      setErroAcao(
        error instanceof Error
          ? error.message
          : "Erro ao excluir rótulo."
      );



      if(settings.soundEnabled){

        void playSound("error");

      }



    }finally{


      setIdExcluindo(null);


    }


  };






  const cabecalho = (nome?:string)=>(

    <div className={styles.cabecalho}>

      <div className={styles.cabecalhoTitulo}>

        <span className={styles.rotulando}>
          Rotulando
        </span>


        <h2 className={styles.nome}>
          {nome ?? "Carregando..."}
        </h2>


      </div>


      <button
        type="button"
        onClick={onFechar}
        className={styles.fechar}
      >
        Fechar
      </button>


    </div>

  );





  if(erroLista){

    return(

      <div className={styles.workspace}>

        {cabecalho()}

        <div className={styles.erro}>
          {erroLista}
        </div>

      </div>

    );

  }




  if(!lista){

    return(

      <div className={styles.workspace}>

        {cabecalho()}

        <p className={styles.mensagem}>
          Carregando áudios...
        </p>


      </div>

    );

  }




  const atual =
    lista.find(
      a=>a.id===audioId
    );



  if(!atual){

    return(

      <div className={styles.workspace}>

        {cabecalho()}

        <div className={styles.erro}>
          Áudio não encontrado.
        </div>

      </div>

    );

  }




  return(

    <div className={styles.workspace}>


      {cabecalho(
        atual.nomeOriginal
      )}



      <VisualizadorAudio

        key={atual.id}

        audioUrl={
          montarUrlAudio(
            atual.caminhoServidor
          )
        }

      />



      <PainelRotulos

        rotulos={rotulos}

        erro={mensagemErro}

        idExcluindo={idExcluindo}

        onRemover={
          (r)=>void remover(r)
        }

        onAdicionar={
          adicionar
        }

        onEditar={
          editar
        }

      />


    </div>

  );


}