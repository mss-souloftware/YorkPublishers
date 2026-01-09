/*
  Warnings:

  - You are about to drop the `EditMessage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "EditMessage" DROP CONSTRAINT "EditMessage_senderId_fkey";

-- DropForeignKey
ALTER TABLE "EditMessage" DROP CONSTRAINT "EditMessage_threadId_fkey";

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "editedAt" TIMESTAMP(3);

-- DropTable
DROP TABLE "EditMessage";
