// lib/logActivity.ts
import {prisma} from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

type LogOptions = {
  action: string;
  details?: string;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export async function logActivity({ action, details, ipAddress, userAgent }: LogOptions) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return;

    const userId = Number(session.user.id);

    await prisma.userActivity.create({
      data: {
        userId,
        action,
        details,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}