// app/api/chats/[id]/messages/[messageId]/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { differenceInMinutes } from 'date-fns';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; messageId: string }> }
) {
  const { id, messageId } = await params;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: { message: 'Unauthorized' } }, { status: 401 });
  }

  const threadId = Number(id);
  const msgId = Number(messageId);
  const userId = Number(session.user.id); // ← FIXED: proper access

  if (Number.isNaN(threadId) || Number.isNaN(msgId)) {
    return NextResponse.json({ error: { message: 'Invalid parameters' } }, { status: 400 });
  }

  const { content } = await request.json();
  if (typeof content !== 'string' || !content.trim()) {
    return NextResponse.json({ error: { message: 'Content is required' } }, { status: 400 });
  }

  // Fetch message + check ownership + participation in one query
  const message = await prisma.message.findFirst({
    where: {
      id: msgId,
      threadId,
      senderId: userId, // ← Early check: only allow if user is the sender
    },
    select: {
      createdAt: true,
      thread: {
        select: {
          participants: {
            where: { id: userId },
            select: { id: true },
          },
        },
      },
    },
  });

  if (!message) {
    // This now covers: not found, not your message, or not in thread
    return NextResponse.json(
      { error: { message: 'Message not found or you do not have permission to edit it' } },
      { status: 404 }
    );
  }

  // Double-check participation (optional but safe)
  // if (message.thread.participants.length === 0) {
  //   return NextResponse.json(
  //     { error: { message: 'You are not a participant in this chat' } },
  //     { status: 403 }
  //   );
  // }

  const minutesAgo = differenceInMinutes(new Date(), message.createdAt);
  if (minutesAgo > 30) {
    return NextResponse.json(
      { error: { message: 'You can only edit messages within 30 minutes' } },
      { status: 403 }
    );
  }

  const updated = await prisma.message.update({
    where: { id: msgId },
    data: {
      content: content.trim(),
      editedAt: new Date(),
    },
    include: {
      sender: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(updated);
}
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; messageId: string }> }
) {
  const { id, messageId } = await params;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: { message: 'Unauthorized' } }, { status: 401 });
  }

  const userId = Number(session.user.id);
  const threadId = Number(id);
  const msgId = Number(messageId);

  if (Number.isNaN(threadId) || Number.isNaN(msgId)) {
    return NextResponse.json({ error: { message: 'Invalid parameters' } }, { status: 400 });
  }

  const message = await prisma.message.findFirst({
    where: { id: msgId, threadId },
    select: { senderId: true, createdAt: true },
  });

  if (!message) {
    return NextResponse.json({ error: { message: 'Message not found' } }, { status: 404 });
  }

  if (message.senderId !== userId) {
    return NextResponse.json({ error: { message: 'You can only delete your own messages' } }, { status: 403 });
  }

  const minutesAgo = differenceInMinutes(new Date(), message.createdAt);
  if (minutesAgo > 30) {
    return NextResponse.json({ error: { message: 'You can only delete messages within 30 minutes' } }, { status: 403 });
  }

  await prisma.message.delete({ where: { id: msgId } });

  return new NextResponse(null, { status: 204 });
}