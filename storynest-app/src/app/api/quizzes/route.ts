import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Quiz } from '@/models';

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const quizId = searchParams.get('id');
    const bookSlug = searchParams.get('bookSlug');

    const query: Record<string, any> = { isPublished: { $ne: false } };
    if (quizId) {
      query._id = quizId;
    }

    const quizzes = await Quiz.find(query)
      .populate('bookId', 'title titleHindi authorName coverUrl genre ageBracket slug readingTimeMinutes')
      .sort({ createdAt: -1 })
      .lean();

    if (bookSlug && quizzes.length > 0) {
      const filtered = quizzes.filter(
        (q: any) => q.bookId?.slug === bookSlug || q.bookSlug === bookSlug
      );
      if (filtered.length > 0) {
        return NextResponse.json({ success: true, count: filtered.length, quizzes: filtered, quiz: filtered[0] });
      }
    }

    return NextResponse.json({
      success: true,
      count: quizzes.length,
      quizzes,
      quiz: quizzes[0] || null,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
