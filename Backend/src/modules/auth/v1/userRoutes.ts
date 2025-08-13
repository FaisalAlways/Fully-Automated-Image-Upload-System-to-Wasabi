import express from "express";
import {
  signUpByEmail,
  verifyEmail,
  loginByEmail,
  refreshToken,
  resetPasswordEmailOtp,
  verifiedEmailOtp,
  setNewPassword,
  logout,
  resendVerificationEmail,
} from "./userController";
import { validate } from "../../../middlewares/validate";
import { signUpSchema } from "../../../schemas/auth.schema";
import { loginSchema } from "../../../schemas/auth.schema";
import { validateVerifyEmail } from "../../../middlewares/validateVerifyEmail";

const router = express.Router();

router.post("/signup", validate(signUpSchema), signUpByEmail);
router.post("/verify-email", validateVerifyEmail, verifyEmail);
router.post("/resend-verification-email", resendVerificationEmail);
router.post("/login", validate(loginSchema), loginByEmail);
router.get("/refresh-token", refreshToken);
router.post("/reset-password-otp", resetPasswordEmailOtp);
router.post("/verified-email-otp", verifiedEmailOtp);
router.post("/set-new-password", setNewPassword);
router.post("/logout", logout);
export default router;
