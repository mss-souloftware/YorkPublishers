import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import {prisma} from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = Number(session.user.id);
    const { name, bio, phone, address, profileImage } = await req.json();

    // Validate inputs (optional fields are nullable)
    if (name && typeof name !== 'string') {
      return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
    }

    // Update user name if provided
    const updateData: { name?: string } = {};
    if (name) updateData.name = name;

    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    // Upsert profile (create if not exists, update if does)
    await prisma.profile.upsert({
      where: { userId },
      update: {
        bio: bio ?? null,
        phone: phone ?? null,
        address: address ?? null,
        profileImage: profileImage ?? null,
      },
      create: {
        userId,
        bio: bio ?? null,
        phone: phone ?? null,
        address: address ?? null,
        profileImage: profileImage ?? null,
      },
    });

    return NextResponse.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}