// app/api/chats/[id]/messages/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Authentication
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const threadId = Number(id);
  if (isNaN(threadId)) {
    return NextResponse.json(
      { error: { message: 'Invalid thread ID' } },
      { status: 400 }
    );
  }

  // Fetch thread with participants and creator
  const thread = await prisma.chatThread.findUnique({
    where: { id: threadId },
    include: {
      participants: { select: { id: true } },
      creator: { select: { id: true } },
    },
  });

  if (!thread) {
    return NextResponse.json(
      { error: { message: 'Thread not found' } },
      { status: 404 }
    );
  }

  // Authorization: must be admin, creator, or participant
  const userId = Number(session.user.id);
  const isAdmin = session.user.role === 'ADMIN';
  const isCreator = thread.creator.id === userId;
  const isParticipant = thread.participants.some((p) => p.id === userId);

  if (!isAdmin && !isCreator && !isParticipant) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  // Parse request body
  let content: string | null = null;
  let attachments: any[] | null = null;

  try {
    const body = await request.json();
    content = body.content?.trim() || null;
    attachments = Array.isArray(body.attachments) ? body.attachments : null;
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    );
  }

  // Validation: must have either content or attachments
  if (!content && (!attachments || attachments.length === 0)) {
    return NextResponse.json(
      { error: 'Message must contain either text or attachments' },
      { status: 400 }
    );
  }

  // Create message in database
  try {
   const message = await prisma.message.create({
  data: {
    content,
    attachments: attachments && attachments.length > 0 ? attachments : undefined,
    senderId: userId,
    threadId,
  },
  include: {
    sender: {
      select: { id: true, name: true },
    },
  },
});


    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    );
  }
}