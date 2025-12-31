/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `BookSubmission` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "BookSubmission_userId_key" ON "BookSubmission"("userId");
