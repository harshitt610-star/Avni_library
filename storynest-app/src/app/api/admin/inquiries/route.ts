import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ContactInquiry, AuditLog } from '@/models';
import { requireAdmin, handleAuthError } from '@/lib/auth';

// GET: Fetch all user/parent/visitor inquiries
export async function GET() {
  try {
    await requireAdmin();
    await connectDB();

    const inquiries = await ContactInquiry.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, count: inquiries.length, inquiries });
  } catch (error: any) {
    const authResp = handleAuthError(error);
    if (authResp) return authResp;
    console.error('Admin GET Inquiries Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch inquiries' },
      { status: 500 }
    );
  }
}

// PUT: Update inquiry status or admin notes
export async function PUT(request: Request) {
  try {
    const admin = await requireAdmin();
    await connectDB();
    const body = await request.json();
    const { _id, status, adminNotes } = body;

    if (!_id) {
      return NextResponse.json({ success: false, error: 'Inquiry ID is required' }, { status: 400 });
    }

    const updateFields: any = {};
    if (status) updateFields.status = status;
    if (adminNotes !== undefined) updateFields.adminNotes = adminNotes;

    const updated = await ContactInquiry.findByIdAndUpdate(
      _id,
      { $set: updateFields },
      { returnDocument: 'after' }
    );

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Inquiry not found' }, { status: 404 });
    }

    await AuditLog.create({
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'INQUIRY_STATUS_UPDATED',
      targetResource: 'ContactInquiry',
      targetId: _id,
      details: `Status set to ${status}. Notes: ${adminNotes || 'none'}`,
    });

    return NextResponse.json({ success: true, inquiry: updated });
  } catch (error: any) {
    const authResp = handleAuthError(error);
    if (authResp) return authResp;
    console.error('Admin PUT Inquiry Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update inquiry' },
      { status: 500 }
    );
  }
}

// DELETE: Remove an inquiry
export async function DELETE(request: Request) {
  try {
    const admin = await requireAdmin();
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Inquiry ID required' }, { status: 400 });
    }

    await ContactInquiry.findByIdAndDelete(id);

    await AuditLog.create({
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'INQUIRY_DELETED',
      targetResource: 'ContactInquiry',
      targetId: id,
    });

    return NextResponse.json({ success: true, message: 'Inquiry removed' });
  } catch (error: any) {
    const authResp = handleAuthError(error);
    if (authResp) return authResp;
    console.error('Admin DELETE Inquiry Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete inquiry' },
      { status: 500 }
    );
  }
}
