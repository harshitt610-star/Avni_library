import { NextResponse } from 'next/server';
import { isTestingAuthorized, setTestingSession, clearTestingSession, verifyTestingPassword } from '@/lib/testingAuth';

export async function GET() {
  const authorized = await isTestingAuthorized();
  return NextResponse.json({ authorized });
}

export async function POST(req: Request) {
  try {
    const { password } = await req.json();

    if (!password) {
      return NextResponse.json({ success: false, error: 'Password is required' }, { status: 400 });
    }

    const isValid = verifyTestingPassword(password);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Incorrect Testing Phase Passphrase. Access denied.' },
        { status: 401 }
      );
    }

    await setTestingSession();
    return NextResponse.json({ success: true, message: 'Testing Phase unlocked successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Authentication error' }, { status: 500 });
  }
}

export async function DELETE() {
  await clearTestingSession();
  return NextResponse.json({ success: true, message: 'Testing session locked' });
}

