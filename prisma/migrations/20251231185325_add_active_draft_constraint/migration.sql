/*
  Warnings:

  - A unique constraint covering the columns `[userId,status]` on the table `BookSubmission` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "BookSubmission_userId_status_key" ON "BookSubmission"("userId", "status");
