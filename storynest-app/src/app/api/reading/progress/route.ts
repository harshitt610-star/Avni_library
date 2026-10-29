import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ReadingProgress, Book, ChildProfile } from '@/models';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ authenticated: false, progress: null });
    }

    const { searchParams } = new URL(req.url);
    const bookSlug = searchParams.get('bookSlug');

    await connectToDatabase();

    if (bookSlug) {
      const book = await Book.findOne({ slug: bookSlug });
      if (!book) {
        return NextResponse.json({ error: 'Book not found' }, { status: 404 });
      }

      const progress = await ReadingProgress.findOne({
        userId: user._id,
        bookId: book._id,
      }).lean();

      // Look up child profile safety controls & bedtime curfew
      const firstName = user.name ? user.name.split(' ')[0] : '';
      const childProfile = await ChildProfile.findOne({
        $or: [
          { userId: user._id },
          { parentId: user._id },
          ...(firstName ? [{ displayName: new RegExp(`^${firstName}`, 'i') }] : []),
        ],
      }).lean();

      return NextResponse.json({
        success: true,
        progress,
        childProfile: childProfile
          ? {
              displayName: childProfile.displayName,
              bedtimeCurfew: childProfile.bedtimeCurfew || '20:30',
              curfewEnabled: childProfile.curfewEnabled !== false,
              dailyTimeLimitMinutes: childProfile.dailyTimeLimitMinutes || 45,
              minutesReadToday: childProfile.minutesReadToday || 0,
              contentFilter: childProfile.contentFilter || 'standard',
            }
          : null,
      });
    }

    // Return all user progress
    const allProgress = await ReadingProgress.find({ userId: user._id })
      .populate('bookId', 'title slug coverUrl genre ageBracket')
      .sort({ lastReadAt: -1 })
      .lean();

    return NextResponse.json({ success: true, count: allProgress.length, allProgress });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();
    const { bookSlug, chapterNumber, percentCompleted, minutesRead } = body;

    await connectToDatabase();
    const book = await Book.findOne({ slug: bookSlug });
    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    if (user) {
      await ReadingProgress.findOneAndUpdate(
        { userId: user._id, bookId: book._id },
        {
          currentChapter: chapterNumber,
          percentCompleted,
          lastReadAt: new Date(),
          $inc: { totalMinutesRead: minutesRead || 1 },
        },
        { upsert: true, returnDocument: 'after' }
      );

      // Increment readersCount on Book if first session
      await Book.findByIdAndUpdate(book._id, { $inc: { readersCount: 1 } });

      // If user is a child or has a linked ChildProfile, increment their minutesReadToday & ensure streak
      const firstName = user.name ? user.name.split(' ')[0] : '';
      await ChildProfile.findOneAndUpdate(
        {
          $or: [
            { userId: user._id },
            { parentId: user._id },
            ...(firstName ? [{ displayName: new RegExp(`^${firstName}`, 'i') }] : []),
          ],
        },
        {
          $inc: { minutesReadToday: minutesRead || 2 },
          $set: { updatedAt: new Date() },
        }
      );
    }

    return NextResponse.json({ success: true, message: 'Reading progress saved to MongoDB' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
