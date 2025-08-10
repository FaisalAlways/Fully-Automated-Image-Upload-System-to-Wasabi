import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import emailVerificationOtpTemplat from "../../../templates/emailVerificationOtpTemplate";
import resetPasswordTemplate from "../../../templates/resetPasswordOtpTemplate";
const prisma = new PrismaClient();
import { SignUpInput } from "../../../schemas/auth.schema";
import {
  isLocked,
  recordFailedAttempt,
  resetAttempts,
} from "../../../utils/loginRateLimit";

// Create a new user and send verification email
export const signUpByEmail = async (req: Request, res: Response) => {
  const { firstName, lastName, email, phone, password } =
    req.body as SignUpInput;

  try {
    // Validate input
    if (!firstName || !lastName || !email || !phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return res.status(409).json({
        status: "fail",
        error: " An account already exists. Please try logging in.",
      });
    }

    // Hash password
    const passwordHashing = bcrypt.hashSync(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        password: passwordHashing,
        isEmailVerified: false,
      },
      select: { id: true, firstName: true, lastName: true, email: true },
    });

    // Generate and store the token
    const token = crypto.randomBytes(32).toString("hex");

    // Store token in DB (create UserToken or similar model)
    await prisma.token.create({
      data: {
        token,
        tokenType: "EMAIL_VERIFICATION",
        expiresAt: new Date(Date.now() + 1000 * 60 * 5),
        userId: user.id,
      },
    });

    // Construct verification URL — frontend is on port 5000, backend on 8000
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

    // Setup nodemailer transporter (make sure env variables are set)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Email content
    const mailOptions = {
      from: `"Home Khujun" <${process.env.EMAIL_USERNAME}>`,
      to: email,
      subject: "Verify Your Email",
      html: emailVerificationOtpTemplat(firstName, verificationUrl),
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    // Log the email sending status
    res.status(201).json({
      status: "success",
      message:
        "Account created successfully. Please check your email to verify your account.",
      data: { user },
    });
    return;
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({
      status: "error",
      message: "Something went wrong. Please try again later.",
    });
  }
};

// Verify email using the token sent to the user's email
export const verifyEmail = async (req: Request, res: Response) => {
  const { token } = req.body;

  // Find user with the verification token
  try {
    const tokenRecord = await prisma.token.findUnique({
      where: { token, tokenType: "EMAIL_VERIFICATION" },
      include: { user: true },
    });

    if (!tokenRecord || tokenRecord.tokenType !== "EMAIL_VERIFICATION") {
      return res.status(400).json({ message: "Invalid or expired token" });
    }
    const user = tokenRecord.user;

    // Check email verification status
    if (user.isEmailVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    // Update user email verification status
    await prisma.user.update({
      where: { id: user.id },
      data: { isEmailVerified: true },
    });

    // Deleting all user Token after verification
    await prisma.token.deleteMany({
      where: { userId: user.id, tokenType: "EMAIL_VERIFICATION" },
    });

    console.log(`Email verified successfully for user: ${user.email}`);
    return res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Verification error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Login user and generate access and refresh tokens
export const loginByEmail = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (isLocked(email)) {
      return res.status(429).json({
        status: "fail",
        error: "Too many failed attempts. Please try again in 3 minutes.",
      });
    }

    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({
        status: "fail",
        message: "User not found. Please register first.",
      });
    }

    // Check email verification
    if (!user.isEmailVerified) {
      return res.status(403).json({
        status: "fail",
        message: "Email not verified. Please verify your email.",
      });
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      recordFailedAttempt(email);
      return res.status(401).json({
        status: "fail",
        message: "Invalid email or password.",
      });
    }

    resetAttempts(email);

    // JWT Payload
    const payload = {
      id: user.id,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
    };

    // Check secret keys
    const accessSecret = process.env.ACCESS_TOKEN_SECRET_KEY;
    const refreshSecret = process.env.REFRESH_TOKEN_SECRET_KEY;
    if (!accessSecret || !refreshSecret) {
      console.error("JWT secret keys are missing");
      return res.status(500).json({
        status: "error",
        message: "Internal server error.",
      });
    }

    // Generate tokens
    const accessToken = jwt.sign(payload, accessSecret, { expiresIn: "15m" });
    const refreshToken = jwt.sign(payload, refreshSecret, { expiresIn: "7d" });

    // Set HTTP-only refresh token cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    // Respond with access token
    return res.status(200).json({
      status: "success",
      message: "Logged in successfully.",
      data: {
        accessToken,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      status: "error",
      message: "Something went wrong. Please try again later.",
    });
  }
};

// Generate new access token after expiresIn
export const refreshToken = async (req: Request, res: Response) => {
  const cookies = req.cookies;

  const refreshToken = cookies?.refreshToken;

  if (!refreshToken) {
    return res
      .status(401)
      .json({ message: "Unauthorized: No refresh token provided" });
  }
  try {
    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET_KEY as string
    ) as jwt.JwtPayload;

    //Find the user in database
    const foundUser = await prisma.user.findFirst({
      where: { email: decoded.email },
    });
    console.log(foundUser);
    if (!foundUser) {
      res.clearCookie("refresh_token", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      });
      res.status(401).json({ message: "Unauthorized: User not found" });
      return;
    }
    const accessToken = jwt.sign(
      {
        id: foundUser.id,
        email: foundUser.email,
        name: `${foundUser.firstName} ${foundUser.lastName}`,
      },
      process.env.ACCESS_TOKEN_SECRET_KEY as string,
      { expiresIn: "15m" }
    );

    res
      .status(200)
      .json({ message: "Access token renewed successfully", accessToken });
    return;
  } catch (err) {
    console.error("Error verifying refresh token:", err);
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    res
      .status(401)
      .json({ message: "Unauthorized: Refresh token expired or invalid" });
    return;
  }
};

