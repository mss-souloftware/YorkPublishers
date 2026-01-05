import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function POST(
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

  const thread = await prisma.chatThread.findUnique({
    where: { id: threadId },
    include: {
      participants: { select: { id: true } },
      creator: { select: { id: true } },
    },
  });

  if (!thread) {
    return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
  }

  const userId = Number(session.user.id);
  const isAdmin = session.user.role === 'ADMIN';
  const isCreator = thread.creator.id === userId;
  const isParticipant = thread.participants.some(p => p.id === userId);

  if (!isAdmin && !isCreator && !isParticipant) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { content } = await request.json();
  if (!content?.trim()) {
    return NextResponse.json({ error: 'Message content required' }, { status: 400 });
  }

  const message = await prisma.message.create({
    data: {
      content: content.trim(),
      senderId: userId,
      threadId,
    },
    include: {
      sender: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(message, { status: 201 });
}