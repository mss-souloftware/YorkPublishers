import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; 
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, password, name, roleId = 2 } = await request.json();

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name, roleId },
    });

    return NextResponse.json({ message: 'User created successfully' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}