import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = Number(session.user.id);
  const isAdmin = session.user.role === 'ADMIN';


  const threads = await prisma.chatThread.findMany({
    where: isAdmin
      ? { creatorId: userId }
      : { participants: { some: { id: userId } } },
    include: {
      participants: {
        select: { id: true, name: true, email: true },
      },
      messages: {
        take: 1,
        orderBy: { createdAt: 'desc' },
        select: { content: true, createdAt: true },
      },
      creator: {
        select: { id: true, name: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Calculate unread count for each thread
  const threadsWithUnread = await Promise.all(
    threads.map(async (thread) => {
      // Get last read time for this user in this thread
      const receipt = await prisma.readReceipt.findUnique({
        where: {
          userId_threadId: {
            userId,
            threadId: thread.id,
          },
        },
      });

      const lastReadTime = receipt?.lastReadAt || new Date(0); // If never read, assume epoch

      // Count messages newer than last read AND not sent by self
      const unreadCount = await prisma.message.count({
        where: {
          threadId: thread.id,
          createdAt: { gt: lastReadTime },
          senderId: { not: userId }, // Don't count user's own messages as unread
        },
      });

      // Inside threadsWithUnread map in GET /api/chats
const otherParticipants = thread.participants.filter(p => p.id !== userId);
const displayName = thread.title || 
  (otherParticipants.length > 0 
    ? otherParticipants.map(p => p.name || p.email).join(', ')
    : thread.creator?.name  || 'Unknown');

const avatarParticipant = otherParticipants[0] || thread.creator || thread.participants[0];

return {
  ...thread,
  unreadCount,
  lastMessage: thread.messages[0] || null,
  displayName,
  avatarParticipant, // { id, name, email }
  messages: undefined,
};
    
    })
  );

  return NextResponse.json(threadsWithUnread);
}
// app/api/chats/route.ts → POST handler
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { participantIds, title } = await request.json();
  if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
    return NextResponse.json({ error: 'At least one participant required' }, { status: 400 });
  }

  try {
    const allParticipantIds = [...participantIds, Number(session.user.id)]; 

    const thread = await prisma.chatThread.create({
      data: {
        title,
        creatorId: Number(session.user.id),
        participants: {
          connect: participantIds.map((id: number) => ({ id })),
        },
        readReceipts: {
          createMany: {
            data: allParticipantIds.map((userId: number) => ({
              userId,
              lastReadAt: new Date(), 
            })),
          },
        },
      },
      include: {
        participants: { select: { id: true, name: true, email: true } },
        messages: { take: 1, orderBy: { createdAt: 'desc' } },
        readReceipts: true,
      },
    });

    return NextResponse.json(thread, { status: 201 });
  } catch (error) {
    console.error('Create thread error:', error);
    return NextResponse.json({ error: 'Failed to create thread' }, { status: 500 });
  }
}