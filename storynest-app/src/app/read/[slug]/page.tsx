'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import confetti from 'canvas-confetti';
import { useAuth } from '@/context/AuthContext';

interface ReadChapterData {
  chapterNumber: number;
  title: string;
  titleHindi?: string;
  contentEn: string;
  contentHi?: string;
  illustrationUrl?: string;
}

interface ReadBookData {
  _id: string;
  title: string;
  titleHindi?: string;
  slug: string;
  authorName: string;
  readingTimeMinutes?: number;
  ageBracket?: string;
  chapters?: ReadChapterData[];
}

function ReaderContent() {
  const { user, loading: authLoading } = useAuth();
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [book, setBook] = useState<ReadBookData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);

  // Reader Settings
  const [fontSize, setFontSize] = useState<number>(18);
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans' | 'dyslexic'>('serif');
  const [theme, setTheme] = useState<'cream' | 'white' | 'night'>('cream');
  const [languageMode, setLanguageMode] = useState<'both' | 'en' | 'hi'>('both');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [completedCelebration, setCompletedCelebration] = useState(false);
  const [isReadingAloud, setIsReadingAloud] = useState(false);

  // Parental Safety & Bedtime Curfew Enforcement
  const [childControls, setChildControls] = useState<{
    displayName: string;
    bedtimeCurfew: string;
    curfewEnabled: boolean;
    dailyTimeLimitMinutes: number;
    minutesReadToday: number;
  } | null>(null);
  const [curfewActive, setCurfewActive] = useState(false);
  const [curfewOverridden, setCurfewOverridden] = useState(false);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideChallengeAnswer, setOverrideChallengeAnswer] = useState('');
  const [overrideError, setOverrideError] = useState('');
  const [timeLimitActive, setTimeLimitActive] = useState(false);
  const [timeLimitSnoozed, setTimeLimitSnoozed] = useState(false);

  const checkIsCurfewTime = (curfewTime: string) => {
    if (!curfewTime || curfewTime === 'off') return false;
    const parts = curfewTime.split(':');
    if (parts.length < 2) return false;
    const curfewHours = parseInt(parts[0], 10);
    const curfewMins = parseInt(parts[1], 10);
    const now = new Date();
    const curHours = now.getHours();
    const curMins = now.getMinutes();

    // Past bedtime (e.g. >= 20:30) or overnight before 6:00 AM
    if (curHours > curfewHours || (curHours === curfewHours && curMins >= curfewMins)) {
      return true;
    }
    if (curHours < 6) {
      return true;
    }
    return false;
  };

  // Clean up speech on chapter change or unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsReadingAloud(false);
    }
  }, [currentChapterIndex]);

  const toggleReadAloud = (textToRead: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this browser.');
      return;
    }
    if (isReadingAloud) {
      window.speechSynthesis.cancel();
      setIsReadingAloud(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.pitch = 1.05;
      utterance.rate = 1.0;
      utterance.onend = () => setIsReadingAloud(false);
      utterance.onerror = () => setIsReadingAloud(false);
      window.speechSynthesis.speak(utterance);
      setIsReadingAloud(true);
    }
  };

  useEffect(() => {
    if (!slug) return;
    Promise.all([
      fetch(`/api/books?q=${slug}`).then((r) => r.json()),
      fetch(`/api/reading/progress?bookSlug=${slug}`).then((r) => r.json()).catch(() => null),
    ])
      .then(([booksData, progressData]) => {
        if (booksData.books && booksData.books.length > 0) {
          const found = booksData.books.find((b: any) => b.slug === slug) || booksData.books[0];
          setBook(found);

          const paramChap = searchParams.get('chapter');
          if (paramChap) {
            const initChapter = parseInt(paramChap, 10);
            if (initChapter > 0 && found.chapters && initChapter <= found.chapters.length) {
              setCurrentChapterIndex(initChapter - 1);
            }
          } else if (progressData?.progress?.currentChapter) {
            const savedChap = progressData.progress.currentChapter;
            if (savedChap > 0 && found.chapters && savedChap <= found.chapters.length) {
              setCurrentChapterIndex(savedChap - 1);
            }
          }

          // Evaluate bedtime curfew and screen limit
          if (progressData?.childProfile) {
            const cp = progressData.childProfile;
            setChildControls(cp);
            if (cp.curfewEnabled && checkIsCurfewTime(cp.bedtimeCurfew)) {
              setCurfewActive(true);
            }
            if (cp.dailyTimeLimitMinutes && cp.minutesReadToday >= cp.dailyTimeLimitMinutes) {
              setTimeLimitActive(true);
            }
          }
        }
      })
      .finally(() => setLoading(false));
  }, [slug, searchParams]);

  // Persist reading progress
  useEffect(() => {
    if (book && book.chapters && book.chapters.length > 0) {
      const currentChapNum = currentChapterIndex + 1;
      const percent = Math.round((currentChapNum / book.chapters.length) * 100);

      fetch('/api/reading/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookSlug: book.slug,
          chapterNumber: currentChapNum,
          percentCompleted: percent,
          minutesRead: 2,
        }),
      }).catch(() => {});

      if (currentChapNum === book.chapters.length && !completedCelebration) {
        setCompletedCelebration(true);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    }
  }, [currentChapterIndex, book]);

  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-[#f4faff] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#ddeaf2] shadow-tactile-xl text-center">
          <span className="text-4xl mb-3 block">🔒</span>
          <h2 className="font-serif-title text-2xl font-bold text-[#091b31]">
            Reader Sign-In Required
          </h2>
          <p className="text-xs sm:text-sm text-[#44474d] mt-2 mb-6">
            Please sign in to your reading sanctuary to read full story chapters, listen to audio narration, and earn Spark Stars!
          </p>
          <Link
            href={`/login?role=reader&redirect=/read/${slug}`}
            className="w-full py-3 px-4 rounded-xl bg-[#203047] hover:bg-[#142337] text-white font-bold text-sm block transition-all shadow-sm"
          >
            Sign In with Pen-Name / Profile →
          </Link>
          <div className="mt-4">
            <Link href={`/book/${slug}`} className="text-xs text-[#2d6955] font-bold hover:underline">
              ← Return to Book Synopsis
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[#FAF7F0] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#203047] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="font-serif-story text-sm text-[#203047]">Preparing your reading sanctuary...</p>
      </div>
    );
  }

  if (!book || !book.chapters || book.chapters.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAF7F0] flex flex-col items-center justify-center p-4">
        <h2 className="font-serif-story text-xl font-bold text-[#203047]">Book not ready for reading</h2>
        <Link href="/library" className="mt-4 px-4 py-2 rounded-xl bg-[#203047] text-white text-xs font-semibold">
          Return to Library
        </Link>
      </div>
    );
  }

  // 🌙 BEDTIME CURFEW ENFORCEMENT SCREEN
  if (curfewActive && !curfewOverridden) {
    return (
      <div className="min-h-screen bg-[#08111e] text-[#e6f3fb] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
        <div className="absolute w-[500px] h-[500px] rounded-full bg-indigo-900/20 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-md w-full bg-[#101e33] border border-indigo-500/30 rounded-3xl p-8 shadow-2xl flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-600 to-amber-300 flex items-center justify-center text-4xl shadow-lg mb-4">
            🌙
          </div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-amber-300">
            Bedtime Curfew Guard Active
          </span>
          <h2 className="font-serif-story text-2xl font-bold text-white mt-1 mb-2">
            Time for Bed, Little Dreamer!
          </h2>
          <p className="text-xs text-indigo-200 leading-relaxed mb-6">
            Your reading curfew began at{' '}
            <strong className="text-amber-300">{childControls?.bedtimeCurfew || '8:30 PM'}</strong>.
            Your bookmarks and stars are safely stored in your Sanctuary for tomorrow morning!
          </p>

          <div className="w-full bg-[#091322] border border-indigo-500/20 rounded-2xl p-4 mb-6 text-left flex flex-col gap-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Bookmark Position:</span>
              <span className="font-bold text-white">Chapter {currentChapterIndex + 1}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Active Reader:</span>
              <span className="font-bold text-amber-300">
                {childControls?.displayName || user?.name || 'Young Reader'}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Sleep Health Guard:</span>
              <span className="font-bold text-emerald-400">Protected ✓</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full">
            <Link
              href="/library"
              className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <span>😴</span>
              <span>Close Books &amp; Sleep Well</span>
            </Link>

            <button
              onClick={() => setShowOverrideModal(true)}
              className="text-[11px] text-indigo-300 hover:text-white underline cursor-pointer"
            >
              Parent Override (+15 Extra Minutes)
            </button>
          </div>
        </div>

        {/* Parent Math Challenge Override Modal */}
        {showOverrideModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-[#091b31] shadow-2xl border border-[#ddeaf2]">
              <h3 className="font-serif-story text-base font-bold text-[#091b31] mb-1">
                Parent Passcode Check
              </h3>
              <p className="text-xs text-[#44474d] mb-4">
                To grant 15 extra minutes past bedtime, please answer:
              </p>
              <div className="p-3 bg-[#e9f6fd] rounded-xl text-center font-bold text-base mb-3 text-[#203047]">
                What is 7 × 8 ?
              </div>
              <input
                type="text"
                placeholder="Answer"
                value={overrideChallengeAnswer}
                onChange={(e) => setOverrideChallengeAnswer(e.target.value)}
                className="w-full px-3 py-2 border border-[#ddeaf2] rounded-xl text-center text-sm font-bold mb-3 focus:outline-none focus:ring-2 focus:ring-[#203047]"
              />
              {overrideError && (
                <p className="text-xs text-rose-600 mb-2 font-bold text-center">{overrideError}</p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowOverrideModal(false)}
                  className="flex-1 py-2 rounded-xl bg-gray-100 text-xs font-bold text-[#44474d]"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (overrideChallengeAnswer.trim() === '56') {
                      setCurfewOverridden(true);
                      setShowOverrideModal(false);
                      setCurfewActive(false);
                    } else {
                      setOverrideError('Incorrect answer. Grown-up verification required.');
                    }
                  }}
                  className="flex-1 py-2 rounded-xl bg-[#203047] text-white text-xs font-bold shadow-sm"
                >
                  Grant +15 Mins
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  const currentChapter = book.chapters[currentChapterIndex];
  const totalChapters = book.chapters.length;
  const progressPercent = Math.round(((currentChapterIndex + 1) / totalChapters) * 100);

  // Theme styling rules
  const themeClasses = {
    cream: 'bg-[#FAF7F0] text-[#263238]',
    white: 'bg-white text-[#111d23]',
    night: 'bg-[#162233] text-[#e6f3fb]',
  }[theme];

  const headerThemeClasses = {
    cream: 'bg-[#FAF7F0]/95 border-[#E6E7E5]',
    white: 'bg-white/95 border-gray-200',
    night: 'bg-[#091b31]/95 border-[#203047]',
  }[theme];

  const fontClass = {
    serif: 'font-serif-story',
    sans: 'font-sans-ui',
    dyslexic: 'font-opendyslexic',
  }[fontFamily];

  return (
    <div className={`min-h-screen flex flex-col ${themeClasses} transition-colors duration-200`}>
      {/* Top Utility Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 h-16 border-b backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4 ${headerThemeClasses}`}
      >
        {/* Left: Exit Reader */}
        <Link
          href={`/book/${book.slug}`}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-black/5 hover:bg-black/10 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span className="hidden sm:inline">Exit Reader</span>
        </Link>

        {/* Center: Story Title & Chapter Indicator */}
        <div className="flex flex-col items-center text-center">
          <span className="font-serif-story text-xs sm:text-sm font-bold truncate max-w-[220px] sm:max-w-md">
            {book.title}
          </span>
          <span className="text-[10px] text-[#2d6955] font-semibold">
            Chapter {currentChapterIndex + 1} of {totalChapters}
          </span>
        </div>

        {/* Right: Customization Controls */}
        <div className="flex items-center gap-2">
          {/* Bedtime Curfew Live Indicator */}
          {childControls?.curfewEnabled && (
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-100/90 border border-amber-300 text-amber-900 text-[11px] font-extrabold shadow-2xs">
              <span>🌙</span>
              <span>Curfew {childControls.bedtimeCurfew}</span>
            </div>
          )}

          {/* Language Toggle */}
          <div className="hidden sm:flex items-center bg-black/5 rounded-xl p-0.5 text-xs font-semibold">
            <button
              onClick={() => setLanguageMode('both')}
              className={`px-2 py-0.5 rounded-lg ${languageMode === 'both' ? 'bg-[#203047] text-white' : ''}`}
            >
              Dual
            </button>
            <button
              onClick={() => setLanguageMode('en')}
              className={`px-2 py-0.5 rounded-lg ${languageMode === 'en' ? 'bg-[#203047] text-white' : ''}`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguageMode('hi')}
              className={`px-2 py-0.5 rounded-lg ${languageMode === 'hi' ? 'bg-[#203047] text-white' : ''}`}
            >
              हिंदी
            </button>
          </div>

          {/* Read Aloud Narration Button */}
          <button
            onClick={() => {
              const text =
                languageMode === 'hi'
                  ? currentChapter.contentHi || currentChapter.contentEn
                  : currentChapter.contentEn;
              toggleReadAloud(text);
            }}
            title={isReadingAloud ? 'Pause narration' : 'Read aloud with voice narration'}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition shadow-xs ${
              isReadingAloud
                ? 'bg-[#2d6955] text-white animate-pulse'
                : 'bg-black/5 hover:bg-black/10 text-[#091b31]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {isReadingAloud ? 'pause_circle' : 'volume_up'}
            </span>
            <span className="hidden md:inline">{isReadingAloud ? 'Reading...' : 'Listen'}</span>
          </button>

          {/* Font Size A- / A+ */}
          <div className="flex items-center bg-black/5 rounded-xl px-1">
            <button
              onClick={() => setFontSize(Math.max(14, fontSize - 2))}
              className="px-2 py-1 text-xs font-bold hover:opacity-75"
              title="Decrease text size"
            >
              A-
            </button>
            <span className="text-[10px] text-gray-500 font-mono px-1">{fontSize}</span>
            <button
              onClick={() => setFontSize(Math.min(26, fontSize + 2))}
              className="px-2 py-1 text-xs font-bold hover:opacity-75"
              title="Increase text size"
            >
              A+
            </button>
          </div>

          {/* Font Family Dropdown */}
          <select
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value as any)}
            className="hidden md:block bg-black/5 border-0 rounded-xl px-2 py-1 text-xs font-semibold cursor-pointer focus:outline-none"
          >
            <option value="serif">Serif (Literary)</option>
            <option value="sans">Sans (Clean)</option>
            <option value="dyslexic">Dyslexia-Friendly</option>
          </select>

          {/* Theme Selector */}
          <div className="flex items-center bg-black/5 rounded-xl p-0.5">
            <button
              onClick={() => setTheme('cream')}
              title="Warm Parchment"
              className={`w-6 h-6 rounded-lg bg-[#FAF7F0] border border-gray-300 ${theme === 'cream' ? 'ring-2 ring-[#203047]' : ''}`}
            />
            <button
              onClick={() => setTheme('white')}
              title="Clean White"
              className={`w-6 h-6 rounded-lg bg-white border border-gray-300 ml-1 ${theme === 'white' ? 'ring-2 ring-[#203047]' : ''}`}
            />
            <button
              onClick={() => setTheme('night')}
              title="Night Sky"
              className={`w-6 h-6 rounded-lg bg-[#162233] ml-1 ${theme === 'night' ? 'ring-2 ring-[#ffdea7]' : ''}`}
            />
          </div>

          {/* Chapter Drawer Toggle */}
          <button
            onClick={() => setDrawerOpen(!drawerOpen)}
            className="w-8 h-8 rounded-xl bg-black/5 flex items-center justify-center hover:bg-black/10"
            title="Table of Contents"
          >
            <span className="material-symbols-outlined text-[18px]">format_list_bulleted</span>
          </button>
        </div>
      </header>

      {/* Chapter Progress Tracker Bar */}
      <div className="fixed top-16 left-0 right-0 z-30 h-1.5 bg-[#E7EFE8]">
        <div
          className="h-full bg-[#2d6955] transition-all duration-300 rounded-r-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Daily Screen Time Goal Banner */}
      {timeLimitActive && !timeLimitSnoozed && (
        <div className="fixed top-[70px] left-0 right-0 z-30 bg-gradient-to-r from-amber-400 to-amber-300 text-[#091b31] px-4 py-2 font-bold text-xs flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <span className="text-sm">🌟</span>
            <span>
              Reading Milestone Reached! You have read for{' '}
              {childControls?.dailyTimeLimitMinutes || 45} mins today. Take a quick stretch for your eyes!
            </span>
          </div>
          <button
            onClick={() => setTimeLimitSnoozed(true)}
            className="px-2.5 py-1 bg-white hover:bg-gray-100 rounded-lg text-xs font-bold text-[#091b31] shadow-xs cursor-pointer shrink-0"
          >
            I Stretched ✓
          </button>
        </div>
      )}

      {/* Main Reading Canvas */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-8 pt-28 pb-32">
        {/* Chapter Header */}
        <div className="text-center mb-10 pb-6 border-b border-black/10">
          <span className="text-xs uppercase font-bold tracking-widest text-[#2d6955]">
            Chapter {currentChapter.chapterNumber}
          </span>
          <h1 className="font-serif-story text-2xl sm:text-4xl font-bold mt-2 leading-tight">
            {currentChapter.title}
          </h1>
          {currentChapter.titleHindi && (
            <h2 className="font-serif-story text-lg sm:text-2xl text-[#2d6955] mt-1 font-semibold">
              {currentChapter.titleHindi}
            </h2>
          )}
        </div>

        {/* Embedded Illustrated Scene */}
        {currentChapter.illustrationUrl && (
          <div className="my-8 rounded-3xl overflow-hidden shadow-tactile-lg max-h-[460px] bg-black/5">
            <img
              src={currentChapter.illustrationUrl}
              alt={currentChapter.title}
              className="w-full h-full object-cover max-h-[460px]"
            />
          </div>
        )}

        {/* Reading Text Content */}
        <div
          className={`${fontClass} leading-relaxed transition-all`}
          style={{ fontSize: `${fontSize}px` }}
        >
          {languageMode === 'both' && currentChapter.contentHi ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
              {/* English Column */}
              <div className="p-4 rounded-2xl bg-black/[0.02]">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-[#75777e] mb-3">
                  English
                </span>
                <p className="whitespace-pre-line leading-[1.8]">{currentChapter.contentEn}</p>
              </div>

              {/* Hindi Column */}
              <div className="p-4 rounded-2xl bg-black/[0.02]">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-[#2d6955] mb-3">
                  हिंदी (Hindi)
                </span>
                <p className="whitespace-pre-line leading-[1.8] text-[#2d6955] font-medium">
                  {currentChapter.contentHi}
                </p>
              </div>
            </div>
          ) : languageMode === 'hi' && currentChapter.contentHi ? (
            <div className="py-4">
              <p className="whitespace-pre-line leading-[1.9] text-[#2d6955] font-medium">
                {currentChapter.contentHi}
              </p>
            </div>
          ) : (
            <div className="py-4">
              <p className="whitespace-pre-line leading-[1.9]">{currentChapter.contentEn}</p>
            </div>
          )}
        </div>

        {/* Book Completed Banner */}
        {completedCelebration && (
          <div className="mt-14 p-8 rounded-3xl bg-[#e9f6fd] border border-[#ddeaf2] text-center shadow-tactile-md">
            <span className="text-4xl block mb-2">🎉 🌟</span>
            <h3 className="font-serif-story text-2xl font-bold text-[#091b31]">
              Story Completed! Explorer Star Earned!
            </h3>
            <p className="text-sm text-[#44474d] max-w-md mx-auto mt-2">
              You finished reading {book.title}. Solidify what you learned and earn 25 bonus stars on the comprehension quiz!
            </p>
            <div className="mt-5 flex justify-center gap-4">
              <Link
                href={`/activities?quiz=${book.slug}`}
                className="px-6 py-3 rounded-xl bg-[#203047] text-white text-xs font-bold shadow-tactile-sm hover:bg-[#091b31]"
              >
                Take Comprehension Quiz
              </Link>
              <Link
                href="/library"
                className="px-6 py-3 rounded-xl bg-white text-[#203047] border border-[#ddeaf2] text-xs font-semibold"
              >
                Find Next Book
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Floating Navigation Dock */}
      <footer
        className={`fixed bottom-0 left-0 right-0 z-40 h-16 border-t backdrop-blur-md px-6 flex items-center justify-between ${headerThemeClasses}`}
      >
        <button
          disabled={currentChapterIndex === 0}
          onClick={() => setCurrentChapterIndex(Math.max(0, currentChapterIndex - 1))}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            currentChapterIndex === 0
              ? 'opacity-30 cursor-not-allowed'
              : 'bg-black/5 hover:bg-black/10'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">chevron_left</span>
          <span>Previous Chapter</span>
        </button>

        <span className="text-xs text-gray-500 font-medium">
          {progressPercent}% completed
        </span>

        <button
          disabled={currentChapterIndex >= totalChapters - 1}
          onClick={() => setCurrentChapterIndex(Math.min(totalChapters - 1, currentChapterIndex + 1))}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            currentChapterIndex >= totalChapters - 1
              ? 'opacity-30 cursor-not-allowed'
              : 'bg-[#203047] text-white hover:bg-[#091b31] shadow-tactile-sm'
          }`}
        >
          <span>Next Chapter</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        </button>
      </footer>

      {/* Chapters Table of Contents Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-sm bg-white text-[#111d23] h-full shadow-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#ddeaf2]">
                <h3 className="font-serif-story text-base font-bold text-[#091b31]">
                  Table of Contents
                </h3>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center"
                >
                  ✕
                </button>
              </div>

              <div className="mt-4 flex flex-col gap-2">
                {book.chapters.map((ch: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentChapterIndex(idx);
                      setDrawerOpen(false);
                    }}
                    className={`p-3 rounded-xl text-left transition-all flex items-center gap-3 ${
                      idx === currentChapterIndex
                        ? 'bg-[#203047] text-white'
                        : 'bg-[#f4faff] hover:bg-[#e9f6fd] text-[#091b31]'
                    }`}
                  >
                    <span className="w-6 h-6 rounded-full bg-black/10 text-xs font-bold flex items-center justify-center shrink-0">
                      {ch.chapterNumber}
                    </span>
                    <div className="truncate">
                      <p className="text-xs font-bold truncate">{ch.title}</p>
                      {ch.titleHindi && <p className="text-[10px] opacity-80 truncate">{ch.titleHindi}</p>}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[#ddeaf2]">
              <Link
                href={`/activities?quiz=${book.slug}`}
                className="w-full py-2.5 rounded-xl bg-[#ffdea7] text-[#261800] text-xs font-bold text-center block"
              >
                Open Comprehension Quiz
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReaderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF7F0] flex items-center justify-center">Loading reading sanctuary...</div>}>
      <ReaderContent />
    </Suspense>
  );
}
