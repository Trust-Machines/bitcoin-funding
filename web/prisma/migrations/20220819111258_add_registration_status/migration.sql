/*
  Warnings:

  - The `registrationStatus` column on the `Dao` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `registrationStatus` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('STARTED', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "Dao" DROP COLUMN "registrationStatus",
ADD COLUMN     "registrationStatus" "RegistrationStatus" NOT NULL DEFAULT 'STARTED';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "registrationStatus",
ADD COLUMN     "registrationStatus" "RegistrationStatus" NOT NULL DEFAULT 'STARTED';
