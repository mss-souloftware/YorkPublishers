-- CreateTable
CREATE TABLE "BookSubmission" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "fullName" TEXT,
    "penName" TEXT,
    "mobilePhone" TEXT,
    "homePhone" TEXT,
    "address" TEXT,
    "email" TEXT,
    "title" TEXT,
    "subtitle" TEXT,
    "aboutAuthor" TEXT,
    "photoCount" INTEGER DEFAULT 0,
    "copyrightedMaterial" TEXT,
    "targetAudience" TEXT,
    "dedications" TEXT,
    "acknowledgements" TEXT,
    "backCoverBlurb" TEXT,
    "categories" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "coverIdea" TEXT,
    "coverNotes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BookSubmission_userId_idx" ON "BookSubmission"("userId");

-- CreateIndex
CREATE INDEX "BookSubmission_createdAt_idx" ON "BookSubmission"("createdAt");

-- AddForeignKey
ALTER TABLE "BookSubmission" ADD CONSTRAINT "BookSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
