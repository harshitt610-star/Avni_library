import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function decodeJwtPayload(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('storynest_session')?.value;
  const payload = sessionCookie ? decodeJwtPayload(sessionCookie) : null;

  // 1. Super Admin Portal Guard (Strictly Admin only)
  if (pathname.startsWith('/admin')) {
    if (!payload) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      loginUrl.searchParams.set('role', 'admin');
      loginUrl.searchParams.set('error', 'admin_access_required');
      return NextResponse.redirect(loginUrl);
    }
    if (payload.role !== 'admin') {
      const safeHome =
        payload.role === 'reader' ? '/reader' : payload.role === 'parent' ? '/parent' : '/author';
      return NextResponse.redirect(new URL(safeHome, request.url));
    }
  }

  // 2. Author Studio Guard (Author or Admin only)
  if (pathname.startsWith('/author')) {
    if (!payload) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      loginUrl.searchParams.set('role', 'author');
      return NextResponse.redirect(loginUrl);
    }
    if (payload.role !== 'author' && payload.role !== 'admin') {
      const safeHome = payload.role === 'reader' ? '/reader' : '/parent';
      return NextResponse.redirect(new URL(safeHome, request.url));
    }
  }

  // 3. Parent Sanctuary Guard (Parent or Admin only)
  if (pathname.startsWith('/parent')) {
    if (!payload) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      loginUrl.searchParams.set('role', 'parent');
      return NextResponse.redirect(loginUrl);
    }
    if (payload.role !== 'parent' && payload.role !== 'admin') {
      return NextResponse.redirect(new URL('/reader', request.url));
    }
  }

  // 4. Young Reader Dashboard Guard (Requires logged-in session)
  if (pathname.startsWith('/reader')) {
    if (!payload) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      loginUrl.searchParams.set('role', 'reader');
      return NextResponse.redirect(loginUrl);
    }
  }

  // 5. Book Reading Experience Guard (Requires logged-in session to read full book)
  if (pathname.startsWith('/read/')) {
    if (!payload) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      loginUrl.searchParams.set('role', 'reader');
      return NextResponse.redirect(loginUrl);
    }
  }

  // 6. Interactive Activities, Arena & Companion Quizzes (Requires logged-in session to earn stars)
  if (pathname.startsWith('/activities') || pathname.startsWith('/quiz/')) {
    if (!payload) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      loginUrl.searchParams.set('role', 'reader');
      return NextResponse.redirect(loginUrl);
    }
  }

  // 7. Diplomas & Certificates Guard (Requires logged-in session)
  if (pathname.startsWith('/certificate')) {
    if (!payload) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      loginUrl.searchParams.set('role', 'reader');
      return NextResponse.redirect(loginUrl);
    }
  }

  // 8. Live Interactive Workshop Rooms (Requires logged-in session to join live classroom)
  if (pathname.includes('/room') && pathname.startsWith('/workshops/')) {
    if (!payload) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      loginUrl.searchParams.set('role', 'reader');
      return NextResponse.redirect(loginUrl);
    }
  }

  // 9. Commercial Publishing Packages Guard (Young readers routed to kid-friendly story desk)
  if (pathname.startsWith('/publish')) {
    if (payload?.role === 'reader') {
      return NextResponse.redirect(new URL('/reader/stories', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/author/:path*',
    '/parent/:path*',
    '/reader/:path*',
    '/publish/:path*',
    '/read/:path*',
    '/activities/:path*',
    '/quiz/:path*',
    '/certificate/:path*',
    '/workshops/:path*/room',
  ],
};
