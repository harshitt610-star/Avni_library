import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Notification, ContactInquiry } from '@/models';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(req: Request) {
  try {
    const clientIp = getClientIp(req);
    const rl = rateLimit(`contact_${clientIp}`, { intervalMs: 60000, maxRequests: 5 });
    if (!rl.success) {
      return NextResponse.json(
        { error: 'You are submitting inquiries too quickly. Please wait a minute.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { name, email, topic, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Save persistent ContactInquiry for the Super Admin Helpdesk
    const inquiry = await ContactInquiry.create({
      name,
      email: email.toLowerCase(),
      topic: topic || 'General Inquiry',
      message,
      status: 'new',
    });

    // Create an audit notification for the Super Admin
    await Notification.create({
      targetRole: 'admin',
      title: `New Inquiry: ${topic || 'General Contact'} 📬`,
      message: `From ${name} (${email}): "${message.slice(0, 150)}${message.length > 150 ? '...' : ''}"`,
      link: '/admin',
      type: 'info',
    });

    return NextResponse.json({
      success: true,
      message: 'Your inquiry has been delivered to the StoryNest editorial desk.',
    });
  } catch (error: any) {
    console.error('Contact submission error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
