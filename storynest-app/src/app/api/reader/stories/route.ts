import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ChildStory, ChildProfile, User } from '@/models';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const storyId = searchParams.get('id');

    if (storyId) {
      const story = await ChildStory.findById(storyId).lean();
      if (!story) {
        return NextResponse.json({ error: 'Story not found' }, { status: 404 });
      }

      // Authorization: reader can only view their own; parent can view child's; admin can view all
      const isOwner = story.authorId.toString() === user._id.toString();
      const isGuardian = story.guardianId && story.guardianId.toString() === user._id.toString();
      const isAdmin = user.role === 'admin';

      if (!isOwner && !isGuardian && !isAdmin) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }

      return NextResponse.json({ success: true, story });
    }

    // Role-specific list retrieval
    if (user.role === 'reader') {
      const stories = await ChildStory.find({ authorId: user._id })
        .sort({ updatedAt: -1 })
        .lean();
      return NextResponse.json({ success: true, stories });
    }

    if (user.role === 'parent') {
      // Find all child user accounts linked to this parent
      const linkedChildren = await ChildProfile.find({ parentId: user._id }).lean();
      const childUserIds = linkedChildren
        .map((c: any) => c.userId)
        .filter(Boolean);

      const stories = await ChildStory.find({
        $or: [
          { guardianId: user._id },
          ...(childUserIds.length > 0 ? [{ authorId: { $in: childUserIds } }] : []),
        ],
      })
        .sort({ updatedAt: -1 })
        .lean();

      return NextResponse.json({ success: true, stories });
    }

    if (user.role === 'admin') {
      const stories = await ChildStory.find({})
        .sort({ updatedAt: -1 })
        .lean();
      return NextResponse.json({ success: true, stories });
    }

    return NextResponse.json({ error: 'Unauthorized role' }, { status: 403 });
  } catch (error: any) {
    console.error('ChildStory GET error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (user.role !== 'reader' && user.role !== 'admin') {
      return NextResponse.json({ error: 'Only young readers can create stories in the sanctuary' }, { status: 403 });
    }

    const body = await req.json();
    const { storyId, title, synopsis, genre, targetAge, chapters, coverUrl, action } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'A story title is required' }, { status: 400 });
    }

    await connectToDatabase();

    // Look up child profile to find linked guardian
    const childProfile = await ChildProfile.findOne({
      $or: [
        { userId: user._id },
        { displayName: user.name },
      ],
    }).lean();

    const guardianId = childProfile?.parentId || undefined;

    const formattedChapters = Array.isArray(chapters) && chapters.length > 0
      ? chapters.map((ch: any, idx: number) => ({
          chapterNumber: ch.chapterNumber || idx + 1,
          title: ch.title || `Chapter ${idx + 1}`,
          content: ch.content || '',
          illustrationUrl: ch.illustrationUrl || '',
        }))
      : [
          {
            chapterNumber: 1,
            title: 'Chapter 1: The Beginning',
            content: typeof body.content === 'string' ? body.content : 'Once upon a time in a magical forest...',
            illustrationUrl: coverUrl || '',
          },
        ];

    let nextStatus: any = 'DRAFT';
    let guardianConsentStatus: any = 'NOT_REQUIRED';

    if (action === 'submit_review') {
      if (guardianId) {
        nextStatus = 'AWAITING_GUARDIAN_APPROVAL';
        guardianConsentStatus = 'PENDING';
      } else {
        nextStatus = 'SUBMITTED';
        guardianConsentStatus = 'APPROVED';
      }
    }

    let storyDoc;
    if (storyId) {
      // Update existing story draft
      storyDoc = await ChildStory.findOne({ _id: storyId, authorId: user._id });
      if (!storyDoc && user.role !== 'admin') {
        return NextResponse.json({ error: 'Story not found or unauthorized' }, { status: 404 });
      }

      if (storyDoc) {
        storyDoc.title = title.trim();
        storyDoc.synopsis = synopsis || storyDoc.synopsis;
        storyDoc.genre = genre || storyDoc.genre;
        storyDoc.targetAge = targetAge || storyDoc.targetAge;
        storyDoc.chapters = formattedChapters;
        if (coverUrl) storyDoc.coverUrl = coverUrl;
        if (action === 'submit_review') {
          storyDoc.status = nextStatus;
          storyDoc.guardianConsentStatus = guardianConsentStatus;
          storyDoc.submittedAt = new Date();
        }
        await storyDoc.save();
      }
    } else {
      // Create new story
      storyDoc = await ChildStory.create({
        authorId: user._id,
        authorName: user.name,
        guardianId,
        title: title.trim(),
        synopsis: synopsis || '',
        genre: genre || 'Adventure & Fantasy',
        targetAge: targetAge || '6-8',
        status: nextStatus,
        chapters: formattedChapters,
        coverUrl: coverUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
        guardianConsentStatus,
        submittedAt: action === 'submit_review' ? new Date() : undefined,
      });
    }

    return NextResponse.json({
      success: true,
      message: action === 'submit_review' ? 'Story successfully submitted for review!' : 'Story draft saved safely!',
      story: storyDoc,
    });
  } catch (error: any) {
    console.error('ChildStory POST error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { storyId, action, feedback } = body;

    if (!storyId || !action) {
      return NextResponse.json({ error: 'Story ID and action are required' }, { status: 400 });
    }

    await connectToDatabase();
    const story = await ChildStory.findById(storyId);
    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    // 1. Guardian Approval Action
    if (action === 'guardian_approve') {
      if (user.role !== 'parent' && user.role !== 'admin') {
        return NextResponse.json({ error: 'Only parent/guardian or admin can approve' }, { status: 403 });
      }
      story.guardianConsentStatus = 'APPROVED';
      story.status = 'SUBMITTED';
      story.reviewerFeedback = feedback || 'Approved by guardian for editorial review.';
      await story.save();
      return NextResponse.json({ success: true, message: 'Story approved by guardian and moved to Editorial review!', story });
    }

    // 2. Guardian Request Changes Action
    if (action === 'guardian_request_changes') {
      if (user.role !== 'parent' && user.role !== 'admin') {
        return NextResponse.json({ error: 'Only parent/guardian or admin can request changes' }, { status: 403 });
      }
      story.guardianConsentStatus = 'REJECTED';
      story.status = 'CHANGES_REQUESTED';
      story.reviewerFeedback = feedback || 'Your parent requested a few friendly edits before publishing.';
      await story.save();
      return NextResponse.json({ success: true, message: 'Changes requested from young author.', story });
    }

    // 3. Editorial Admin Actions
    if (user.role === 'admin') {
      if (action === 'admin_approve') {
        story.status = 'APPROVED';
        story.reviewerFeedback = feedback || 'Great work! Story approved by StoryNest editors.';
      } else if (action === 'admin_publish') {
        story.status = 'PUBLISHED';
        story.publishedAt = new Date();
        story.reviewerFeedback = feedback || 'Congratulations! Your story is now published in the StoryNest library!';
      } else if (action === 'admin_changes_requested') {
        story.status = 'CHANGES_REQUESTED';
        story.reviewerFeedback = feedback || 'Our editors loved your idea! Please review our suggested polish.';
      } else if (action === 'admin_reject') {
        story.status = 'REJECTED';
        story.reviewerFeedback = feedback || 'Thank you for your creative submission. Keep practicing and creating!';
      }
      await story.save();
      return NextResponse.json({ success: true, message: `Story status updated to ${story.status}`, story });
    }

    return NextResponse.json({ error: 'Unauthorized action' }, { status: 403 });
  } catch (error: any) {
    console.error('ChildStory PUT error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const storyId = searchParams.get('id');
    if (!storyId) {
      return NextResponse.json({ error: 'Story ID required' }, { status: 400 });
    }

    await connectToDatabase();
    const filter = user.role === 'admin' ? { _id: storyId } : { _id: storyId, authorId: user._id };
    const deleted = await ChildStory.findOneAndDelete(filter);

    if (!deleted) {
      return NextResponse.json({ error: 'Story not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Story deleted safely.' });
  } catch (error: any) {
    console.error('ChildStory DELETE error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

