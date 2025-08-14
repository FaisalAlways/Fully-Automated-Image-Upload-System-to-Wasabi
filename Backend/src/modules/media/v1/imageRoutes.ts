import { Router } from "express";
import { generatePresignedUrl, saveImageMetadata, generateReadUrl } from "./imageController";

const router = Router();

router.post("/generate-presigned-url", generatePresignedUrl);
router.post("/save-image", saveImageMetadata);
router.get("/generate-read-url/:key", generateReadUrl);

export default router;
