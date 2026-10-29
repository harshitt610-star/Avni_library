import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { CmsPage, AuditLog } from '@/models';
import { requireAdmin, handleAuthError } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    await requireAdmin();
    await connectDB();
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (slug) {
      const page = await CmsPage.findOne({ slug }).lean();
      if (!page) {
        return NextResponse.json({ success: false, error: 'Page not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, page });
    }

    const pages = await CmsPage.find().sort({ title: 1 }).lean();
    return NextResponse.json({ success: true, count: pages.length, pages });
  } catch (error: any) {
    const authResp = handleAuthError(error);
    if (authResp) return authResp;
    console.error('Admin GET Pages Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch pages' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const admin = await requireAdmin();
    await connectDB();
    const body = await request.json();
    const { slug, ...updates } = body;

    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Page slug is required for updating page content' },
        { status: 400 }
      );
    }

    const page = await CmsPage.findOneAndUpdate(
      { slug },
      { $set: updates },
      { returnDocument: 'after', upsert: true }
    );

    await AuditLog.create({
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'CMS_PAGE_UPDATED',
      targetResource: 'CmsPage',
      targetId: slug,
      details: `Updated CMS page "/${slug}". Fields modified: ${Object.keys(updates).join(', ')}`,
    });

    return NextResponse.json({
      success: true,
      message: `Page "${page.title}" updated successfully`,
      page,
    });
  } catch (error: any) {
    const authResp = handleAuthError(error);
    if (authResp) return authResp;
    console.error('Admin PUT Page Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update CMS page' },
      { status: 500 }
    );
  }
}
