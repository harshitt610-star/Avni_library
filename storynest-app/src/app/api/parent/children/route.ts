import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ChildProfile } from '@/models';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    const user = await requireAuth();
    if (user.role !== 'parent' && user.role !== 'admin') {
      return NextResponse.json({ error: 'Parent or Admin access required' }, { status: 403 });
    }

    await connectToDatabase();
    // Strictly isolate query to current parent's authorized children (or all if admin)
    const filter = user.role === 'admin' ? {} : { parentId: user._id };
    const children = await ChildProfile.find(filter).sort({ createdAt: 1 }).lean();

    return NextResponse.json({ success: true, children });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    if (user.role !== 'parent' && user.role !== 'admin') {
      return NextResponse.json({ error: 'Parent or Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { displayName, ageBracket, avatarEmoji, dailyTimeLimitMinutes } = body;

    if (!displayName || !displayName.trim()) {
      return NextResponse.json({ error: 'Child display name is required' }, { status: 400 });
    }

    await connectToDatabase();

    const child = await ChildProfile.create({
      parentId: user._id,
      displayName: displayName.trim(),
      ageBracket: ageBracket || '6-8',
      avatarEmoji: avatarEmoji || '🌟',
      dailyTimeLimitMinutes: Math.min(180, Math.max(15, Number(dailyTimeLimitMinutes) || 45)),
      readingStreak: 1,
      starsEarned: 10,
      minutesReadToday: 0,
    });

    return NextResponse.json({ success: true, child, message: 'Child profile successfully created under Parent Sanctuary' });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
