import { Router } from "express";
import {
  generatePresignedUrl,
  getAllBuckets,
  getAllFoldersInBucket,
} from "./imageController";

const router = Router();

router.get("/show-all-buckets", getAllBuckets);
router.post("/generate-presigned-url", generatePresignedUrl);
router.get("/show-all-folders/:bucketName", getAllFoldersInBucket);

export default router;
