import { Request, Response } from "express";
import { prisma } from "../db";
import { sendAudioToMicroservice } from "../services/microserviceService";


export async function uploadAudio(
    req: Request,
    res: Response
){

    try {

        if(!req.file){

            return res.status(400).json({
                erro:"Arquivo não enviado"
            });

        }


        // Salva registro do áudio no banco
        const audio = await prisma.audio.create({

            data:{

                nomeOriginal: req.file.originalname,

                caminhoServidor: req.file.path

            }

        });



        // Envia o arquivo para o microserviço Python
        const resultado =
            await sendAudioToMicroservice(
                req.file.path
            );



        return res.json({

            mensagem:"Upload realizado com sucesso",

            audio,

            processamento: resultado

        });



    } catch(error){

        console.error(error);


        return res.status(500).json({

            erro:"Erro ao processar áudio"

        });

    }

}