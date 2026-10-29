import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { PublishingRequest, AuditLog } from '@/models';
import { requireAdmin, handleAuthError } from '@/lib/auth';

export async function GET() {
  try {
    await requireAdmin();
    await connectDB();
    const requests = await PublishingRequest.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, count: requests.length, requests });
  } catch (error: any) {
    const authResp = handleAuthError(error);
    if (authResp) return authResp;
    console.error('Admin GET Publishing Requests Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch publishing requests' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const admin = await requireAdmin();
    await connectDB();
    const body = await request.json();
    const { _id, status, notes } = body;

    if (!_id || !status) {
      return NextResponse.json(
        { success: false, error: 'Request _id and new status are required' },
        { status: 400 }
      );
    }

    const updated = await PublishingRequest.findByIdAndUpdate(
      _id,
      { $set: { status, ...(notes !== undefined && { notes }) } },
      { returnDocument: 'after' }
    );

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 });
    }

    await AuditLog.create({
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'PUBLISHING_REQUEST_UPDATED',
      targetResource: 'PublishingRequest',
      targetId: _id,
      details: `Updated request for ${updated.authorName} (${updated.packageTier}) to status ${status}`,
    });

    return NextResponse.json({
      success: true,
      message: 'Publishing request status updated',
      request: updated,
    });
  } catch (error: any) {
    const authResp = handleAuthError(error);
    if (authResp) return authResp;
    console.error('Admin PUT Publishing Request Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update publishing request' },
      { status: 500 }
    );
  }
}
