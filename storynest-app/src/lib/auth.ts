import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { connectToDatabase } from './mongodb';
import { User, IUser } from '../models';

const JWT_SECRET = process.env.JWT_SECRET || 'storynest_super_secret_jwt_key_2026_coppa_safe';
const COOKIE_NAME = 'storynest_session';

export interface SessionPayload {
  userId: string;
  name: string;
  email: string;
  role: 'reader' | 'parent' | 'author' | 'educator' | 'admin';
}

export function signToken(payload: SessionPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<IUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload?.userId) return null;

    await connectToDatabase();
    const user = await User.findById(payload.userId).lean();
    return user as unknown as IUser;
  } catch (error: any) {
    if (error?.digest === 'DYNAMIC_SERVER_USAGE') {
      throw error;
    }
    console.error('Error fetching current user:', error);
    return null;
  }
}

export async function setSessionCookie(payload: SessionPayload) {
  const token = signToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function requireAuth(): Promise<IUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('UNAUTHORIZED');
  }
  if (user.isSuspended) {
    throw new Error('ACCOUNT_SUSPENDED');
  }
  return user;
}

export async function requireAdmin(): Promise<IUser> {
  const user = await requireAuth();
  if (user.role !== 'admin') {
    throw new Error('FORBIDDEN');
  }
  return user;
}

export async function requireRole(
  allowedRoles: Array<'reader' | 'parent' | 'author' | 'educator' | 'admin'>
): Promise<IUser> {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role)) {
    throw new Error('FORBIDDEN');
  }
  return user;
}

export function handleAuthError(error: unknown) {
  const msg = error instanceof Error ? error.message : String(error);
  if (msg === 'UNAUTHORIZED') {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }
  if (msg === 'FORBIDDEN') {
    return NextResponse.json({ success: false, error: 'Super Admin access required' }, { status: 403 });
  }
  if (msg === 'ACCOUNT_SUSPENDED') {
    return NextResponse.json({ success: false, error: 'Account has been suspended' }, { status: 403 });
  }
  return null;
}