// Reset Password OTP For Email
export const resetPasswordEmailOtp = async (req: Request, res: Response) => {
  const { email } = req.body;
  const now = new Date();

  try {
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if OTP already exists and not expired
    const existingOtp = await prisma.otp.findFirst({
      where: {
        userId: user.id,
        otpType: "PASSWORD_RESET",
        expiresAt: {
          gt: now,
        },
      },
    });

    // Block if new OTP request is made within valid time
    if (existingOtp) {
      const remaining = Math.floor(
        (existingOtp.expiresAt.getTime() - now.getTime()) / 1000
      );
      return res.status(429).json({
        message: `Please wait ${remaining} seconds before requesting a new OTP.`,
      });
    }

    // Delete any previous expired OTPs for this user and type
    await prisma.otp.deleteMany({
      where: {
        userId: user.id,
        otpType: "PASSWORD_RESET",
      },
    });

    // Generate a secure 4-digit OTP
    const otp = (crypto.randomBytes(4).readUInt32BE(0) % 9000) + 1000;
    const expiresAt = new Date(Date.now() + 1000 * 60 * 3); // 3 minutes from now

    // Store OTP in database
    await prisma.otp.create({
      data: {
        otp,
        otpType: "PASSWORD_RESET",
        expiresAt,
        userId: user.id,
      },
    });

    // Setup nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Email sending
    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: "🔐 Your Password Reset Code",
      html: resetPasswordTemplate(user.firstName, otp, expiresAt.getTime()),
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ message: "Reset code sent to email" });
  } catch (error) {
    console.error("Error in resetPasswordEmailOtp:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Verified Email OTP handler function
export const verifiedEmailOtp = async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  try {
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP required" });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find latest non-expired OTP entry
    const userOtp = await prisma.otp.findFirst({
      where: {
        userId: user.id,
        otpType: "PASSWORD_RESET",
      },
    });

    if (!userOtp || userOtp.otp !== Number(otp)) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Generate password reset token
    const resetToken = uuidv4();
    const expiration = new Date(Date.now() + 1000 * 60 * 60); // 1 hour expiry

    // Create a new PASSWORD_RESET token
    await prisma.token.create({
      data: {
        token: resetToken,
        tokenType: "PASSWORD_RESET",
        userId: user.id,
        expiresAt: expiration,
      },
    });

    //Delete Otp after token generated
    await prisma.otp.deleteMany({
      where: {
        userId: user.id,
        otpType: "PASSWORD_RESET",
      },
    });

    return res.status(200).json({
      resetToken,
      message:
        "OTP verified successfully. Use this token to reset your password.",
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Set New Password
export const setNewPassword = async (req: Request, res: Response) => {
  const { email, token, password, confirmPassword } = req.body;

  try {
    // Input validation
    if (!email || !password || !confirmPassword || !token) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userToken = await prisma.token.findFirst({
      where: { userId: user.id },
    });
    console.log(userToken, "userToken");
    // Check if token is valid
    if (
      !userToken ||
      userToken.token !== token ||
      userToken.expiresAt! < new Date()
    ) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password
    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
      },
    });
    await prisma.token.deleteMany({
      where: { userId: user.id, tokenType: "PASSWORD_RESET" },
    });

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
