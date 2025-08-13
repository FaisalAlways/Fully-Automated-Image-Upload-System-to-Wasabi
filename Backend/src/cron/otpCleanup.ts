import cron from "node-cron";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
// This function will run every day at midnight (00:00)
cron.schedule("0  0 * * *", async () => {
  try {
    console.log("Checking for expired OTPs...");

    // Get the current date and time
    const now = new Date();

    // Find all expired otps
    const expiredOtps = await prisma.otp.findMany({
      where: {
        expiresAt: {
          lt: now,
        },
      },
    });

    // If there are expired otps, delete them
    if (expiredOtps.length > 0) {
      const otpIds = expiredOtps.map((otp) => otp.id);

      expiredOtps.forEach((otp) => {
        console.log(`OTP ID: ${otp.id}, Type: ${otp.otpType}`);
      });

      // Delete expired otps
      await prisma.otp.deleteMany({
        where: {
          id: { in: otpIds },
        },
      });

      console.log(`Deleted ${expiredOtps.length} expired OTPs.`);
    } else {
      console.log("No expired OTPs found.");
    }
  } catch (error) {
    console.error("Error checking expired OTPs:", error);
  }
});
