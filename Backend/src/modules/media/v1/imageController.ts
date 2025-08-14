import { Request, Response } from "express";
import { s3 } from "../../../config/wasabi";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const BUCKET = process.env.WASABI_BUCKET!;

// Generate presigned upload URL (PUT)
export const generatePresignedUrl = async (req: Request, res: Response) => {
  try {
    const { filename, filetype } = req.body;

    if (!filename || !filetype) {
      return res
        .status(400)
        .json({ message: "Filename and filetype are required." });
    }

    const key = `${Date.now()}-${filename}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: filetype,
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 300 });

    return res.status(200).json({ key, url });
  } catch (error) {
    console.error("Error generating upload URL:", error);
    return res.status(500).json({ message: "Failed to generate upload URL." });
  }
};

// Save image metadata to DB
export const saveImageMetadata = async (req: Request, res: Response) => {
  try {
    const { key, url, userId, filename } = req.body;

    if (!key || !url || !userId || !filename) {
      return res
        .status(400)
        .json({ message: "key, url, userId, and filename are required" });
    }

    const image = await prisma.image.create({
      data: { key, url, userId, filename },
    });

    res.json({ message: "Image metadata saved", image });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save image metadata" });
  }
};

// Generate presigned read URL (GET)
export const generateReadUrl = async (req: Request, res: Response) => {
  const { key } = req.params;
  const command = new GetObjectCommand({
    Bucket: process.env.WASABI_BUCKET,
    Key: key
  });
  const url = await getSignedUrl(s3, command, { expiresIn: 60 * 10 }); 
  res.json({ url });
};