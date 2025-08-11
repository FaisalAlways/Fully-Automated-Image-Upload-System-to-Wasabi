// src/cron/tokenCleanup.ts
import cron from "node-cron";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
// This function will run every day at midnight (00:00)
cron.schedule("0 0 * * *", async () => {
  try {
    console.log("Checking for expired tokens...");

    // Get the current date and time
    const now = new Date();

    // Find all expired tokens
    const expiredTokens = await prisma.token.findMany({
      where: {
        expiresAt: {
          lt: now,
        },
      },
    });

    // If there are expired tokens, delete them
    if (expiredTokens.length > 0) {
      const tokenIds = expiredTokens.map((token) => token.id);

      expiredTokens.forEach((token) => {
        console.log(`OTP ID: ${token.id}, Type: ${token.tokenType}`);
      });

      // Delete expired tokens
      await prisma.token.deleteMany({
        where: {
          id: { in: tokenIds },
        },
      });

      console.log(`Deleted ${expiredTokens.length} expired tokens.`);
    } else {
      console.log("No expired tokens found.");
    }
  } catch (error) {
    console.error("Error checking expired tokens:", error);
  }
});
