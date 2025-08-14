import { Router } from "express";
import userRoutes from "./modules/auth/v1/userRoutes";
import uploadRoute from "./modules/media/v1/imageRoutes";

const router = Router();

router.use("/api/v1/auth", userRoutes);
router.use("/api/v1", uploadRoute);

export default router;
