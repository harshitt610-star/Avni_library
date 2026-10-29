'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [announcement, setAnnouncement] = useState<{ text: string; active: boolean } | null>(null);
  const [announcementDismissed, setAnnouncementDismissed] = useState(false);
  const [publishingEnabled, setPublishingEnabled] = useState(true);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.enablePublishingPortal !== undefined) {
          setPublishingEnabled(data.enablePublishingPortal);
        }
        if (data.success && data.announcementBarActive && data.announcementBarText) {
          setAnnouncement({
            text: data.announcementBarText,
            active: data.announcementBarActive,
          });
        }
      })
      .catch(() => {});
  }, [pathname]);

  // Determine Nav Links based strictly on user role
  const getNavLinks = () => {
    if (!user) {
      // 1. GUEST / PUBLIC VISITOR
      return [
        { name: lang === 'en' ? 'Home' : 'होम', href: '/' },
        { name: lang === 'en' ? 'Library' : 'पुस्तकालय', href: '/library' },
        { name: lang === 'en' ? 'Workshops' : 'कार्यशालाएं', href: '/workshops' },
        { name: lang === 'en' ? 'Activities' : 'गतिविधियां', href: '/activities' },
        ...(publishingEnabled ? [{ name: lang === 'en' ? 'Publish' : 'प्रकाशन', href: '/publish' }] : []),
        { name: lang === 'en' ? 'About' : 'परिचय', href: '/about' },
      ];
    }

    if (user.role === 'reader') {
      // 2. YOUNG READER (Child) - ZERO ADULT / ADMIN DISTRACTIONS
      return [
        { name: '🚀 My Reading Desk', href: '/reader' },
        { name: '📚 Discover Books', href: '/library' },
        { name: '✍️ My Stories', href: '/reader/stories' },
        { name: '🏆 Quizzes & Badges', href: '/activities' },
        { name: '🎪 Workshops', href: '/workshops' },
        {
          name: '🎓 My Diploma',
          href: '/certificate?name=Aarav%20Sharma&title=Tara%20and%20the%20Whispering%20Stars&book=tara-and-the-whispering-stars&badge=Junior%20Astronomer&author=Dr.%20Meera%20Sharma',
        },
        { name: '🛡️ Safety & Help', href: '/safety' },
      ];
    }

    if (user.role === 'parent') {
      // 3. PARENT SANCTUARY - ZERO AUTHOR / ADMIN CLUTTER
      return [
        { name: '🏡 Family Sanctuary', href: '/parent' },
        { name: '📊 Children Stats', href: '/parent#children' },
        { name: '✍️ Story Approvals', href: '/parent#child-stories' },
        { name: '📚 Library Preview', href: '/library' },
        { name: '⚙️ Bedtime Curfew', href: '/parent#controls' },
      ];
    }

    if (user.role === 'author') {
      // 4. AUTHOR & EDUCATOR STUDIO
      return [
        { name: '✍️ Studio Desk', href: '/author' },
        { name: '📄 Manuscripts', href: '/author#manuscripts' },
        { name: '🎪 Live Workshops', href: '/workshops' },
        ...(publishingEnabled ? [{ name: '📦 Packages', href: '/publish' }] : []),
      ];
    }

    // 5. ADMIN OPERATIONS
    return [
      { name: '🛡️ Command Center', href: '/admin' },
      { name: '📚 Catalog', href: '/admin#books' },
      { name: '⚙️ Settings', href: '/admin/settings' },
      { name: '🧪 QA Deck', href: '/testing' },
    ];
  };

  const navLinks = getNavLinks();

  const getBrandHome = () => {
    if (!user) return '/';
    if (user.role === 'reader') return '/reader';
    if (user.role === 'parent') return '/parent';
    if (user.role === 'author') return '/author';
    return '/admin';
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#f4faff]/95 backdrop-blur-xl border-b border-[#ddeaf2] shadow-sm">
        {/* Dynamic Global Announcement Banner */}
        {announcement?.active && !announcementDismissed && (
          <div className="bg-gradient-to-r from-[#203047] via-[#2d6955] to-[#203047] text-white py-1.5 px-4 text-center text-xs font-semibold flex items-center justify-center gap-2 shadow-inner border-b border-white/10 relative">
            <span className="truncate max-w-[90%]">{announcement.text}</span>
            <button
              onClick={() => setAnnouncementDismissed(true)}
              className="absolute right-3 top-1 text-white/70 hover:text-white p-0.5 cursor-pointer"
              title="Dismiss Announcement"
              aria-label="Dismiss banner"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        )}

        <div className="h-20 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-4 shrink-0">
            <Link href={getBrandHome()} className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-[#203047] text-white flex items-center justify-center font-serif-story text-xl font-bold shadow-md group-hover:scale-105 transition-transform">
                S
              </div>
              <div className="flex flex-col">
                <span className="font-serif-story text-xl font-bold text-[#091b31] tracking-tight leading-none">
                  StoryNest
                </span>
                <span className="text-[11px] text-[#44474d] hidden sm:inline-block leading-tight mt-0.5">
                  {user?.role === 'reader'
                    ? 'Young Reader World'
                    : user?.role === 'parent'
                    ? 'Parent Sanctuary'
                    : user?.role === 'author'
                    ? 'Author Studio'
                    : user?.role === 'admin'
                    ? 'Admin Operations'
                    : lang === 'en'
                    ? 'Where Young Minds Read & Grow'
                    : 'जहाँ बाल मन खिलते हैं'}
                </span>
              </div>
            </Link>

            {/* Reader Badges (Visible only when young reader is logged in) */}
            {user?.role === 'reader' && (
              <div className="hidden md:flex items-center gap-2 ml-2">
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-extrabold shadow-2xs">
                  <span>⭐</span>
                  <span>145 Stars</span>
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-orange-50 border border-orange-200 text-orange-900 text-xs font-extrabold shadow-2xs">
                  <span>🔥</span>
                  <span>5-Day Streak</span>
                </div>
              </div>
            )}
          </div>

          {/* Role-Specific Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-all ${
                    active
                      ? 'bg-[#203047] text-white shadow-sm'
                      : 'text-[#44474d] hover:text-[#091b31] hover:bg-[#e9f6fd]'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Suite */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Global Search Button */}
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className="w-9 h-9 rounded-xl bg-[#e9f6fd] text-[#44474d] hover:bg-[#ddeaf2] hover:text-[#091b31] flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined text-[19px]">search</span>
            </button>

            {/* Language Switcher */}
            <div className="flex items-center bg-[#e9f6fd] rounded-xl p-0.5 border border-[#ddeaf2]">
              <button
                onClick={() => setLang('en')}
                className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all ${
                  lang === 'en' ? 'bg-[#203047] text-white shadow-xs' : 'text-[#44474d]'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLang('hi')}
                className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all ${
                  lang === 'hi' ? 'bg-[#203047] text-white shadow-xs' : 'text-[#44474d]'
                }`}
              >
                हिंदी
              </button>
            </div>

            {/* User Session State */}
            {user ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#e9f6fd] border border-[#ddeaf2] text-xs font-bold text-[#091b31]">
                  <span className="text-base">
                    {user.role === 'reader'
                      ? '🚀'
                      : user.role === 'parent'
                      ? '🏡'
                      : user.role === 'author'
                      ? '✍️'
                      : '🛡️'}
                  </span>
                  <span>{user.name.split(' ')[0]}</span>
                  <span className="text-[10px] uppercase font-bold text-[#74777f] bg-white px-1.5 py-0.5 rounded-md border border-gray-200">
                    {user.role}
                  </span>
                </div>

                <button
                  onClick={logout}
                  title="Sign Out"
                  className="px-2.5 py-1.5 rounded-xl bg-gray-100 hover:bg-rose-50 text-[#44474d] hover:text-rose-700 transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">logout</span>
                  <span className="hidden sm:inline">Exit</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#203047] hover:bg-[#e9f6fd] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-3.5 py-1.5 rounded-xl bg-[#203047] text-white text-xs font-bold hover:bg-[#142337] shadow-sm transition-all"
                >
                  Join StoryNest
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-9 h-9 rounded-xl bg-[#e9f6fd] text-[#44474d] flex items-center justify-center cursor-pointer"
              aria-label="Toggle menu"
            >
              <span className="material-symbols-outlined text-[20px]">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Flyout Menu (Strictly filtered by role) */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#f4faff] border-b border-[#ddeaf2] px-6 py-4 flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl text-sm font-semibold text-[#091b31] hover:bg-[#e9f6fd]"
              >
                {link.name}
              </Link>
            ))}

            {user ? (
              <div className="border-t border-[#ddeaf2] pt-3 mt-2 flex items-center justify-between">
                <span className="text-xs font-bold text-[#091b31]">
                  Signed in as {user.name} ({user.role})
                </span>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="text-xs font-bold text-rose-700 hover:underline cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="border-t border-[#ddeaf2] pt-3 mt-2 flex gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center rounded-xl bg-white border border-[#ddeaf2] text-xs font-bold text-[#203047]"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center rounded-xl bg-[#203047] text-white text-xs font-bold"
                >
                  Join StoryNest
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Global Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-start justify-center pt-24 p-4">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-tactile-xl border border-[#ddeaf2] p-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#ddeaf2]">
              <div className="flex items-center gap-2 text-[#091b31]">
                <span className="material-symbols-outlined text-[22px]">search</span>
                <span className="font-semibold text-sm">Search StoryNest Catalogue</span>
              </div>
              <button
                onClick={() => setSearchOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="mt-3">
              <input
                type="text"
                placeholder="Search books, authors, or topics (e.g. Tara, stars, watercolor)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full px-4 py-3 bg-[#f4faff] border border-[#ddeaf2] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#203047]"
              />
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <span className="text-xs font-semibold text-[#44474d]">Quick Suggestions:</span>
              <div className="flex flex-wrap gap-2">
                {[
                  'Tara and the Whispering Stars',
                  'Astronomy & Space',
                  'Jungle Adventures',
                  'Dr. Meera Sharma',
                  'Bilingual Stories',
                ].map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      setSearchOpen(false);
                      window.location.href = `/library?q=${encodeURIComponent(item)}`;
                    }}
                    className="px-3 py-1 bg-[#f4faff] hover:bg-[#e9f6fd] border border-[#ddeaf2] rounded-lg text-xs text-[#091b31] font-medium transition-colors cursor-pointer"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
