// app/api/chats/[id]/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const threadId = Number(id);
  if (isNaN(threadId)) {
    return NextResponse.json({ error: 'Invalid thread ID' }, { status: 400 });
  }

  // Fetch the thread to check participation
  const thread = await prisma.chatThread.findUnique({
    where: { id: threadId },
    include: {
      participants: {
        select: { id: true },
      },
      creator: {
        select: { id: true },
      },
    },
  });

  if (!thread) {
    return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
  }

  const userId = Number(session.user.id);

  // Allow access if:
  // - User is ADMIN, OR
  // - User is the creator (admin who started it), OR
  // - User is in participants
  const isAdmin = session.user.role === 'ADMIN';
  const isCreator = thread.creator.id === userId;
  const isParticipant = thread.participants.some(p => p.id === userId);

  if (!isAdmin && !isCreator && !isParticipant) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  // Mark as read for current user
  await prisma.readReceipt.upsert({
    where: {
      userId_threadId: {
        userId,
        threadId,
      },
    },
    update: { lastReadAt: new Date() },
    create: { userId, threadId, lastReadAt: new Date() },
  });

  // Fetch messages
  const messages = await prisma.message.findMany({
    where: { threadId },
    include: {
      sender: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json(messages);
}