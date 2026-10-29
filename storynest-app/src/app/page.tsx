import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { connectToDatabase } from '@/lib/mongodb';
import { Book, Workshop, CmsPage, WebsiteSetting } from '@/models';
import { getCurrentUser } from '@/lib/auth';

interface BookCardItem {
  _id: string | { toString(): string };
  title: string;
  titleHindi?: string;
  slug?: string;
  rating?: number;
  readersCount?: number;
  authorName: string;
  synopsis: string;
  coverUrl: string;
  genre: string;
  ageBracket: string;
  readingTimeMinutes: number;
}

interface WorkshopCardItem {
  _id: string | { toString(): string };
  title: string;
  description: string;
  category?: string;
  ageBracket?: string;
  mentorName?: string;
  instructorAvatar?: string;
  instructorName?: string;
  scheduledAt?: string | Date;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  let books: any[] = [];
  let workshops: any[] = [];
  let homeCms: any = null;
  let settings: any = null;
  let currentUser: any = null;

  try {
    await connectToDatabase();
    [books, workshops, homeCms, settings, currentUser] = await Promise.all([
      Book.find({ isPublished: true, isArchived: { $ne: true } }).sort({ featured: -1, createdAt: -1 }).limit(4).lean(),
      Workshop.find({}).sort({ scheduledAt: 1 }).limit(2).lean(),
      CmsPage.findOne({ slug: 'home' }).lean(),
      WebsiteSetting.findOne({ key: 'global' }).lean(),
      getCurrentUser(),
    ]);
  } catch (err) {
    console.warn('Prerender / database connection fallback for HomePage:', err);
  }

  // Handle Maintenance Mode
  if (settings?.maintenanceMode && currentUser?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#FAF7F0] text-[#203047] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-3xl bg-[#203047] text-white text-4xl flex items-center justify-center mb-6 shadow-tactile-xl">
          🌙
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-[#2F6B57] bg-[#2F6B57]/10 px-3 py-1 rounded-full mb-3">
          Quiet Library Restoration
        </span>
        <h1 className="font-serif-story text-3xl sm:text-5xl font-bold max-w-xl text-[#203047] leading-tight">
          StoryNest is Restocking the Shelves
        </h1>
        <p className="text-sm sm:text-base text-gray-600 max-w-lg mt-3 leading-relaxed font-sans">
          Our digital sanctuary is currently undergoing scheduled platform maintenance. We are tuning our bilingual audio readers and organizing new illustrated manuscripts.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/login?role=admin"
            className="px-5 py-2.5 rounded-xl bg-[#203047] text-white text-xs font-bold shadow-tactile hover:bg-[#142030] transition"
          >
            Administrator Login
          </Link>
          <a
            href="mailto:editorial@storynest.com"
            className="text-xs font-bold text-[#203047] underline hover:text-[#2F6B57]"
          >
            Contact Editorial Board
          </a>
        </div>
      </div>
    );
  }

  const featuredBook = books[0] || null;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 pt-20">
        {/* ADMIN MAINTENANCE ALERT */}
        {settings?.maintenanceMode && currentUser?.role === 'admin' && (
          <div className="bg-amber-500 text-[#203047] text-xs py-2 px-4 text-center font-bold border-b border-amber-600 flex items-center justify-center gap-2">
            <span>⚠️ PLATFORM MAINTENANCE MODE IS ACTIVE — Public visitors are currently seeing the restoration screen.</span>
            <Link href="/admin" className="underline font-black hover:text-white">
              Open Admin Settings &rarr;
            </Link>
          </div>
        )}

        {/* GLOBAL ANNOUNCEMENT BANNER FROM MONGO SETTINGS */}
        {settings?.announcementBarActive && settings?.announcementBarText && (
          <div className="bg-[#203047] text-white text-xs py-2 px-4 text-center font-medium border-b border-white/10 flex items-center justify-center gap-2">
            <span>{settings.announcementBarText}</span>
            <Link href="/activities" className="underline font-bold text-[#ffdea7] hover:text-white">
              Learn more &rarr;
            </Link>
          </div>
        )}

        {/* HERO SECTION */}
        <section className="relative w-full bg-[#e9f6fd] px-4 sm:px-6 lg:px-8 py-16 lg:py-24 overflow-hidden border-b border-[#ddeaf2]">
          {/* Ambient Lighting Orbs */}
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#b1f0d6]/30 blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 -right-24 w-80 h-80 rounded-full bg-[#ffdea7]/30 blur-3xl pointer-events-none" />

