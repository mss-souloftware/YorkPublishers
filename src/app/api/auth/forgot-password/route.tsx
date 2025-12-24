import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { render } from '@react-email/render';
import PasswordResetEmail from '@/mails/PasswordResetEmail';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: Number(process.env.MAILTRAP_PORT),
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
});

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Security best practice: don't reveal if email exists
      return NextResponse.json({ message: 'If the email exists, a reset link has been sent.' });
    }

    // Generate random token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = await bcrypt.hash(rawToken, 12);

    const expires = new Date(Date.now() + 3600000); // 1 hour

    // Save hashed token to DB
    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        token: tokenHash,
        expires,
      },
    });

    // Send plain token in URL
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password/${rawToken}`;

    const emailHtml = await render(
      <PasswordResetEmail resetUrl={resetUrl} companyName="York Publishing Co." />
    );

    await transporter.sendMail({
      from: '"York Publishing Co." <no-reply@yorkpublishers.com>',
      to: email,
      subject: 'Reset Your Password',
      html: emailHtml,
    });

    return NextResponse.json({ message: 'Password reset email sent successfully' });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Failed to send reset email. Please try again later.' },
      { status: 500 }
    );
  }
}