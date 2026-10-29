import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { PublishingRequest, User } from '@/models';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();
    const { authorName, authorEmail, packageTier, notes } = body;

    if (!authorName || !authorEmail || !packageTier) {
      return NextResponse.json({ error: 'Name, email, and package selection are required' }, { status: 400 });
    }

    await connectToDatabase();

    const request = await PublishingRequest.create({
      authorId: user?._id || new (await import('mongoose')).Types.ObjectId(),
      authorName,
      authorEmail,
      packageTier,
      notes,
      status: 'PENDING',
    });

    await (await import('@/models')).Notification.create({
      targetRole: 'admin',
      title: 'New Publishing Package Inquiry 📚',
      message: `${authorName} (${authorEmail}) requested the "${packageTier}" publishing package.`,
      link: '/admin',
      type: 'info',
    });

    return NextResponse.json({
      success: true,
      requestId: request._id.toString(),
      message: 'Publishing consultation request submitted to our editorial desk!',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
