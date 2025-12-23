// app/api/roles/[id]/permissions/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const roleId = Number(id);

  if (!Number.isInteger(roleId)) {
    return NextResponse.json(
      { error: 'Invalid role ID' },
      { status: 400 }
    );
  }

  const permissions = await prisma.permission.findMany({
    where: {
      roles: {
        some: { roleId },
      },
    },
    select: {
      id: true,
      name: true,
      description: true,
    },
  });

  return NextResponse.json(permissions);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const roleId = Number(id);

  if (!Number.isInteger(roleId)) {
    return NextResponse.json(
      { error: 'Invalid role ID' },
      { status: 400 }
    );
  }

  const { permissionIds }: { permissionIds: number[] } = await request.json();

  try {
    await prisma.$transaction(async (tx) => {
      // Delete existing
      await tx.rolePermission.deleteMany({
        where: { roleId },
      });

      // Create new
      if (permissionIds.length > 0) {
        await tx.rolePermission.createMany({
          data: permissionIds.map(permissionId => ({
            roleId,
            permissionId,
          })),
        });
      }
    });

    return NextResponse.json({ message: 'Permissions updated' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update permissions' }, { status: 500 });
  }
}