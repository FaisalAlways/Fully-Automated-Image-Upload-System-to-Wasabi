import { Router } from "express";
import uploadRoute from "./modules/media/v1/imageRoutes";

const router = Router();

router.use("/api/v1", uploadRoute);

export default router;
