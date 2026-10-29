import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Quiz, AuditLog, IQuiz } from '@/models';
import { requireAdmin, handleAuthError } from '@/lib/auth';

export async function GET() {
  try {
    await requireAdmin();
    await connectDB();
    const quizzes = await Quiz.find().populate('bookId', 'title slug').sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, count: quizzes.length, quizzes });
  } catch (error: any) {
    const authResp = handleAuthError(error);
    if (authResp) return authResp;
    console.error('Admin GET Quizzes Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch quizzes' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    await connectDB();
    const body = await request.json();
    const { title, bookTitle, description, rewardStars, starReward, questions, bookId } = body;

    if (!title || !questions || questions.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Title and at least one question are required' },
        { status: 400 }
      );
    }

    const quiz = (await Quiz.create({
      title,
      bookTitle: bookTitle || title,
      description: description || 'Fun educational reading comprehension quiz.',
      rewardStars: Number(rewardStars || starReward) || 30,
      bookId: bookId || undefined,
      questions,
      isPublished: true,
    })) as IQuiz;

    await AuditLog.create({
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'QUIZ_CREATED',
      targetResource: 'Quiz',
      targetId: quiz._id.toString(),
      details: `Created quiz "${quiz.title}" (${questions.length} questions)`,
    });

    return NextResponse.json({ success: true, message: 'Quiz created successfully', quiz });
  } catch (error: any) {
    const authResp = handleAuthError(error);
    if (authResp) return authResp;
    console.error('Admin POST Quiz Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create quiz' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const admin = await requireAdmin();
    await connectDB();
    const body = await request.json();
    const { _id, ...updates } = body;

    if (!_id) {
      return NextResponse.json({ success: false, error: 'Quiz _id is required' }, { status: 400 });
    }

    const updated = await Quiz.findByIdAndUpdate(
      _id,
      { $set: updates },
      { returnDocument: 'after' }
    );

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Quiz not found' }, { status: 404 });
    }

    await AuditLog.create({
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'QUIZ_UPDATED',
      targetResource: 'Quiz',
      targetId: _id,
      details: `Updated quiz "${updated.title}"`,
    });

    return NextResponse.json({ success: true, message: 'Quiz updated successfully', quiz: updated });
  } catch (error: any) {
    const authResp = handleAuthError(error);
    if (authResp) return authResp;
    console.error('Admin PUT Quiz Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update quiz' },
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
      return NextResponse.json({ success: false, error: 'Quiz id is required' }, { status: 400 });
    }

    const quiz = await Quiz.findByIdAndDelete(id);
    if (!quiz) {
      return NextResponse.json({ success: false, error: 'Quiz not found' }, { status: 404 });
    }

    await AuditLog.create({
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'QUIZ_DELETED',
      targetResource: 'Quiz',
      targetId: id,
      details: `Deleted quiz "${quiz.title}"`,
    });

    return NextResponse.json({ success: true, message: `Quiz "${quiz.title}" deleted from MongoDB` });
  } catch (error: any) {
    const authResp = handleAuthError(error);
    if (authResp) return authResp;
    console.error('Admin DELETE Quiz Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete quiz' },
      { status: 500 }
    );
  }
}
