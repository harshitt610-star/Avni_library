import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { connectToDatabase } from '@/lib/mongodb';
import { Book, Quiz } from '@/models';
import { getCurrentUser } from '@/lib/auth';
import BookDetailsInteractive, { BookCtaActions } from './BookDetailsInteractive';

export const dynamic = 'force-dynamic';

export default async function BookDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await connectToDatabase();
  const currentUser = await getCurrentUser();
  const book = await Book.findOne({ slug }).lean();

  if (!book) {
    notFound();
  }

  // Restrict unpublished and archived books to Super Admins
  if ((!book.isPublished || book.isArchived) && currentUser?.role !== 'admin') {
    notFound();
  }

  // Fetch companion quiz for this book
  const companionQuiz = await Quiz.findOne({
    $or: [{ bookId: book._id }, { bookSlug: book.slug }],
    isPublished: true,
  }).lean();

  const relatedBooks = await Book.find({
    _id: { $ne: book._id },
    ageBracket: book.ageBracket,
    isPublished: true,
    isArchived: { $ne: true },
  })
    .limit(3)
    .lean();

  const serializedBook = JSON.parse(JSON.stringify(book));
  const serializedQuiz = companionQuiz ? JSON.parse(JSON.stringify(companionQuiz)) : null;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 pt-24 pb-16 bg-[#f4faff]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs text-[#44474d] mb-6">
            <Link href="/" className="hover:text-[#091b31]">
              Home
            </Link>
            <span>/</span>
            <Link href="/library" className="hover:text-[#091b31]">
              Library
            </Link>
            <span>/</span>
            <span className="text-[#091b31] font-semibold">{book.title}</span>
          </div>

          {/* Book Showcase Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left Cover & Audio Preview Column */}
            <div className="lg:col-span-5 flex flex-col gap-6 w-full max-w-md mx-auto lg:max-w-none">
              <div className="relative aspect-[3/4] rounded-3xl bg-[#203047] overflow-hidden shadow-tactile-xl border border-[#ddeaf2] w-full">
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                  <span className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-xs text-xs font-bold text-[#091b31] shadow-xs">
                    Ages {book.ageBracket}
                  </span>
                  {book.language === 'bilingual' && (
                    <span className="px-2.5 py-1 rounded-full bg-[#ffdea7] text-xs font-bold text-[#261800] shadow-xs">
                      English + हिंदी
                    </span>
                  )}
                </div>
              </div>

              {/* Working Audio Narration Engine */}
              <BookDetailsInteractive book={serializedBook} companionQuiz={serializedQuiz} />
            </div>

            {/* Right Information Column */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-3 py-1 rounded-full bg-[#b1f0d6] text-[#002117] text-xs font-bold">
                    {book.genre}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-[#e3f0f8] text-[#44474d] text-xs font-semibold">
                    {book.readingTimeMinutes} Minutes Reading Time
                  </span>
                  <div className="flex items-center gap-1 text-[#f4be55] text-xs font-bold ml-auto">
                    <span>★</span>
                    <span className="text-[#091b31]">{book.rating || 4.9}</span>
                    <span className="text-[#75777e] font-normal">({book.readersCount || 1200} reads)</span>
                  </div>
                </div>

                <h1 className="font-serif-story text-3xl sm:text-4xl lg:text-5xl font-bold text-[#091b31] tracking-tight leading-tight">
                  {book.title}
                </h1>
                {book.titleHindi && (
                  <h2 className="font-serif-story text-xl sm:text-2xl text-[#2d6955] font-semibold mt-1">
                    {book.titleHindi}
                  </h2>
                )}
                <p className="text-sm text-[#44474d] mt-2">
                  Written by{' '}
                  <span className="font-bold text-[#091b31]">{book.authorName}</span>
                </p>
              </div>

              {/* CTAs */}
              <BookCtaActions bookSlug={book.slug} companionQuiz={serializedQuiz} />

              {/* Synopsis */}
              <div className="bg-white border border-[#ddeaf2] rounded-2xl p-6 shadow-tactile-sm flex flex-col gap-3">
                <h3 className="font-serif-story text-lg font-bold text-[#091b31]">Story Synopsis</h3>
                <p className="text-sm text-[#44474d] leading-relaxed">{book.synopsis}</p>
                {book.synopsisHindi && (
                  <p className="text-sm text-[#2d6955] leading-relaxed pt-2 border-t border-[#ddeaf2]">
                    {book.synopsisHindi}
                  </p>
                )}
              </div>

              {/* Chapters Breakdown */}
              <div className="bg-white border border-[#ddeaf2] rounded-2xl p-4 sm:p-6 shadow-tactile-sm flex flex-col gap-4">
                <h3 className="font-serif-story text-base sm:text-lg font-bold text-[#091b31]">
                  Chapter Table of Contents ({book.chapters?.length || 0} Chapters)
                </h3>
                <div className="divide-y divide-[#ddeaf2]">
                  {book.chapters?.map((chap: { chapterNumber: number; title: string; titleHindi?: string }, idx: number) => (
                    <div key={idx} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-7 h-7 rounded-full bg-[#e9f6fd] text-[#203047] text-xs font-bold flex items-center justify-center shrink-0">
                          {chap.chapterNumber}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#091b31] truncate">{chap.title}</p>
                          {chap.titleHindi && (
                            <p className="text-xs text-[#2d6955] truncate">{chap.titleHindi}</p>
                          )}
                        </div>
                      </div>
                      <Link
                        href={`/read/${book.slug}?chapter=${chap.chapterNumber}`}
                        className="text-xs font-semibold text-[#203047] hover:underline self-end sm:self-auto shrink-0 whitespace-nowrap bg-[#f4faff] sm:bg-transparent px-2.5 py-1 sm:p-0 rounded-lg"
                      >
                        Read Chapter →
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              {/* Author Bio Card */}
              <div className="bg-[#e9f6fd] border border-[#ddeaf2] rounded-2xl p-5 shadow-tactile-sm flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#203047] text-white flex items-center justify-center font-bold text-lg shrink-0">
                  {book.authorName[0]}
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="font-bold text-sm text-[#091b31]">{book.authorName}</h4>
                  <p className="text-xs text-[#44474d] leading-relaxed">
                    {book.authorBio ||
                      'Passionate creator and educator dedicated to igniting curiosity through bilingual storytelling.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Related Stories */}
          {relatedBooks.length > 0 && (
            <div className="mt-16 pt-10 border-t border-[#ddeaf2]">
              <h3 className="font-serif-story text-2xl font-bold text-[#091b31] mb-6">
                More Stories For Ages {book.ageBracket}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {relatedBooks.map((rel: any) => (
                  <Link
                    key={rel._id.toString()}
                    href={`/book/${rel.slug}`}
                    className="bg-white rounded-2xl border border-[#ddeaf2] p-4 shadow-tactile-sm hover:shadow-tactile-md transition-all flex items-center gap-4 group"
                  >
                    <img
                      src={rel.coverUrl}
                      alt={rel.title}
                      className="w-16 h-20 object-cover rounded-xl shrink-0"
                    />
                    <div className="flex flex-col">
                      <h4 className="font-serif-story font-bold text-sm text-[#091b31] group-hover:text-[#2d6955] line-clamp-1">
                        {rel.title}
                      </h4>
                      <p className="text-xs text-[#75777e] mt-0.5">By {rel.authorName}</p>
                      <span className="text-[11px] font-semibold text-[#2d6955] mt-1">
                        View Story →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
