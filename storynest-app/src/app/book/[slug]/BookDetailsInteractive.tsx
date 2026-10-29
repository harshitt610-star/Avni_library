'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AudioNarrationPlayer from '@/components/AudioNarrationPlayer';
import BookCompanionQuizModal from '@/components/BookCompanionQuizModal';
import { useAuth } from '@/context/AuthContext';

interface CompanionQuizData {
  _id: string;
  title: string;
  rewardStars: number;
  bookTitle: string;
  questions: Array<{
    id: string;
    questionEn: string;
    questionHi?: string;
    optionsEn: string[];
    optionsHi?: string[];
    correctIndex: number;
    explanation?: string;
  }>;
}

interface BookDetailsInteractiveProps {
  book: {
    _id: string;
    title: string;
    slug: string;
    synopsis?: string;
    synopsisHindi?: string;
    audioPreviewUrl?: string;
    chapters?: Array<{
      chapterNumber: number;
      title: string;
      titleHindi?: string;
      contentEn: string;
      contentHi?: string;
    }>;
  };
  companionQuiz?: CompanionQuizData | null;
}

export default function BookDetailsInteractive({ book, companionQuiz }: BookDetailsInteractiveProps) {
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);

  const chapterOne = book.chapters && book.chapters.length > 0 ? book.chapters[0] : null;

  return (
    <>
      {/* 1. Working Interactive Audio Narration Player */}
      <AudioNarrationPlayer
        bookTitle={book.title}
        bookSynopsis={book.synopsis}
        bookSynopsisHindi={book.synopsisHindi}
        chapterOneTitle={chapterOne?.title}
        chapterOneContentEn={chapterOne?.contentEn}
        chapterOneContentHi={chapterOne?.contentHi}
        audioPreviewUrl={book.audioPreviewUrl}
      />

      {/* 2. Interactive Companion Quiz Modal (when active) */}
      {companionQuiz && (
        <BookCompanionQuizModal
          isOpen={isQuizModalOpen}
          onClose={() => setIsQuizModalOpen(false)}
          quiz={companionQuiz}
        />
      )}
    </>
  );
}

export function BookCtaActions({
  bookSlug,
  companionQuiz,
}: {
  bookSlug: string;
  companionQuiz?: CompanionQuizData | null;
}) {
  const { user, requireAuth } = useAuth();
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);

  const handleStartQuiz = () => {
    if (!user) {
      requireAuth(`/activities?quiz=${bookSlug}`, 'Sign in to take the companion comprehension quiz and collect Stars & Badges!');
      return;
    }
    setIsQuizModalOpen(true);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 py-2 w-full">
        <button
          type="button"
          onClick={() => requireAuth(`/read/${bookSlug}`, 'Sign in to start reading and collecting badges!')}
          className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 rounded-xl bg-[#203047] text-white text-sm sm:text-base font-semibold shadow-tactile-md hover:bg-[#091b31] transition-all active:translate-y-px text-center cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">auto_stories</span>
          <span>Start Reading Experience</span>
        </button>

        {companionQuiz ? (
          <button
            onClick={handleStartQuiz}
            className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3.5 rounded-xl bg-[#ffdea7] text-[#261800] text-xs sm:text-sm font-bold shadow-tactile-sm hover:bg-[#f4be55] transition-all active:translate-y-px cursor-pointer text-center"
          >
            <span className="material-symbols-outlined text-[18px]">quiz</span>
            <span>Comprehension Quiz (+{companionQuiz.rewardStars || 25} Stars)</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => requireAuth(`/activities?quiz=${bookSlug}`, 'Sign in to participate in the youth arena quiz!')}
            className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3.5 rounded-xl bg-[#ffdea7] text-[#261800] text-xs sm:text-sm font-bold shadow-tactile-sm hover:bg-[#f4be55] transition-all active:translate-y-px text-center cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">quiz</span>
            <span>Youth Arena Quiz (+25 Stars)</span>
          </button>
        )}
      </div>

      {companionQuiz && (
        <BookCompanionQuizModal
          isOpen={isQuizModalOpen}
          onClose={() => setIsQuizModalOpen(false)}
          quiz={companionQuiz}
        />
      )}
    </>
  );
}
