/*
  Warnings:

  - A unique constraint covering the columns `[externalId,serviceProvider]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "externalId" TEXT,
ADD COLUMN     "isServiceUser" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "serviceProvider" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_externalId_serviceProvider_key" ON "User"("externalId", "serviceProvider");
