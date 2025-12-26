// app/api/users/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import bcrypt from 'bcryptjs';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: {
        select: {
          id: true,
          name: true,
        },
      },
      profile: true,
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { name, email, password, roleId, status } = body;

  // Required fields
  if (!email || !password || roleId == null) {
    return NextResponse.json({ error: 'Missing required fields: email, password, roleId' }, { status: 400 });
  }

  // Basic validation
  if (typeof email !== 'string' || email.trim() === '') {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }

  const trimmedEmail = email.trim().toLowerCase();

  let parsedRoleId: number;
  try {
    parsedRoleId = Number(roleId);
    if (!Number.isInteger(parsedRoleId) || parsedRoleId <= 0) {
      throw new Error();
    }
  } catch {
    return NextResponse.json({ error: 'Invalid roleId – must be a positive integer' }, { status: 400 });
  }

  // Optional: Verify role exists
  const roleExists = await prisma.role.findUnique({
    where: { id: parsedRoleId },
    select: { id: true },
  });

  if (!roleExists) {
    return NextResponse.json({ error: 'Selected role does not exist' }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  try {
    const user = await prisma.user.create({
      data: {
        name: name ? name.trim() : null,
        email: trimmedEmail,
        password: hashedPassword,
        roleId: parsedRoleId,
        status: status || 'Active',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }
    console.error('Create user error:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}