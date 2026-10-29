import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Book } from '@/models';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';
    const age = searchParams.get('age') || '';
    const genre = searchParams.get('genre') || '';
    const lang = searchParams.get('lang') || '';
    const sort = searchParams.get('sort') || 'popular';

    await connectToDatabase();

    // Only published and non-archived books appear in public library
    const filter: any = {
      isPublished: true,
      isArchived: { $ne: true },
    };

    if (q) {
      // Escape regex special characters to prevent regex injection or crashes
      const sanitized = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { title: { $regex: sanitized, $options: 'i' } },
        { titleHindi: { $regex: sanitized, $options: 'i' } },
        { authorName: { $regex: sanitized, $options: 'i' } },
        { synopsis: { $regex: sanitized, $options: 'i' } },
        { slug: { $regex: sanitized, $options: 'i' } },
      ];
    }

    if (age && age !== 'All') {
      filter.ageBracket = age;
    }

    if (genre && genre !== 'All') {
      filter.genre = { $regex: genre.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
    }

    if (lang && lang !== 'All') {
      filter.language = lang.toLowerCase();
    }

    let sortObj: any = { readersCount: -1 };
    if (sort === 'rating') sortObj = { rating: -1 };
    if (sort === 'newest') sortObj = { createdAt: -1 };
    if (sort === 'quick') sortObj = { readingTimeMinutes: 1 };

    const books = await Book.find(filter).sort(sortObj).lean();

    return NextResponse.json({ success: true, count: books.length, books });
  } catch (error: any) {
    console.error('Public GET Books Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
