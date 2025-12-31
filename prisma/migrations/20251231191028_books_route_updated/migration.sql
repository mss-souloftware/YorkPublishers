-- DropIndex
DROP INDEX "BookSubmission_userId_status_key";

-- CreateIndex
CREATE INDEX "BookSubmission_userId_status_idx" ON "BookSubmission"("userId", "status");
