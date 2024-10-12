/*
  Warnings:

  - The primary key for the `Profile` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Profile` table. All the data in the column will be lost.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[employeeId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `creatorId` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `Profile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `employeeId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- DropForeignKey
ALTER TABLE "Attendance" DROP CONSTRAINT "Attendance_userId_fkey";

-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_userId_fkey";

-- DropForeignKey
ALTER TABLE "_UserEvents" DROP CONSTRAINT "_UserEvents_B_fkey";

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "creatorId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_pkey",
DROP COLUMN "id",
ADD COLUMN     "gender" "Gender" NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "id",
ADD COLUMN     "employeeId" INTEGER NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "User_employeeId_key" ON "User"("employeeId");

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("employeeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("employeeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("employeeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserEvents" ADD CONSTRAINT "_UserEvents_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("employeeId") ON DELETE CASCADE ON UPDATE CASCADE;
