import { cookies } from 'next/headers';
import crypto from 'crypto';

const TESTING_COOKIE_NAME = 'storynest_testing_session';
const TESTING_TOKEN_VALUE = 'storynest_qa_verified_session_token_2026';

export async function isTestingAuthorized(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(TESTING_COOKIE_NAME)?.value;
    return token === TESTING_TOKEN_VALUE;
  } catch {
    return false;
  }
}

export async function setTestingSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(TESTING_COOKIE_NAME, TESTING_TOKEN_VALUE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  });
}

export async function clearTestingSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(TESTING_COOKIE_NAME);
}

export function verifyTestingPassword(inputPassword: string): boolean {
  const expectedPassword = process.env.TESTING_PHASE_PASSWORD || 'StoryNest_Test_2026_Secure!';
  if (!inputPassword || typeof inputPassword !== 'string') return false;

  const bufA = Buffer.from(inputPassword);
  const bufB = Buffer.from(expectedPassword);

  if (bufA.length !== bufB.length) {
    // Constant time comparison dummy check
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }

  return crypto.timingSafeEqual(bufA, bufB);
}

