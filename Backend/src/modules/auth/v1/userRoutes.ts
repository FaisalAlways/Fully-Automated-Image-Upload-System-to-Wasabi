import express from "express";
import {
  signUpByEmail,
  verifyEmail,
  loginByEmail,
  refreshToken,
  resetPasswordEmailOtp,
  verifiedEmailOtp,
  setNewPassword,
} from "../v1/userController";
import { validate } from "../../../middlewares/validate";
import { signUpSchema } from "../../../schemas/auth.schema";
import { loginSchema } from "../../../schemas/auth.schema";
import { validateVerifyEmail } from "../../../middlewares/validateVerifyEmail";

const router = express.Router();

router.post("/signup", validate(signUpSchema), signUpByEmail);
router.post("/verify-email", validateVerifyEmail, verifyEmail);
router.post("/login", validate(loginSchema), loginByEmail);
router.get("/refresh", refreshToken);
router.post("/reset-password-email-otp", resetPasswordEmailOtp);
router.post("/verified-email-otp", verifiedEmailOtp);
router.post("/set-new-password", setNewPassword);
export default router;
