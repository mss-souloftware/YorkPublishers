import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Find valid, non-expired reset record
    const resetRecords = await prisma.passwordReset.findMany({
      where: {
        expires: { gt: new Date() },
      },
    });

    let validRecord = null;
    for (const record of resetRecords) {
      const isMatch = await bcrypt.compare(token, record.token);
      if (isMatch) {
        validRecord = record;
        break;
      }
    }

    if (!validRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 12);

    // Update user's password
    await prisma.user.update({
      where: { id: validRecord.userId },
      data: { password: passwordHash },
    });

    // Delete all reset tokens for this user (prevents reuse)
    await prisma.passwordReset.deleteMany({
      where: { userId: validRecord.userId },
    });

    return NextResponse.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password. Please try again.' },
      { status: 500 }
    );
  }
}