import { Request, Response } from "express";

export const uploadPhoto = async (req: Request, res: Response) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ status: "fail", message: "No file uploaded" });
    }

    console.log("File saved locally:");
    console.log(`- Path: ${file.path}`);
    console.log(`- Name: ${file.originalname}`);
    console.log(`- Type: ${file.mimetype}`);
    console.log(`- Size: ${file.size} bytes`);

    return res.status(200).json({
      status: "success",
      message: "File uploaded and saved locally",
      file: {
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path: file.path,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ status: "error", message: "Internal server error" });
  }
};
