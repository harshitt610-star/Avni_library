import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { WebsiteSetting, AuditLog } from '@/models';
import { requireAdmin, handleAuthError } from '@/lib/auth';

export async function GET() {
  try {
    await connectDB();
    let settings = await WebsiteSetting.findOne({ key: 'global' }).lean();

    if (!settings) {
      settings = await WebsiteSetting.create({
        key: 'global',
        siteName: 'StoryNest',
        tagline: 'Where Young Minds Read, Create & Grow',
        contactEmail: 'editorial@storynest.com',
        contactPhone: '+91 (0141) 278-9000',
        announcementBarText: '🌟 Young Authors November Arena: Submissions now open!',
        announcementBarActive: true,
        socialTwitter: 'https://twitter.com/storynest',
        socialInstagram: 'https://instagram.com/storynest',
        socialYoutube: 'https://youtube.com/storynest',
        footerCopyrightText: '© 2026 StoryNest Literary Publishing Platform. All rights reserved.',
        maintenanceMode: false,
        defaultSeoTitle: 'StoryNest — Bilingual Children’s Books & Literary Haven',
        defaultSeoDescription: 'A safe, COPPA-compliant sanctuary with bilingual Hindi-English illustrated books, author masterclasses, and creative publishing.',
      });
    }

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    console.error('GET Settings Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const admin = await requireAdmin();
    await connectDB();
    const body = await request.json();

    const updated = await WebsiteSetting.findOneAndUpdate(
      { key: 'global' },
      { $set: body },
      { returnDocument: 'after', upsert: true }
    );

    await AuditLog.create({
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'SETTINGS_UPDATED',
      targetResource: 'WebsiteSetting',
      targetId: 'global',
      details: `Updated global settings: ${Object.keys(body).join(', ')}`,
    });

    return NextResponse.json({
      success: true,
      message: 'Global website settings updated successfully in MongoDB',
      settings: updated,
    });
  } catch (error: any) {
    const authResp = handleAuthError(error);
    if (authResp) return authResp;
    console.error('Admin PUT Settings Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update settings' },
      { status: 500 }
    );
  }
}
