import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User, AuditLog } from '@/models';
import { requireAdmin, handleAuthError } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    await requireAdmin();
    await connectDB();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const role = searchParams.get('role');

    const filter: Record<string, any> = {};

    if (search) {
      const sanitized = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { name: { $regex: sanitized, $options: 'i' } },
        { email: { $regex: sanitized, $options: 'i' } },
      ];
    }

    if (role && role !== 'all') {
      filter.role = role;
    }

    const users = await User.find(filter)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, count: users.length, users });
  } catch (error: any) {
    const authResp = handleAuthError(error);
    if (authResp) return authResp;
    console.error('Admin GET Users Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const admin = await requireAdmin();
    await connectDB();
    const body = await request.json();
    const { _id, isSuspended, role, isCoppaVerified, name, email } = body;

    if (!_id) {
      return NextResponse.json({ success: false, error: 'User _id is required' }, { status: 400 });
    }

    // Safety: Prevent admin from suspending themselves
    if (_id === admin._id.toString() && isSuspended === true) {
      return NextResponse.json(
        { success: false, error: 'Administrators cannot suspend their own active account' },
        { status: 400 }
      );
    }

    const updateFields: Record<string, any> = {};
    if (typeof isSuspended === 'boolean') updateFields.isSuspended = isSuspended;
    if (role) updateFields.role = role;
    if (typeof isCoppaVerified === 'boolean') updateFields.isCoppaVerified = isCoppaVerified;
    if (name) updateFields.name = name;
    if (email) updateFields.email = email.toLowerCase().trim();

    const updatedUser = await User.findByIdAndUpdate(
      _id,
      { $set: updateFields },
      { returnDocument: 'after' }
    ).select('-passwordHash');

    if (!updatedUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    await AuditLog.create({
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'USER_UPDATED',
      targetResource: 'User',
      targetId: _id,
      details: `Updated user ${updatedUser.name} (${updatedUser.email}). Changes: ${Object.keys(updateFields).join(', ')}`,
    });

    return NextResponse.json({
      success: true,
      message: `User ${updatedUser.name} updated successfully`,
      user: updatedUser,
    });
  } catch (error: any) {
    const authResp = handleAuthError(error);
    if (authResp) return authResp;
    console.error('Admin PUT User Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update user' },
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
      return NextResponse.json({ success: false, error: 'User id is required' }, { status: 400 });
    }

    // Safety: Prevent deleting self
    if (id === admin._id.toString()) {
      return NextResponse.json(
        { success: false, error: 'Administrators cannot delete their own active account' },
        { status: 400 }
      );
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    await AuditLog.create({
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'USER_DELETED',
      targetResource: 'User',
      targetId: id,
      details: `Deleted user ${user.name} (${user.email}, role: ${user.role})`,
    });

    return NextResponse.json({
      success: true,
      message: `User ${user.name} removed from MongoDB`,
    });
  } catch (error: any) {
    const authResp = handleAuthError(error);
    if (authResp) return authResp;
    console.error('Admin DELETE User Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete user' },
      { status: 500 }
    );
  }
}
