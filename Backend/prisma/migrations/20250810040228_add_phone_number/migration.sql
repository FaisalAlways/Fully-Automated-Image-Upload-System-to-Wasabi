/*
  Warnings:

  - The values [OTHER] on the enum `OtpType` will be removed. If these variants are still used in the database, this will fail.
  - The values [OTHER] on the enum `TokenType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `Course` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CourseOutcome` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CourseOverview` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Department` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WhoWillTakeThisCourse` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `phone` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."OtpType_new" AS ENUM ('PASSWORD_RESET');
ALTER TABLE "public"."Otp" ALTER COLUMN "otpType" TYPE "public"."OtpType_new" USING ("otpType"::text::"public"."OtpType_new");
ALTER TYPE "public"."OtpType" RENAME TO "OtpType_old";
ALTER TYPE "public"."OtpType_new" RENAME TO "OtpType";
DROP TYPE "public"."OtpType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."TokenType_new" AS ENUM ('EMAIL_VERIFICATION', 'PASSWORD_RESET');
ALTER TABLE "public"."Token" ALTER COLUMN "tokenType" TYPE "public"."TokenType_new" USING ("tokenType"::text::"public"."TokenType_new");
ALTER TYPE "public"."TokenType" RENAME TO "TokenType_old";
ALTER TYPE "public"."TokenType_new" RENAME TO "TokenType";
DROP TYPE "public"."TokenType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."Course" DROP CONSTRAINT "Course_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CourseOutcome" DROP CONSTRAINT "CourseOutcome_CourseOverviewId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CourseOverview" DROP CONSTRAINT "CourseOverview_courseId_fkey";

-- DropForeignKey
ALTER TABLE "public"."WhoWillTakeThisCourse" DROP CONSTRAINT "WhoWillTakeThisCourse_CourseOverviewId_fkey";

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "phone" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."Course";

-- DropTable
DROP TABLE "public"."CourseOutcome";

-- DropTable
DROP TABLE "public"."CourseOverview";

-- DropTable
DROP TABLE "public"."Department";

-- DropTable
DROP TABLE "public"."WhoWillTakeThisCourse";
