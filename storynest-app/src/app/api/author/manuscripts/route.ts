import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Manuscript, Notification } from '@/models';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    const user = await requireAuth();
    if (user.role !== 'author' && user.role !== 'admin') {
      return NextResponse.json({ error: 'Author or Admin access required' }, { status: 403 });
    }

    await connectToDatabase();
    // Authors only see their own manuscripts; admins can inspect all
    const filter = user.role === 'admin' ? {} : { authorId: user._id };
    const manuscripts = await Manuscript.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, count: manuscripts.length, manuscripts });
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
    if (user.role !== 'author' && user.role !== 'admin') {
      return NextResponse.json({ error: 'Author account required to submit manuscripts' }, { status: 403 });
    }

    const body = await req.json();
    const { title, titleHindi, synopsis, targetAge, genre, wordCount, manuscriptFileUrl, coverFileUrl } = body;

    if (!title || !synopsis) {
      return NextResponse.json({ error: 'Title and synopsis are required' }, { status: 400 });
    }

    await connectToDatabase();

    const newManuscript = await Manuscript.create({
      authorId: user._id,
      authorName: user.name,
      authorEmail: user.email,
      title: title.trim(),
      titleHindi: titleHindi?.trim(),
      synopsis: synopsis.trim(),
      targetAge: targetAge || '6-8',
      genre: genre || 'Adventure',
      wordCount: Number(wordCount) || 1500,
      status: 'SUBMITTED',
      manuscriptFileUrl: manuscriptFileUrl || '/uploads/manuscripts/draft.pdf',
      coverFileUrl: coverFileUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    });

    // Create an alert notification for Editorial Admins
    await Notification.create({
      targetRole: 'admin',
      title: 'New Manuscript Submitted 📬',
      message: `"${newManuscript.title}" has been submitted by ${user.name} and entered the editorial review queue.`,
      link: '/admin',
      type: 'review',
    });

    return NextResponse.json({
      success: true,
      manuscript: newManuscript,
      message: 'Manuscript submitted successfully to editorial decision queue!',
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
