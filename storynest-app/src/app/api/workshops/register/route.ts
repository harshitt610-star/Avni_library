import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Workshop, WorkshopBooking, User } from '@/models';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();
    const { workshopId, attendeeName, attendeeAge, parentEmail } = body;

    if (!workshopId || !attendeeName || !attendeeAge || !parentEmail) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const cleanEmail = parentEmail.toLowerCase().trim();

    await connectToDatabase();
    const workshop = await Workshop.findById(workshopId);
    if (!workshop) {
      return NextResponse.json({ error: 'Workshop not found' }, { status: 404 });
    }

    // Capacity limit enforcement
    if (workshop.bookedSeats >= workshop.maxSeats) {
      return NextResponse.json(
        { error: `This masterclass is fully booked (Maximum ${workshop.maxSeats} seats reached). Please choose an upcoming session.` },
        { status: 400 }
      );
    }

    // Duplicate registration check
    const existingBooking = await WorkshopBooking.findOne({
      workshopId: workshop._id,
      parentEmail: cleanEmail,
      attendeeName: { $regex: `^${attendeeName.trim()}$`, $options: 'i' },
    });

    if (existingBooking) {
      return NextResponse.json(
        { error: `${attendeeName} is already registered for this workshop.` },
        { status: 400 }
      );
    }

    // Determine associated user
    let associatedUserId = user?._id;
    if (!associatedUserId) {
      const existingUser = await User.findOne({ email: cleanEmail });
      if (existingUser) {
        associatedUserId = existingUser._id;
      }
    }

    // If still no user, find default parent or author to satisfy ref constraint
    if (!associatedUserId) {
      const defaultUser = await User.findOne({});
      associatedUserId = defaultUser?._id;
    }

    // Create booking
    const booking = await WorkshopBooking.create({
      workshopId: workshop._id,
      userId: associatedUserId,
      attendeeName: attendeeName.trim(),
      attendeeAge: Number(attendeeAge),
      parentEmail: cleanEmail,
      status: 'CONFIRMED',
    });

    // Atomic increment of booked seats
    await Workshop.findByIdAndUpdate(workshopId, { $inc: { bookedSeats: 1 } });

    return NextResponse.json({
      success: true,
      bookingId: booking._id.toString(),
      message: `Seat successfully reserved for ${attendeeName} in "${workshop.title}"!`,
    });
  } catch (error: any) {
    console.error('Workshop register error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
