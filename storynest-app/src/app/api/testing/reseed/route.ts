import { NextResponse } from 'next/server';
import { isTestingAuthorized } from '@/lib/testingAuth';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

export async function POST() {
  try {
    const authorized = await isTestingAuthorized();
    if (!authorized) {
      return NextResponse.json({ error: 'Testing Phase authorization required' }, { status: 403 });
    }

    const { stdout, stderr } = await execAsync('npx tsx --env-file=.env.local src/scripts/seed.ts', {
      cwd: process.cwd(),
      timeout: 35000,
    });

    return NextResponse.json({
      success: true,
      message: 'MongoDB Atlas collections re-seeded successfully',
      output: stdout || stderr,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

