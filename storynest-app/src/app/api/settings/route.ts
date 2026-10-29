import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { WebsiteSetting } from '@/models';

export async function GET() {
  try {
    await connectDB();
    const settings = await WebsiteSetting.findOne({ key: 'global' }).lean();
    return NextResponse.json({
      success: true,
      announcementBarText: settings?.announcementBarText || '🌟 Young Authors November Arena: Submissions now open!',
      announcementBarActive: settings?.announcementBarActive ?? true,
      siteName: settings?.siteName || 'StoryNest',
      tagline: settings?.tagline || 'Where Young Minds Read, Create & Grow',
      welcomeStarsAmount: settings?.welcomeStarsAmount || 100,
      coppaCharterBadgeText: settings?.coppaCharterBadgeText || 'COPPA & DPDPA Child Charter Protected',
      enablePublishingPortal: settings?.enablePublishingPortal ?? true,
      allowCertificateGeneration: settings?.allowCertificateGeneration ?? false,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
