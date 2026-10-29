import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import {
  Book,
  User,
  ReadingProgress,
  Workshop,
  WorkshopBooking,
  Quiz,
  QuizAttempt,
  Manuscript,
  PublishingRequest,
  AuditLog,
} from '@/models';
import { requireAdmin, handleAuthError } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    await requireAdmin();
    await connectDB();
    const { searchParams } = new URL(request.url);
    const exportCsv = searchParams.get('export') === 'csv';

    // Live counts from MongoDB
    const [
      totalBooks,
      publishedBooks,
      draftBooks,
      archivedBooks,
      totalUsers,
      readersCount,
      parentsCount,
      authorsCount,
      educatorsCount,
      adminsCount,
      totalProgressRecords,
      totalWorkshops,
      totalBookings,
      totalQuizzes,
      totalQuizAttempts,
      totalManuscripts,
      pendingManuscripts,
      approvedManuscripts,
      totalPublishingRequests,
      recentAuditLogs,
    ] = await Promise.all([
      Book.countDocuments(),
      Book.countDocuments({ isPublished: true, isArchived: { $ne: true } }),
      Book.countDocuments({ isDraft: true }),
      Book.countDocuments({ isArchived: true }),
      User.countDocuments(),
      User.countDocuments({ role: 'reader' }),
      User.countDocuments({ role: 'parent' }),
      User.countDocuments({ role: 'author' }),
      User.countDocuments({ role: 'educator' }),
      User.countDocuments({ role: 'admin' }),
      ReadingProgress.countDocuments(),
      Workshop.countDocuments(),
      WorkshopBooking.countDocuments(),
      Quiz.countDocuments(),
      QuizAttempt.countDocuments(),
      Manuscript.countDocuments(),
      Manuscript.countDocuments({ status: { $in: ['SUBMITTED', 'UNDER_REVIEW'] } }),
      Manuscript.countDocuments({ status: 'APPROVED' }),
      PublishingRequest.countDocuments(),
      AuditLog.find().sort({ createdAt: -1 }).limit(30).lean(),
    ]);

    // Aggregate total minutes read across all readers
    const minutesAggregation = await ReadingProgress.aggregate([
      { $group: { _id: null, totalMinutes: { $sum: '$totalMinutesRead' } } },
    ]);
    const totalMinutesRead = minutesAggregation[0]?.totalMinutes || 0;

    // Aggregate total stars awarded
    const starsAggregation = await QuizAttempt.aggregate([
      { $group: { _id: null, totalStars: { $sum: '$starsAwarded' } } },
    ]);
    const totalStarsAwarded = starsAggregation[0]?.totalStars || 0;

    if (exportCsv) {
      const csvRows = [
        ['StoryNest Platform Performance Analytics Report', 'Generated: ' + new Date().toISOString()],
        [''],
        ['Metric Category', 'Key Indicator', 'Current Value in MongoDB'],
        ['Catalog', 'Total Books in Database', totalBooks],
        ['Catalog', 'Published & Live Books', publishedBooks],
        ['Catalog', 'Draft Books', draftBooks],
        ['Catalog', 'Archived Books', archivedBooks],
        ['Users', 'Total Registered Accounts', totalUsers],
        ['Users', 'Young Readers', readersCount],
        ['Users', 'Parents Sanctuary', parentsCount],
        ['Users', 'Contributing Authors', authorsCount],
        ['Users', 'Educators & Schools', educatorsCount],
        ['Users', 'Super Administrators', adminsCount],
        ['Engagement', 'Active Reading Sessions', totalProgressRecords],
        ['Engagement', 'Total Minutes Read by Children', totalMinutesRead],
        ['Education', 'Interactive Quizzes Available', totalQuizzes],
        ['Education', 'Total Quiz Attempts Passed', totalQuizAttempts],
        ['Education', 'Total Star Badges Awarded', totalStarsAwarded],
        ['Community', 'Total Workshops Created', totalWorkshops],
        ['Community', 'Total Seats Booked', totalBookings],
        ['Editorial', 'Total Manuscripts Submitted', totalManuscripts],
        ['Editorial', 'Manuscripts Pending Review', pendingManuscripts],
        ['Editorial', 'Manuscripts Approved for Library', approvedManuscripts],
        ['Publishing CRM', 'Total Package Inquiries', totalPublishingRequests],
      ];

      const csvContent = csvRows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="storynest_analytics_${Date.now()}.csv"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      stats: {
        books: {
          total: totalBooks,
          published: publishedBooks,
          drafts: draftBooks,
          archived: archivedBooks,
        },
        users: {
          total: totalUsers,
          readers: readersCount,
          parents: parentsCount,
          authors: authorsCount,
          educators: educatorsCount,
          admins: adminsCount,
        },
        engagement: {
          readingSessions: totalProgressRecords,
          totalMinutesRead,
          quizzes: totalQuizzes,
          quizAttempts: totalQuizAttempts,
          starsAwarded: totalStarsAwarded,
        },
        workshops: {
          total: totalWorkshops,
          bookings: totalBookings,
        },
        editorial: {
          manuscripts: totalManuscripts,
          pendingReview: pendingManuscripts,
          approved: approvedManuscripts,
          publishingRequests: totalPublishingRequests,
        },
      },
      recentAuditLogs,
    });
  } catch (error: any) {
    const authResp = handleAuthError(error);
    if (authResp) return authResp;
    console.error('Admin GET Analytics Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to aggregate analytics' },
      { status: 500 }
    );
  }
}
