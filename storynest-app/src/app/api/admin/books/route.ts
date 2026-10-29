import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Book, AuditLog, Quiz } from '@/models';
import { requireAdmin, handleAuthError } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    await requireAdmin();
    await connectDB();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const age = searchParams.get('age');
    const status = searchParams.get('status');
    const language = searchParams.get('language');

    const filter: Record<string, any> = {};

    if (search) {
      const sanitized = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { title: { $regex: sanitized, $options: 'i' } },
        { authorName: { $regex: sanitized, $options: 'i' } },
        { genre: { $regex: sanitized, $options: 'i' } },
      ];
    }

    if (age && age !== 'all') {
      filter.ageBracket = age;
    }

    if (language && language !== 'all') {
      filter.language = language;
    }

    if (status) {
      if (status === 'published') {
        filter.isPublished = true;
        filter.isArchived = { $ne: true };
      } else if (status === 'draft') {
        filter.isDraft = true;
      } else if (status === 'archived') {
        filter.isArchived = true;
      }
    }

    const books = await Book.find(filter).sort({ createdAt: -1 }).lean();

    // Attach companion quizzes
    const bookIds = books.map((b: any) => b._id);
    const quizzes = await Quiz.find({ bookId: { $in: bookIds } }).lean();
    const quizMap = new Map();
    quizzes.forEach((q: any) => quizMap.set(q.bookId?.toString(), q));

    const booksWithQuiz = books.map((b: any) => {
      const quiz = quizMap.get(b._id.toString()) || null;
      return {
        ...b,
        companionQuiz: quiz,
        hasCompanionQuiz: !!quiz || !!b.hasCompanionQuiz,
      };
    });

    return NextResponse.json({ success: true, count: booksWithQuiz.length, books: booksWithQuiz });
  } catch (error: any) {
    const authResp = handleAuthError(error);
    if (authResp) return authResp;
    console.error('Admin GET Books Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch books' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    await connectDB();
    const body = await request.json();

    const {
      title,
      titleHindi,
      slug,
      authorName,
      authorBio,
      synopsis,
      synopsisHindi,
      coverUrl,
      audioPreviewUrl,
      pdfUrl,
      isbn,
      tags,
      ageBracket,
      genre,
      language,
      readingTimeMinutes,
      chapters,
      isPublished,
      isDraft,
      featured,
      hasCompanionQuiz,
      companionQuiz,
    } = body;

    if (!title || !authorName || !synopsis) {
      return NextResponse.json(
        { success: false, error: 'Title, Author Name, and Synopsis are required' },
        { status: 400 }
      );
    }

    // Auto-generate clean slug if not provided
    const cleanSlug =
      slug?.trim() ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') + `-${Date.now().toString().slice(-4)}`;

    // Verify unique slug
    const existing = await Book.findOne({ slug: cleanSlug });
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'A book with this slug already exists. Please adjust the title or slug.' },
        { status: 400 }
      );
    }

    const quizEnabled = !!(hasCompanionQuiz || (companionQuiz && companionQuiz.enabled));

    const book = await Book.create({
      title,
      titleHindi,
      slug: cleanSlug,
      authorName,
      authorBio: authorBio || 'StoryNest Literary Author',
      synopsis,
      synopsisHindi,
      coverUrl: coverUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop',
      audioPreviewUrl: audioPreviewUrl || undefined,
      pdfUrl,
      isbn: isbn || `978-0-${Math.floor(100000 + Math.random() * 900000)}`,
      tags: tags || ['Children Fiction', 'Illustrated'],
      ageBracket: ageBracket || '6-8',
      genre: genre || 'Adventure & Curiosity',
      language: language || 'bilingual',
      readingTimeMinutes: Number(readingTimeMinutes) || 12,
      chaptersCount: chapters?.length || 1,
      chapters: chapters && chapters.length > 0 ? chapters : [
        {
          chapterNumber: 1,
          title: 'Chapter 1: The Beginning',
          contentEn: 'Once upon a time in a world woven of starlight and paper...',
          contentHi: 'एक समय की बात है, तारों और कागज़ की एक जादुई दुनिया में...',
        }
      ],
      isPublished: isPublished ?? true,
      isDraft: isDraft ?? false,
      isArchived: false,
      featured: featured ?? false,
      hasCompanionQuiz: quizEnabled,
      rating: 5.0,
      readersCount: 1,
      publishedYear: new Date().getFullYear(),
    });

    // Create companion quiz if requested
    let createdQuiz = null;
    if (quizEnabled && companionQuiz?.questions?.length > 0) {
      createdQuiz = await Quiz.create({
        bookId: book._id,
        bookSlug: book.slug,
        bookTitle: book.title,
        title: companionQuiz.title || `${book.title} Companion Reading Quiz`,
        description: companionQuiz.description || `Test your knowledge and reading comprehension of ${book.title}!`,
        rewardStars: Number(companionQuiz.rewardStars) || 25,
        questions: companionQuiz.questions.map((q: any, idx: number) => ({
          id: q.id || `q-${idx + 1}-${Date.now()}`,
          questionEn: q.questionEn,
          questionHi: q.questionHi || '',
          optionsEn: q.optionsEn || [],
          optionsHi: q.optionsHi || [],
          correctIndex: Number(q.correctIndex) || 0,
          explanation: q.explanation || '',
        })),
        isPublished: true,
      });
    }

    // Create Audit Log with verified admin
    await AuditLog.create({
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'BOOK_CREATED',
      targetResource: 'Book',
      targetId: book._id.toString(),
      details: `Created new book "${book.title}" (slug: ${book.slug})${quizEnabled ? ' with companion quiz' : ''}`,
    });

    return NextResponse.json({
      success: true,
      message: 'Book created successfully in MongoDB',
      book: { ...book.toObject(), companionQuiz: createdQuiz },
    });
  } catch (error: any) {
    const authResp = handleAuthError(error);
    if (authResp) return authResp;
    console.error('Admin POST Book Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create book' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const admin = await requireAdmin();
    await connectDB();
    const body = await request.json();
    const { _id, companionQuiz, ...updates } = body;

    if (!_id) {
      return NextResponse.json(
        { success: false, error: 'Book _id is required for updates' },
        { status: 400 }
      );
    }

    if (updates.chapters) {
      updates.chaptersCount = updates.chapters.length;
    }

    if (companionQuiz !== undefined) {
      updates.hasCompanionQuiz = !!companionQuiz?.enabled;
    }

    const updatedBook = await Book.findByIdAndUpdate(
      _id,
      { $set: updates },
      { returnDocument: 'after' }
    );

    if (!updatedBook) {
      return NextResponse.json({ success: false, error: 'Book not found' }, { status: 404 });
    }

    // Synchronize Companion Quiz
    let attachedQuiz = null;
    if (companionQuiz?.enabled && companionQuiz.questions?.length > 0) {
      attachedQuiz = await Quiz.findOneAndUpdate(
        { bookId: _id },
        {
          $set: {
            bookId: _id,
            bookSlug: updatedBook.slug,
            bookTitle: updatedBook.title,
            title: companionQuiz.title || `${updatedBook.title} Companion Reading Quiz`,
            description: companionQuiz.description || `Test your knowledge and comprehension of ${updatedBook.title}!`,
            rewardStars: Number(companionQuiz.rewardStars) || 25,
            questions: companionQuiz.questions.map((q: any, idx: number) => ({
              id: q.id || `q-${idx + 1}-${Date.now()}`,
              questionEn: q.questionEn,
              questionHi: q.questionHi || '',
              optionsEn: q.optionsEn || [],
              optionsHi: q.optionsHi || [],
              correctIndex: Number(q.correctIndex) || 0,
              explanation: q.explanation || '',
            })),
            isPublished: true,
          },
        },
        { upsert: true, returnDocument: 'after' }
      );
    } else if (companionQuiz && companionQuiz.enabled === false) {
      await Quiz.deleteMany({ bookId: _id });
    }

    // Create Audit Log with verified admin
    await AuditLog.create({
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'BOOK_UPDATED',
      targetResource: 'Book',
      targetId: _id,
      details: `Updated book "${updatedBook.title}". Changes: ${Object.keys(updates).join(', ')}`,
    });

    return NextResponse.json({
      success: true,
      message: 'Book updated successfully',
      book: { ...updatedBook.toObject(), companionQuiz: attachedQuiz },
    });
  } catch (error: any) {
    const authResp = handleAuthError(error);
    if (authResp) return authResp;
    console.error('Admin PUT Book Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update book' },
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
      return NextResponse.json({ success: false, error: 'Book id is required' }, { status: 400 });
    }

    const book = await Book.findByIdAndDelete(id);
    if (!book) {
      return NextResponse.json({ success: false, error: 'Book not found' }, { status: 404 });
    }

    // Clean up attached companion quizzes
    await Quiz.deleteMany({ bookId: id });

    // Create Audit Log with verified admin
    await AuditLog.create({
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'BOOK_DELETED',
      targetResource: 'Book',
      targetId: id,
      details: `Deleted book "${book.title}" (${book.slug}) and associated quizzes`,
    });

    return NextResponse.json({ success: true, message: `Book "${book.title}" and any companion quizzes deleted from MongoDB` });
  } catch (error: any) {
    const authResp = handleAuthError(error);
    if (authResp) return authResp;
    console.error('Admin DELETE Book Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete book' },
      { status: 500 }
    );
  }
}
