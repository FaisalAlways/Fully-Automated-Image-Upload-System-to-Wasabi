-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "blockedUntil" TIMESTAMP(3),
ADD COLUMN     "failedAttempts" INTEGER NOT NULL DEFAULT 0;
