import { NextResponse } from 'next/server';
import { isTestingAuthorized } from '@/lib/testingAuth';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models';
import { setSessionCookie } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const authorized = await isTestingAuthorized();
    if (!authorized) {
      return NextResponse.json({ error: 'Testing Phase authorization required' }, { status: 403 });
    }

    const { role } = await req.json();
    if (!role) {
      return NextResponse.json({ error: 'Role is required' }, { status: 400 });
    }

    await connectToDatabase();
    const demoUser = await User.findOne({ role }).lean();
    if (!demoUser) {
      return NextResponse.json({ error: `No active account found for role "${role}"` }, { status: 404 });
    }

    await setSessionCookie({
      userId: demoUser._id.toString(),
      name: demoUser.name,
      email: demoUser.email,
      role: demoUser.role,
    });

    const targetUrl =
      role === 'admin'
        ? '/admin'
        : role === 'author'
        ? '/author'
        : role === 'parent'
        ? '/parent'
        : '/reader';

    return NextResponse.json({
      success: true,
      role: demoUser.role,
      user: {
        id: demoUser._id.toString(),
        name: demoUser.name,
        email: demoUser.email,
        role: demoUser.role,
      },
      targetUrl,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error switching role' }, { status: 500 });
  }
}

