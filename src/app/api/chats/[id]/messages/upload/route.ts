// app/api/chats/[id]/messages/upload/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';
import { mkdir } from 'fs/promises';


const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads');

try {
  await mkdir(UPLOAD_DIR, { recursive: true });
} catch (e) {
  console.error('Error creating upload directory', e);
}


const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  console.log('Session User ID:', session?.user?.id);

  // if (!session?.user?.id) {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // }


  const threadId = Number(id);
  if (isNaN(threadId)) {
    return NextResponse.json({ error: 'Invalid thread ID' }, { status: 400 });
  }

  // Check thread access (same as your POST message)
  const thread = await prisma.chatThread.findUnique({
    where: { id: threadId },
    include: { participants: { select: { id: true } } },
  });

  if (!thread?.participants.some(p => p.id === Number(session?.user?.id) || session?.user?.role === 'ADMIN')) {
    console.error('User not a participant in the thread', session?.user?.id, threadId);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const formData = await request.formData();
  const files = formData.getAll('files') as File[];

  if (files.length === 0) {
    return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
  }

  const uploadedFiles: { url: string; name: string; type: string; size: number }[] = [];

  for (const file of files) {
    if (!(file instanceof File)) continue;

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `File type ${file.type} not allowed` },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File ${file.name} too large (max 10MB)` },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
  

    const ext = file.name.split('.').pop() || '';
    const filename = `${randomUUID()}.${ext}`;
    const filepath = join(UPLOAD_DIR, filename);

    await writeFile(filepath, buffer);

    uploadedFiles.push({
      url: `/uploads/${filename}`,
      name: file.name,
      type: file.type,
      size: file.size,
    });
  }

  return NextResponse.json({ files: uploadedFiles });
}

export const config = {
  api: {
    bodyParser: false, // Required for file uploads
  },
};