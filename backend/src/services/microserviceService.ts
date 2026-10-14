import axios from "axios";
import FormData from "form-data";
import fs from "fs";

export async function sendAudioToMicroservice(
    filePath: string
) {

    const form = new FormData();

    form.append(
        "audio",
        fs.createReadStream(filePath)
    );


    const response = await axios.post(
        "http://microservice:8000/process",
        form,
        {
            headers: form.getHeaders()
        }
    );


    return response.data;
}