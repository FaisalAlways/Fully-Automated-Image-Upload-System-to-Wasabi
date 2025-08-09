import express from "express";
import {
  signUpByEmail,
  verifyEmail,
  logininByEmail,
  refreshToken,
  resetPasswordEmailOtp,
  verifiedEmailOtp,
  setNewPassword,
  getAllUser,
} from "../modules/userController";


const router = express.Router();

router.post("/signup", signUpByEmail);
router.post("/verify-email", verifyEmail);
router.post("/login", logininByEmail);
router.get("/refresh", refreshToken);
router.post("/reset-password-email-otp", resetPasswordEmailOtp);
router.post("/verified-email-otp", verifiedEmailOtp);
router.post("/set-new-password", setNewPassword);
router.get("/get-all-user", getAllUser);
export default router;
