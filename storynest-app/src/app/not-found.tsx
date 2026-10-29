import Link from 'next/link';
import { Compass, BookOpen, Sparkles, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center p-6 text-center">
      <div className="max-w-lg w-full bg-white rounded-3xl border border-[#ddeaf2] p-8 sm:p-12 shadow-tactile-sm">
        <div className="w-20 h-20 bg-[#f4ebd9] rounded-3xl border border-[#eadecc] flex items-center justify-center mx-auto mb-6 text-[#ff8000]">
          <Compass className="w-10 h-10 animate-spin-slow" />
        </div>

        <span className="inline-block px-3.5 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-[#e8f4f8] text-[#004e64] mb-3">
          Error 404 • Missing Chapter
        </span>

        <h1 className="text-3xl font-black text-[#1a2e3b] mb-3">
          This Story Page Doesn&apos;t Exist
        </h1>
        <p className="text-sm text-[#556977] mb-8 leading-relaxed max-w-sm mx-auto">
          The page you are looking for may have been moved, renamed, or is still waiting to be written by our young authors.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <Link
            href="/library"
            className="py-3 px-4 rounded-2xl bg-[#004e64] hover:bg-[#003d4f] text-white text-sm font-black transition-all flex items-center justify-center gap-2 shadow-tactile-sm hover:-translate-y-0.5"
          >
            <BookOpen className="w-4 h-4" />
            Explore Library
          </Link>
          <Link
            href="/reader/stories"
            className="py-3 px-4 rounded-2xl bg-[#f4ebd9] hover:bg-[#eadecc] text-[#1a2e3b] text-sm font-bold transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-[#ff8000]" />
            Story Studio
          </Link>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#7a8b99] hover:text-[#004e64] transition-colors"
        >
          <Home className="w-3.5 h-3.5" />
          Take me back to StoryNest Home
        </Link>
      </div>
    </div>
  );
}

