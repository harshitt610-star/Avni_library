'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { RefreshCw, BookOpen, Home, AlertCircle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected errors for production diagnostics
    console.error('Unhandled StoryNest Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white rounded-3xl border border-[#ddeaf2] p-8 sm:p-10 shadow-tactile-sm">
        <div className="w-16 h-16 bg-amber-50 rounded-2xl border border-amber-100 flex items-center justify-center mx-auto mb-6 text-amber-600">
          <AlertCircle className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-black text-[#1a2e3b] mb-3">
          A Page Slipped Away!
        </h1>
        <p className="text-sm text-[#556977] mb-8 leading-relaxed">
          Looks like we encountered a small flutter in the nest. Don&apos;t worry—your reading progress and bookmarks are safe and sound.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => reset()}
            className="flex-1 py-3 px-5 rounded-2xl bg-[#004e64] hover:bg-[#003d4f] text-white text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-tactile-sm hover:-translate-y-0.5 active:translate-y-0"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <Link
            href="/library"
            className="flex-1 py-3 px-5 rounded-2xl bg-[#f4ebd9] hover:bg-[#eadecc] text-[#1a2e3b] text-sm font-bold transition-all flex items-center justify-center gap-2"
          >
            <BookOpen className="w-4 h-4 text-[#ff8000]" />
            Story Library
          </Link>
        </div>

        <div className="mt-6 pt-6 border-t border-[#f0f4f8]">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#7a8b99] hover:text-[#004e64] transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            Return to StoryNest Home
          </Link>
        </div>
      </div>
    </div>
  );
}

