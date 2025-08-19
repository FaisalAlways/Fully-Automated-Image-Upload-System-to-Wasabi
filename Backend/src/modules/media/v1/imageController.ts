import { Request, Response } from "express";
import { s3 } from "../../../config/wasabi";
import {
  PutObjectCommand,
  ListBucketsCommand,
  ListObjectsV2Command,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

//  Get all buckets
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

//  Generate presigned URL
export const generatePresignedUrl = async (req: Request, res: Response) => {
  try {
    const { filename, bucketName, folderName, filetype, size } = req.body;

    if (!filename || !bucketName || !filetype || !size) {
      return res.status(400).json({
        message: "Filename, bucketName, filetype, and size are required",
      });
    }

    const uniqueKey = crypto.randomBytes(8).toString("hex");

    const cleanedFolderName =
      folderName && folderName.endsWith("/")
        ? folderName.slice(0, -1)
        : folderName;

    const objectKey = `${uniqueKey}-${filename}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
      ContentType: req.body.filetype || "application/octet-stream",
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 60 });

    //  Save metadata in DB
    const image = await prisma.image.create({
      data: {
        key: objectKey,
        bucket: bucketName,
        folder: cleanedFolderName || null,
        size: Number(size),
        filetype: filetype,
      },
    });

    console.log("✅ Image metadata saved:", image);

    return res.status(200).json({ url, key: objectKey, bucketName });
  } catch (error) {
    console.error("❌ Presigned URL error:", error);
    return res
      .status(500)
      .json({ message: "Failed to generate presigned URL" });
  }
};

export const generateReadUrl = async (req: Request, res: Response) => {
  try {
    const { key, bucket } = req.params;

    if (!key || !bucket) {
      return res
        .status(400)
        .json({ message: "Both key and bucket are required" });
    }

    // Decode key in case it has spaces or special characters
    const objectKey = key;

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: objectKey,
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 10 }); // 1 minutes

    return res.status(200).json({ url });
  } catch (error) {
    console.error("❌ Read URL error:", error);
    return res.status(500).json({ message: "Failed to generate read URL" });
  }
};

//  Get all images
export const getAllImages = async (req: Request, res: Response) => {
  try {
    const images = await prisma.image.findMany({
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json(images);
  } catch (error) {
    console.error("❌ Fetch images error:", error);
    return res.status(500).json({ message: "Failed to fetch images" });
  }
};

export const deleteImage = async (req: Request, res: Response) => {
  try {
    // Make sure param names match your route
    const { id, bucket } = req.params;
    console.log("Delete request for ID:", id, "Bucket:", bucket);

    // Find the image in DB
    const image = await prisma.image.findUnique({ where: { id } });

    if (!image) {
      console.log("❌ Image not found in DB");
      return res.status(404).json({ message: "Image not found in DB" });
    }

    // Delete from Wasabi
    try {
      await s3.send(
        new DeleteObjectCommand({ Bucket: bucket, Key: image.key })
      );
      console.log("✅ Deleted from Wasabi:", image.key);
    } catch (s3Error) {
      console.error("❌ Wasabi delete failed:", s3Error);
      return res.status(500).json({ message: "Failed to delete from Wasabi" });
    }

    // Delete from database
    await prisma.image.delete({ where: { id } });
    console.log("✅ Deleted from DB");

    return res.status(200).json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("❌ Delete API Error:", error);
    return res.status(500).json({ message: "Failed to delete image" });
  }
};
