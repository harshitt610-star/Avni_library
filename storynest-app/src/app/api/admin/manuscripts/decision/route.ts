import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Manuscript, Notification, Book, AuditLog } from '@/models';
import { requireAdmin, handleAuthError } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();
    const { manuscriptId, action, reviewerNotes } = body;

    if (!manuscriptId || !action) {
      return NextResponse.json({ error: 'Manuscript ID and action are required' }, { status: 400 });
    }

    await connectDB();
    const manuscript = await Manuscript.findById(manuscriptId);
    if (!manuscript) {
      return NextResponse.json({ error: 'Manuscript not found' }, { status: 404 });
    }

    let newStatus = 'UNDER_REVIEW';
    if (action === 'approve' || action === 'publish') newStatus = 'APPROVED';
    else if (action === 'request_changes') newStatus = 'CHANGES_REQUESTED';
    else if (action === 'reject') newStatus = 'REJECTED';

    manuscript.status = newStatus as any;
    if (reviewerNotes) manuscript.reviewerNotes = reviewerNotes;
    manuscript.reviewedAt = new Date();
    await manuscript.save();

    // If approved, dynamically create or activate Book in MongoDB Catalogue!
    if (newStatus === 'APPROVED') {
      const slug = manuscript.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const existingBook = await Book.findOne({ slug });

      if (!existingBook) {
        await Book.create({
          title: manuscript.title,
          titleHindi: manuscript.titleHindi,
          slug,
          authorName: manuscript.authorName,
          authorId: manuscript.authorId,
          synopsis: manuscript.synopsis,
          synopsisHindi: manuscript.synopsis,
          coverUrl: manuscript.coverFileUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
          ageBracket: (manuscript.targetAge as any) || '6-8',
          genre: manuscript.genre || 'Adventure',
          language: 'bilingual',
          readingTimeMinutes: Math.max(5, Math.round(manuscript.wordCount / 120)),
          chaptersCount: 1,
          isPublished: true,
          chapters: [
            {
              chapterNumber: 1,
              title: `${manuscript.title}: Opening Chapter`,
              titleHindi: manuscript.titleHindi ? `${manuscript.titleHindi}: प्रथम अध्याय` : undefined,
              contentEn: manuscript.synopsis + '\n\n' + 'The adventure continues as the characters step forward into uncharted territory, filled with curiosity, warmth, and the wonder of discovery.',
              contentHi: 'कहानी का रोमांच तब शुरू होता है जब पात्र आगे बढ़ते हैं, कौतूहल और नई खोजों से भरे एक नए सफ़र पर।',
              illustrationUrl: manuscript.coverFileUrl,
            },
          ],
        });
      }
    }

    // Create notification for Author
    await Notification.create({
      userId: manuscript.authorId,
      targetRole: 'author',
      title: `Editorial Decision: ${manuscript.title} 📝`,
      message: `Your manuscript status has been updated to "${newStatus}". Notes: ${reviewerNotes || 'Review completed by editorial board.'}`,
      link: '/author',
      type: newStatus === 'APPROVED' ? 'success' : 'alert',
    });

    // Create Audit Log
    await AuditLog.create({
      adminName: admin.name,
      adminEmail: admin.email,
      action: `MANUSCRIPT_${newStatus}`,
      targetResource: 'Manuscript',
      targetId: manuscript._id.toString(),
      details: `Action "${action}" on manuscript "${manuscript.title}" by ${manuscript.authorName}`,
    });

    return NextResponse.json({
      success: true,
      manuscript,
      message: `Manuscript status updated to ${newStatus}. ${newStatus === 'APPROVED' ? 'Book is now live in the Digital Library!' : ''}`,
    });
  } catch (error: any) {
    const authResp = handleAuthError(error);
    if (authResp) return authResp;
    console.error('Admin Manuscript Decision Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
