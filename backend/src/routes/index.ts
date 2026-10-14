import { Router } from "express";
import multer from "multer";

import { health } from "../controllers/healthController";
import { uploadAudio } from "../controllers/audioController";


const router = Router();


const upload = multer({
    dest: "uploads/"
});


router.get("/health", health);


router.post(
    "/audio/upload",
    upload.single("audio"),
    uploadAudio
);


export default router;