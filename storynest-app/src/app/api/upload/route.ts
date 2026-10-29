import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { requireAuth } from '@/lib/auth';

const ALLOWED_EXTENSIONS: Record<string, string[]> = {
  cover: ['.jpg', '.jpeg', '.png', '.webp'],
  manuscript: ['.pdf', '.docx', '.epub', '.txt'],
};

const MAX_SIZES: Record<string, number> = {
  cover: 5 * 1024 * 1024, // 5MB
  manuscript: 25 * 1024 * 1024, // 25MB
};

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const type = (formData.get('type') as string) || 'manuscript'; // 'manuscript' or 'cover'

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const category = type === 'cover' ? 'cover' : 'manuscript';
    const maxSize = MAX_SIZES[category];
    const allowed = ALLOWED_EXTENSIONS[category];

    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File size exceeds the ${(maxSize / (1024 * 1024)).toFixed(0)}MB limit` },
        { status: 400 }
      );
    }

    const rawExt = path.extname(file.name).toLowerCase();
    const ext = rawExt || (category === 'cover' ? '.jpg' : '.pdf');

    if (!allowed.includes(ext)) {
      return NextResponse.json(
        { error: `Disallowed file extension "${ext}". Allowed: ${allowed.join(', ')}` },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize filename and create unique timestamped name
    const safeName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    const subfolder = category === 'cover' ? 'covers' : 'manuscripts';
    const uploadDirPath = path.join(process.cwd(), 'public', 'uploads', subfolder);
    await mkdir(uploadDirPath, { recursive: true });

    const relativePath = `/uploads/${subfolder}/${safeName}`;
    const absolutePath = path.join(uploadDirPath, safeName);

    await writeFile(absolutePath, buffer);

    return NextResponse.json({
      success: true,
      url: relativePath,
      filename: file.name,
      size: file.size,
      uploadedBy: user.name,
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Authentication required for uploading files' }, { status: 401 });
    }
    console.error('File upload error:', error);
    return NextResponse.json({ error: error.message || 'File upload failed' }, { status: 500 });
  }
}
