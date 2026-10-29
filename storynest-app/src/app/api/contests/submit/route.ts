import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Manuscript, Notification } from '@/models';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();
    const { storyTitle, authorName, age, parentEmail, storyContent } = body;

    if (!storyTitle || !storyContent || !parentEmail) {
      return NextResponse.json(
        { error: 'Story title, content, and parent email are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const submission = await Manuscript.create({
      authorId: user?._id || new (await import('mongoose')).Types.ObjectId(),
      authorName: authorName || user?.name || 'Young Author',
      authorEmail: parentEmail.toLowerCase().trim(),
      title: storyTitle.trim(),
      synopsis: storyContent.slice(0, 300) + '...',
      targetAge: age ? `${age} yrs` : '8-12',
      genre: 'Young Authors Arena Competition',
      wordCount: storyContent.trim().split(/\s+/).length,
      status: 'SUBMITTED',
      manuscriptFileUrl: 'text://contest-submission',
      reviewerNotes: `Contest Submission for Young Authors Arena. Full text:\n\n${storyContent}`,
    });

    await Notification.create({
      targetRole: 'admin',
      title: 'Young Authors Arena Entry 🏆',
      message: `"${storyTitle}" submitted by ${authorName || 'Young Writer'} (${parentEmail})`,
      link: '/admin',
      type: 'review',
    });

    return NextResponse.json({
      success: true,
      message: 'Your story has been submitted to the Young Authors Arena editorial contest!',
      submissionId: submission._id.toString(),
    });
  } catch (error: any) {
    console.error('Contest submission error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
