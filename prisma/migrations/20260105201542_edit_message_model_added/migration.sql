-- CreateTable
CREATE TABLE "EditMessage" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "editedAt" TIMESTAMP(3),
    "senderId" INTEGER NOT NULL,
    "threadId" INTEGER NOT NULL,

    CONSTRAINT "EditMessage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EditMessage" ADD CONSTRAINT "EditMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditMessage" ADD CONSTRAINT "EditMessage_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "ChatThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;
