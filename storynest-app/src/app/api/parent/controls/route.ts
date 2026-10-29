import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ChildProfile } from '@/models';
import { requireAuth } from '@/lib/auth';

export async function PUT(req: Request) {
  try {
    const user = await requireAuth();
    if (user.role !== 'parent' && user.role !== 'admin') {
      return NextResponse.json({ error: 'Parent or Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const {
      childId,
      dailyTimeLimitMinutes,
      ageBracket,
      bedtimeCurfew,
      curfewEnabled,
      contentFilter,
    } = body;

    if (!childId) {
      return NextResponse.json({ error: 'Child ID is required' }, { status: 400 });
    }

    await connectToDatabase();

    // Verify ownership: ensure the child belongs to this parent (or admin override)
    const filter = user.role === 'admin' ? { _id: childId } : { _id: childId, parentId: user._id };
    const updates: Record<string, any> = {};

    if (dailyTimeLimitMinutes !== undefined) {
      updates.dailyTimeLimitMinutes = Math.min(180, Math.max(15, Number(dailyTimeLimitMinutes)));
    }
    if (ageBracket) {
      updates.ageBracket = ageBracket;
    }
    if (bedtimeCurfew !== undefined) {
      updates.bedtimeCurfew = String(bedtimeCurfew);
    }
    if (curfewEnabled !== undefined) {
      updates.curfewEnabled = Boolean(curfewEnabled);
    }
    if (contentFilter) {
      updates.contentFilter = contentFilter;
    }

    const updated = await ChildProfile.findOneAndUpdate(
      filter,
      { $set: updates },
      { returnDocument: 'after' }
    );

    if (!updated) {
      return NextResponse.json({ error: 'Child profile not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Parental safety controls, bedtime curfew, and screen limits updated successfully',
      child: updated,
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
