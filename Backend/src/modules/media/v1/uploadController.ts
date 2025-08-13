import { Request, Response } from "express";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";

dotenv.config();

const s3 = new S3Client({
  region: process.env.WASABI_REGION!,
  endpoint: `https://${process.env.WASABI_ENDPOINT}`,
  credentials: {
    accessKeyId: process.env.WASABI_ACCESS_KEY!,
    secretAccessKey: process.env.WASABI_SECRET_KEY!,
  },
  forcePathStyle: true,
});

export const generateUploadURL = async (req: Request, res: Response) => {
  try {
    const { fileName, fileType } = req.body;

    if (!fileName || !fileType) {
      return res.status(400).json({
        status: "fail",
        message: "fileName and fileType are required",
      });
    }

    const key = `${Date.now()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: process.env.WASABI_BUCKET!,
      Key: key,
      ContentType: fileType,
      ACL: "public-read",
    });

    const url = `https://${process.env.WASABI_BUCKET}.${process.env.WASABI_ENDPOINT}/${key}`;

    res.status(200).json({
      status: "success",
      key,
      url,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to generate upload URL", error });
  }
};
