import { Request, Response } from "express";
import { s3 } from "../../../config/wasabi";
import {
  PutObjectCommand,
  ListBucketsCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";

// ✅ Get all buckets
export const getAllBuckets = async (req: Request, res: Response) => {
  try {
    const response = await s3.send(new ListBucketsCommand({}));
    const buckets = response.Buckets?.map((b) => b.Name) || [];
    return res.json(buckets);
  } catch (err) {
    console.error("❌ Failed to fetch buckets:", err);
    return res.status(500).json({ message: "Failed to fetch buckets" });
  }
};

export const getAllFoldersInBucket = async (req: Request, res: Response) => {
  const { bucketName } = req.params;
  try {
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Delimiter: "/",
    });
    const response = await s3.send(command);
    const folders = response.CommonPrefixes?.map((cp) => cp.Prefix) || [];
    return res.json(folders);
  } catch (err) {
    console.error("❌ Failed to fetch folders:", err);
    return res.status(500).json({ message: "Failed to fetch folders" });
  }
};

// ✅ Generate presigned URL
export const generatePresignedUrl = async (req: Request, res: Response) => {
  try {
    const { filename, bucketName, folderName, filetype } = req.body;

    if (!filename || !bucketName) {
      return res
        .status(400)
        .json({ message: "Filename and bucketName are required." });
    }

    const uniqueKey = crypto.randomBytes(16).toString("hex");

    const cleanedFolderName =
      folderName && folderName.endsWith("/")
        ? folderName.slice(0, -1)
        : folderName;

    const objectKey = cleanedFolderName
      ? `${cleanedFolderName}/${uniqueKey}-${filename}`
      : `${uniqueKey}-${filename}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
      ContentType: req.body.filetype || "application/octet-stream",
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 60 });

    return res.status(200).json({ url, key: objectKey, bucketName });
  } catch (error) {
    console.error("❌ Presigned URL error:", error);
    return res
      .status(500)
      .json({ message: "Failed to generate presigned URL" });
  }
};
