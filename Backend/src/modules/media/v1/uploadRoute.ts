import { Router } from "express";
import { generateUploadURL } from "./uploadController";

const router = Router();

router.post("/uploadfile", generateUploadURL);

export default router;
