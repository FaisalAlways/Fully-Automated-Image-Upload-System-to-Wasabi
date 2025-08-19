import { Router } from "express";
import {
  generatePresignedUrl,
  getAllBuckets,
  getAllFoldersInBucket,
  getAllImages,
  generateReadUrl,
  deleteImage,
} from "./imageController";

const router = Router();

router.get("/show-all-buckets", getAllBuckets);
router.post("/generate-presigned-url", generatePresignedUrl);
router.get("/show-all-folders/:bucketName", getAllFoldersInBucket);
router.get("/all-images", getAllImages);
router.get("/generate-read-url/:bucket/:key", generateReadUrl);
router.delete("/delete-image/:id/:bucket", deleteImage);

export default router;