          <div className="max-w-[1360px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
            {/* Left Content Column */}
            <div className="lg:col-span-7 flex flex-col items-start gap-6">
              {/* Dual Audience Badges */}
              <div className="flex flex-wrap items-center gap-2">
                {homeCms?.heroBadge ? (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white text-[#091b31] text-xs font-semibold shadow-tactile-sm">
                    {homeCms.heroBadge}
                  </span>
                ) : (
                  <>
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white text-[#091b31] text-xs font-semibold shadow-tactile-sm">
                      <span className="text-[#f4be55]">★</span> For Young Readers & Families
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#b1f0d6] text-[#002117] text-xs font-semibold shadow-tactile-sm">
                      <span className="material-symbols-outlined text-[15px]">edit_note</span> For Authors & Creators
                    </span>
                  </>
                )}
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#e3f0f8] text-[#44474d] text-xs font-medium">
                  Bilingual: हिंदी &amp; English Stories
                </span>
              </div>

              {/* Headline */}
              <h1 className="font-serif-story text-4xl sm:text-5xl lg:text-6xl text-[#091b31] font-bold tracking-tight leading-[1.15]">
                {homeCms?.heroHeadline ? (
                  homeCms.heroHeadline
                ) : (
                  <>
                    Every Great Story Begins with a Little{' '}
                    <span className="text-[#2d6955] italic underline decoration-[#f4be55]/60 underline-offset-8">
                      Imagination.
                    </span>
                  </>
                )}
              </h1>

              {/* Subtitle */}
              <p className="font-serif-story text-lg sm:text-xl text-[#44474d] max-w-xl leading-relaxed">
                {homeCms?.heroSubheadline ||
                  'Discover wonderful books, build creative skills, join inspiring workshops, and bring your own stories to life in a safe, nurturing digital haven.'}
              </p>

              {/* CTA Cluster */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/library"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#203047] text-white text-base font-semibold shadow-tactile-md hover:bg-[#091b31] transition-all active:translate-y-px"
                >
                  <span className="material-symbols-outlined text-[20px]">auto_stories</span>
                  Explore the Library
                </Link>
                <Link
                  href="/publish"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#2d6955] text-white text-base font-semibold shadow-tactile-sm hover:opacity-95 transition-all active:translate-y-px"
                >
                  <span className="material-symbols-outlined text-[20px]">history_edu</span>
                  Publish with StoryNest
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-6 pt-4 text-sm text-[#44474d]">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#2d6955] text-[20px]">verified</span>
                  <span className="font-semibold">100% Ad-Free &amp; COPPA Safe</span>
                </div>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#c5c6cd]" />
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#f4be55] text-[20px]">star</span>
                  <span className="font-semibold">Bilingual (English &amp; हिंदी)</span>
                </div>
              </div>
            </div>

            {/* Right Visual Column: Featured Story Showcase */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-[430px] rounded-3xl bg-white p-6 shadow-tactile-xl border border-[#ddeaf2] flex flex-col gap-4">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#203047]">
                  <img
                    src={featuredBook?.coverUrl || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop"}
                    alt={featuredBook?.title || "StoryNest Featured Book"}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#203047]/80 backdrop-blur-xs text-white text-[11px] font-bold">
                    Featured Story
                  </div>
                  <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-[#ffdea7] text-[#261800] text-[11px] font-bold">
                    ★ {featuredBook?.rating || '4.9'} Rating
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#2d6955] uppercase tracking-wide">
                      {featuredBook?.genre || 'Astronomy & Adventure'} • Ages {featuredBook?.ageBracket || '6-8'}
                    </span>
                    <span className="text-xs text-[#44474d]">{featuredBook?.readingTimeMinutes || 15} min read</span>
                  </div>
                  <h3 className="font-serif-story text-xl font-bold text-[#091b31]">
                    {featuredBook?.title || 'Tara and the Whispering Stars'}
                  </h3>
                  <p className="text-xs text-[#44474d] line-clamp-2">
                    {featuredBook?.synopsis || 'A young girl discovers glowing constellation riddles over Jaipur and decodes the mystery of the Seven Sages.'}
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2 border-t border-[#ddeaf2]">
                  <Link
                    href={`/read/${featuredBook?.slug || 'tara-and-the-whispering-stars'}`}
                    className="flex-1 py-2.5 rounded-xl bg-[#203047] text-white text-xs font-semibold text-center hover:bg-[#091b31] transition-colors"
                  >
                    Read Online Free
                  </Link>
                  <Link
                    href={`/book/${featuredBook?.slug || 'tara-and-the-whispering-stars'}`}
                    className="px-4 py-2.5 rounded-xl bg-[#e9f6fd] text-[#203047] text-xs font-semibold text-center hover:bg-[#ddeaf2] transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURED BOOKS CATALOGUE PREVIEW */}
        <section className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#2d6955]">
                Curated Children’s Books
              </span>
              <h2 className="font-serif-story text-3xl font-bold text-[#091b31] mt-1">
                Explore Starlit Stories
              </h2>
            </div>
            <Link
              href="/library"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#203047] hover:text-[#2d6955]"
            >
              View Full Library ({books.length}+ Books)
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(books as unknown as BookCardItem[]).map((book) => (
              <div
                key={book._id.toString()}
                className="bg-white rounded-2xl border border-[#ddeaf2] overflow-hidden shadow-tactile-sm hover:shadow-tactile-md transition-all flex flex-col group"
              >
                <div className="relative aspect-[3/4] bg-[#203047] overflow-hidden">
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-[10px] font-bold text-[#091b31]">
                    Ages {book.ageBracket}
                  </span>
                  <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded-full bg-[#203047]/80 text-white text-[10px] font-semibold">
                    {book.genre}
                  </span>
                </div>
                <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                  <div>
                    <h3 className="font-serif-story font-bold text-[#091b31] text-base group-hover:text-[#2d6955] transition-colors line-clamp-1">
                      {book.title}
                    </h3>
                    {book.titleHindi && (
                      <p className="text-xs text-[#44474d] font-medium mt-0.5">{book.titleHindi}</p>
                    )}
                    <p className="text-xs text-[#75777e] mt-1">By {book.authorName}</p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-[#ddeaf2]">
                    <div className="flex items-center gap-1 text-[#f4be55] text-xs font-bold">
                      <span>★</span>
                      <span className="text-[#091b31]">{book.rating || 4.9}</span>
                    </div>
                    <Link
                      href={`/book/${book.slug}`}
                      className="px-3 py-1.5 rounded-lg bg-[#e9f6fd] text-[#203047] text-xs font-semibold hover:bg-[#203047] hover:text-white transition-all"
                    >
                      Read Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* WORKSHOPS & EDUCATIONAL BANNER */}
        <section className="w-full bg-[#e3f0f8] py-16 border-y border-[#ddeaf2]">
          <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 flex flex-col gap-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#2d6955]">
                  Interactive Learning
                </span>
                <h2 className="font-serif-story text-3xl sm:text-4xl font-bold text-[#091b31] leading-tight">
                  Live Masterclasses &amp; Comprehension Quizzes
                </h2>
                <p className="text-sm text-[#44474d] leading-relaxed">
                  Connect children directly with published authors and illustrators in interactive video rooms,
                  and earn Explorer Stars through reading quizzes.
                </p>
                <div className="flex items-center gap-4 pt-2">
                  <Link
                    href="/workshops"
                    className="px-5 py-3 rounded-xl bg-[#203047] text-white text-xs font-semibold hover:bg-[#091b31] shadow-tactile-sm transition-all"
                  >
                    Browse Workshops
                  </Link>
                  <Link
                    href="/activities"
                    className="px-5 py-3 rounded-xl bg-white text-[#203047] border border-[#ddeaf2] text-xs font-semibold hover:bg-[#f4faff] shadow-tactile-sm transition-all"
                  >
                    Take a Quiz
                  </Link>
                </div>
              </div>

              {/* Workshops Cards */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(workshops as unknown as WorkshopCardItem[]).map((ws) => (
                  <div
                    key={ws._id.toString()}
                    className="bg-white rounded-2xl p-5 border border-[#ddeaf2] shadow-tactile-sm flex flex-col justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#b1f0d6] text-[#002117] font-bold">
                          {ws.category}
                        </span>
                        <span className="text-[#75777e]">{ws.ageBracket}</span>
                      </div>
                      <h3 className="font-serif-story font-bold text-[#091b31] text-base leading-snug">
                        {ws.title}
                      </h3>
                      <p className="text-xs text-[#44474d] mt-2 line-clamp-2">{ws.description}</p>
                    </div>

                    <div className="pt-3 border-t border-[#ddeaf2] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <img
                          src={ws.instructorAvatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80'}
                          alt={ws.instructorName}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <span className="font-semibold text-[#091b31]">{ws.instructorName}</span>
                      </div>
                      <Link
                        href={`/workshops?register=${ws._id}`}
                        className="px-3 py-1 rounded-lg bg-[#2d6955] text-white font-semibold hover:opacity-95"
                      >
                        Register
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SELF-PUBLISHING CREATOR BANNER */}
        <section className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="rounded-3xl bg-[#203047] text-white p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-tactile-xl">
            <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-[#2d6955]/30 blur-3xl pointer-events-none" />
            <div className="relative z-10 max-w-2xl flex flex-col gap-6">
              <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-[#ffdea7]">
                Author &amp; Creator Studio
              </span>
              <h2 className="font-serif-story text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                Your Story Deserves to Be Read by the World.
              </h2>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                From professional manuscript editing and whimsical children’s illustration to bilingual
                formatting and global distribution—we partner with authors every step of the journey.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/publish"
                  className="px-6 py-3.5 rounded-xl bg-[#2d6955] text-white text-sm font-semibold hover:opacity-95 shadow-tactile-sm transition-all"
                >
                  Explore Publishing Packages
                </Link>
                <Link
                  href="/author"
                  className="px-6 py-3.5 rounded-xl bg-white/10 text-white text-sm font-semibold hover:bg-white/20 transition-all"
                >
                  Go to Author Studio
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
