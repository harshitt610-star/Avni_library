import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Workshop, WorkshopBooking, AuditLog, IWorkshop } from '@/models';
import { requireAdmin, handleAuthError } from '@/lib/auth';

export async function GET() {
  try {
    await requireAdmin();
    await connectDB();
    const workshops = await Workshop.find().sort({ createdAt: -1 }).lean();

    const workshopsWithCounts = await Promise.all(
      workshops.map(async (ws: any) => {
        const bookingsCount = await WorkshopBooking.countDocuments({ workshopId: ws._id });
        const recentBookings = await WorkshopBooking.find({ workshopId: ws._id })
          .populate('userId', 'name email role')
          .sort({ createdAt: -1 })
          .limit(10)
          .lean();

        return {
          ...ws,
          bookedSeats: bookingsCount || ws.bookedSeats || 0,
          recentBookings,
        };
      })
    );

    return NextResponse.json({ success: true, count: workshopsWithCounts.length, workshops: workshopsWithCounts });
  } catch (error: any) {
    const authResp = handleAuthError(error);
    if (authResp) return authResp;
    console.error('Admin GET Workshops Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch workshops' },
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
      description,
      mentorName,
      instructorName,
      mentorTitle,
      instructorRole,
      mentorAvatar,
      instructorAvatar,
      scheduledAt,
      date,
      time,
      durationMinutes,
      meetingUrl,
      meetLinkPlaceholder,
      maxCapacity,
      maxSeats,
      category,
      ageBracket,
      learningOutcomes,
    } = body;

    const finalInstructorName = instructorName || mentorName || 'StoryNest Educator';
    const finalInstructorRole = instructorRole || mentorTitle || 'Children’s Author & Illustrator';
    const finalDate = date || (scheduledAt ? new Date(scheduledAt).toLocaleDateString() : 'Upcoming Saturday');
    const finalTime = time || (scheduledAt ? new Date(scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '4:00 PM IST');

    if (!title || !description) {
      return NextResponse.json(
        { success: false, error: 'Title and description are required' },
        { status: 400 }
      );
    }

    const workshop = (await Workshop.create({
      title,
      description,
      instructorName: finalInstructorName,
      instructorRole: finalInstructorRole,
      instructorAvatar: instructorAvatar || mentorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop',
      date: finalDate,
      time: finalTime,
      durationMinutes: Number(durationMinutes) || 60,
      ageBracket: ageBracket || '7-12 yrs',
      category: category || 'Creative Writing',
      maxSeats: Number(maxSeats || maxCapacity) || 30,
      bookedSeats: 0,
      learningOutcomes: learningOutcomes || ['Plot structures', 'Creative expression', 'Character design'],
      meetLinkPlaceholder: meetingUrl || meetLinkPlaceholder || 'https://meet.google.com/nest-art-room',
      isPublished: true,
    })) as IWorkshop;

    await AuditLog.create({
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'WORKSHOP_CREATED',
      targetResource: 'Workshop',
      targetId: workshop._id.toString(),
      details: `Created workshop "${workshop.title}" by ${workshop.instructorName}`,
    });

    return NextResponse.json({ success: true, message: 'Workshop created successfully', workshop });
  } catch (error: any) {
    const authResp = handleAuthError(error);
    if (authResp) return authResp;
    console.error('Admin POST Workshop Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create workshop' },
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
      return NextResponse.json({ success: false, error: 'Workshop _id is required' }, { status: 400 });
    }

    const updated = await Workshop.findByIdAndUpdate(
      _id,
      { $set: updates },
      { returnDocument: 'after' }
    );

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Workshop not found' }, { status: 404 });
    }

    await AuditLog.create({
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'WORKSHOP_UPDATED',
      targetResource: 'Workshop',
      targetId: _id,
      details: `Updated workshop "${updated.title}"`,
    });

    return NextResponse.json({ success: true, message: 'Workshop updated successfully', workshop: updated });
  } catch (error: any) {
    const authResp = handleAuthError(error);
    if (authResp) return authResp;
    console.error('Admin PUT Workshop Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update workshop' },
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
      return NextResponse.json({ success: false, error: 'Workshop id is required' }, { status: 400 });
    }

    const ws = await Workshop.findByIdAndDelete(id);
    if (!ws) {
      return NextResponse.json({ success: false, error: 'Workshop not found' }, { status: 404 });
    }

    await AuditLog.create({
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'WORKSHOP_DELETED',
      targetResource: 'Workshop',
      targetId: id,
      details: `Deleted workshop "${ws.title}"`,
    });

    return NextResponse.json({ success: true, message: `Workshop "${ws.title}" deleted from MongoDB` });
  } catch (error: any) {
    const authResp = handleAuthError(error);
    if (authResp) return authResp;
    console.error('Admin DELETE Workshop Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete workshop' },
      { status: 500 }
    );
  }
}
