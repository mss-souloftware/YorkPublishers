import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import cloudinary from '@/lib/cloudinary';
import { prisma } from '@/lib/prisma';
import { Readable } from 'stream';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }



    const userId = Number(session.user.id);

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Convert File → Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const uploadResult: any = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'profiles',
          transformation: [
            { width: 400, height: 400, crop: 'limit' },
            { quality: 'auto' },
            { format: 'webp' },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      Readable.from(buffer).pipe(uploadStream);
    });

    const imageUrl = uploadResult.secure_url;

    // 🔹 Upsert profile (create if missing, update if exists)
    const profile = await prisma.profile.upsert({
      where: {  userId },
      update: {
        profileImage: imageUrl,
      },
      create: {
        userId,
        profileImage: imageUrl,
      },
    });

    return NextResponse.json({
      success: true,
      profileImage: profile.profileImage,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}
