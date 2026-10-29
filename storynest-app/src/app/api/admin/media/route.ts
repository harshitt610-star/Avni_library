import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { MediaAsset, AuditLog } from '@/models';
import { requireAdmin, handleAuthError } from '@/lib/auth';
import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif', '.pdf', '.mp3', '.m4a']);
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB limit

export async function GET() {
  try {
    await requireAdmin();
    await connectDB();
    const assets = await MediaAsset.find().sort({ createdAt: -1 }).lean();

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const diskFiles: any[] = [];

    if (existsSync(uploadsDir)) {
      const scanFolder = async (folder: string, subPath = '') => {
        try {
          const entries = await fs.readdir(folder, { withFileTypes: true });
          for (const entry of entries) {
            const fullPath = path.join(folder, entry.name);
            const relUrl = `/uploads${subPath}/${entry.name}`.replace(/\\/g, '/');
            if (entry.isDirectory()) {
              await scanFolder(fullPath, `${subPath}/${entry.name}`);
            } else {
              const stat = await fs.stat(fullPath);
              diskFiles.push({
                _id: 'disk-' + Buffer.from(relUrl).toString('hex').slice(0, 16),
                filename: entry.name,
                url: relUrl,
                fileType: entry.name.endsWith('.pdf') ? 'pdf' : 'image',
                fileSize: stat.size,
                uploadedBy: 'System / Author Upload',
                createdAt: stat.birthtime,
              });
            }
          }
        } catch (e) {
          console.warn('Error reading subfolder:', e);
        }
      };

      await scanFolder(uploadsDir);
    }

    const seenUrls = new Set<string>();
    const combined: any[] = [];

    for (const a of assets) {
      seenUrls.add(a.url);
      combined.push(a);
    }

    for (const df of diskFiles) {
      if (!seenUrls.has(df.url)) {
        combined.push(df);
      }
    }

    return NextResponse.json({ success: true, count: combined.length, assets: combined });
  } catch (error: any) {
    const authResp = handleAuthError(error);
    if (authResp) return authResp;
    console.error('Admin GET Media Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch media assets' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    await connectDB();
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file received' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ success: false, error: 'File size exceeds maximum 20MB limit' }, { status: 400 });
    }

    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        { success: false, error: `Disallowed file type ${ext}. Allowed: ${Array.from(ALLOWED_EXTENSIONS).join(', ')}` },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'media');
    await fs.mkdir(uploadsDir, { recursive: true });

    const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = path.join(uploadsDir, safeName);
    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/media/${safeName}`;

    const asset = await MediaAsset.create({
      filename: file.name,
      url: publicUrl,
      fileType: file.type.startsWith('image/') ? 'image' : file.type.includes('pdf') ? 'pdf' : 'document',
      fileSize: file.size,
      uploadedBy: admin.name,
    });

    await AuditLog.create({
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'MEDIA_UPLOADED',
      targetResource: 'MediaAsset',
      targetId: asset._id.toString(),
      details: `Uploaded asset "${file.name}" to ${publicUrl}`,
    });

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      asset,
    });
  } catch (error: any) {
    const authResp = handleAuthError(error);
    if (authResp) return authResp;
    console.error('Admin POST Media Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Media upload failed' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const admin = await requireAdmin();
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Asset id is required' }, { status: 400 });
    }

    if (!id.startsWith('disk-')) {
      const asset = await MediaAsset.findByIdAndDelete(id);
      if (asset) {
        try {
          const filePath = path.join(process.cwd(), 'public', asset.url);
          if (existsSync(filePath)) {
            await fs.unlink(filePath);
          }
        } catch (e) {
          console.warn('Could not delete disk file:', e);
        }

        await AuditLog.create({
          adminName: admin.name,
          adminEmail: admin.email,
          action: 'MEDIA_DELETED',
          targetResource: 'MediaAsset',
          targetId: id,
          details: `Deleted asset "${asset.filename}" (${asset.url})`,
        });
      }
    }

    return NextResponse.json({ success: true, message: 'Media asset deleted successfully' });
  } catch (error: any) {
    const authResp = handleAuthError(error);
    if (authResp) return authResp;
    console.error('Admin DELETE Media Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete media asset' },
      { status: 500 }
    );
  }
}
