import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { uploadPhoto } from "./uploadController";

const router = Router();

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer disk storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// POST /upload route with multer middleware and controller
router.post("/upload", upload.single("file"), uploadPhoto);

export default router;
