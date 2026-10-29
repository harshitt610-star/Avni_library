import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Quiz, QuizAttempt, ChildProfile } from '@/models';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();
    const { quizId, answers, userName } = body;

    await connectToDatabase();
    let quiz = null;
    const mongoose = (await import('mongoose')).default;
    if (quizId && mongoose.isValidObjectId(quizId)) {
      quiz = await Quiz.findById(quizId);
    }
    if (!quiz && quizId) {
      quiz = await Quiz.findOne({
        $or: [
          { bookSlug: quizId },
          { bookTitle: new RegExp(quizId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
        ],
      });
    }
    if (!quiz) {
      quiz = await Quiz.findOne({ isPublished: true });
    }
    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    let correctCount = 0;
    const results = quiz.questions.map((q: any) => {
      const selected = answers ? answers[q.id] : undefined;
      const isCorrect = selected === q.correctIndex;
      if (isCorrect) correctCount++;
      return {
        id: q.id,
        isCorrect,
        correctIndex: q.correctIndex,
        explanation: q.explanation,
      };
    });

    const total = quiz.questions.length;
    const passed = correctCount >= Math.ceil(total * 0.6);
    const starsAwarded = passed ? quiz.rewardStars : Math.round(quiz.rewardStars * 0.4);

    // Resolve associated child profile
    let childProfile = null;
    if (user) {
      if (user.role === 'parent') {
        childProfile = await ChildProfile.findOne({ parentId: user._id });
      } else {
        const firstName = user.name ? user.name.split(' ')[0] : '';
        childProfile = await ChildProfile.findOne({
          $or: [
            { displayName: user.name },
            ...(firstName ? [{ displayName: new RegExp(`^${firstName}`, 'i') }] : []),
            { parentId: user._id },
          ],
        });
      }
    }

    // Save attempt
    const attempt = await QuizAttempt.create({
      quizId: quiz._id,
      userId: user?._id,
      childProfileId: childProfile?._id,
      userName: userName || user?.name || 'Curious Reader',
      score: correctCount,
      totalQuestions: total,
      passed,
      starsAwarded,
    });

    // Credit stars to user's child profile
    if (childProfile) {
      await ChildProfile.findByIdAndUpdate(childProfile._id, {
        $inc: { starsEarned: starsAwarded },
      });
    }

    return NextResponse.json({
      success: true,
      attemptId: attempt._id.toString(),
      quizId: quiz._id.toString(),
      quizTitle: quiz.title,
      bookTitle: quiz.bookTitle || quiz.title,
      score: correctCount,
      total,
      passed,
      starsAwarded,
      results,
    });
  } catch (error: any) {
    console.error('Quiz submit error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
