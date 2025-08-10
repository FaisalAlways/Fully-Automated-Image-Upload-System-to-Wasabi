import { Router } from "express";
import userRoutes from "./modules/auth/v1/userRoutes";

const router = Router();

router.use("/api/v1/auth", userRoutes);

export default router;
