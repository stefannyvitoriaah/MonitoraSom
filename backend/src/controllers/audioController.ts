import { Request, Response } from "express";
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


        const resultado =
            await sendAudioToMicroservice(
                req.file.path
            );


        return res.json(resultado);


    } catch(error){

        console.error(error);

        return res.status(500).json({
            erro:"Erro ao processar áudio"
        });
    }

}