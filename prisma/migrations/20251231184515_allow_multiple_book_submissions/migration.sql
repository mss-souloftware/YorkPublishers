-- DropIndex
DROP INDEX "BookSubmission_userId_key";

-- CreateIndex
CREATE INDEX "BookSubmission_status_idx" ON "BookSubmission"("status");
