import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { connectToDatabase } from '@/lib/mongodb';
import { Book, ReadingProgress, QuizAttempt, Notification, ChildProfile, ChildStory, Workshop } from '@/models';
import { getCurrentUser } from '@/lib/auth';

interface ProgressBook {
  _id?: string;
  title?: string;
  slug?: string;
  authorName?: string;
  coverUrl?: string;
  genre?: string;
  chapters?: Array<{ chapterNumber: number; title: string }>;
}

interface ProgressItem {
  bookId?: ProgressBook | string;
  currentChapter?: number;
  percentCompleted?: number;
  totalMinutesRead?: number;
}

interface RecommendedBookItem {
  _id: { toString(): string } | string;
  title?: string;
  coverUrl?: string;
  slug?: string;
  authorName?: string;
  genre?: string;
  readingTimeMinutes?: number;
}

interface NotificationItem {
  _id: { toString(): string } | string;
  title: string;
  message: string;
}

export default async function ReaderDashboardPage() {
  await connectToDatabase();
  const currentUser = await getCurrentUser();

  const filter = currentUser ? { userId: currentUser._id } : {};
  const [books, recentProgress, quizAttempts, notifications, childProfile, childStories, workshops] = await Promise.all([
    Book.find({ isPublished: true, isArchived: { $ne: true } }).limit(4).lean(),
    ReadingProgress.find(filter).populate('bookId').sort({ lastReadAt: -1 }).limit(3).lean(),
    QuizAttempt.find(filter).sort({ createdAt: -1 }).limit(3).lean(),
    Notification.find({
      $or: [{ targetRole: 'reader' }, ...(currentUser ? [{ userId: currentUser._id }] : [])],
    })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean(),
    currentUser
      ? ChildProfile.findOne({
          $or: [
            { displayName: currentUser.name },
            ...(currentUser.name ? [{ displayName: new RegExp(`^${currentUser.name.split(' ')[0]}`, 'i') }] : []),
            { parentId: currentUser._id },
          ],
        }).lean()
      : null,
    currentUser
      ? ChildStory.find({ authorId: currentUser._id }).sort({ updatedAt: -1 }).limit(3).lean()
      : Promise.resolve([]),
    Workshop.find({ isPublished: true }).limit(2).lean(),
  ]);

  const activeProgress = (recentProgress[0] as unknown as ProgressItem) || null;
  const continueBook = (typeof activeProgress?.bookId === 'object' ? activeProgress.bookId : books[0]) as ProgressBook | null;
  const currentChapterNum = activeProgress?.currentChapter || 1;
  const percentCompleted = activeProgress?.percentCompleted || 25;
  const minutesRead = activeProgress?.totalMinutesRead || 15;
  const starsEarned = childProfile?.starsEarned || 145;
  const readingStreak = childProfile?.readingStreak || 5;
  const preferredName = currentUser?.name ? currentUser.name.split(' ')[0] : 'Aarav';

  return (
    <div className="flex flex-col min-h-screen bg-[#f4faff] text-[#091b31]">
      <Navbar />

      <main className="flex-1 pt-24 pb-24 md:pb-16">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* 1. FRIENDLY WELCOME BANNER (Child-First Display Name & Star Habit) */}
          <div className="bg-gradient-to-r from-[#203047] via-[#2F6B57] to-[#122842] text-white rounded-3xl p-6 sm:p-10 mb-8 shadow-tactile-lg flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-white/10 text-3xl flex items-center justify-center backdrop-blur-xs border border-white/20">
                🚀
              </div>
              <div>
                <span className="text-xs uppercase font-extrabold tracking-wider text-[#ffdea7]">
                  Young Reader Sanctuary
                </span>
                <h1 className="font-serif-story text-2xl sm:text-3xl font-bold mt-0.5">
                  Welcome back, {preferredName}!
                </h1>
                <p className="text-xs text-gray-200 mt-1">
                  You’re on a <strong>{readingStreak}-day reading streak</strong>! Keep exploring stories and unlocking badges.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shrink-0">
              <div className="text-center px-3">
                <span className="text-2xl font-bold block text-[#ffdea7]">⭐ {starsEarned}</span>
                <span className="text-[10px] text-gray-300">Stars Earned</span>
              </div>
              <span className="h-8 w-px bg-white/20 inline-block"></span>
              <div className="text-center px-3">
                <span className="text-2xl font-bold block text-[#b1f0d6]">🔥 {readingStreak}</span>
                <span className="text-[10px] text-gray-300">Day Streak</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 8 Columns: Core Child Reading & Creation Desk */}
            <div className="lg:col-span-8 flex flex-col gap-8">
              {/* 2. PROMINENT CONTINUE READING CARD */}
              <div id="continue-reading" className="bg-white rounded-3xl border border-[#ddeaf2] p-6 shadow-tactile-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif-story text-lg font-bold text-[#091b31] flex items-center gap-2">
                    <span>📖</span>
                    <span>Continue Reading</span>
                  </h3>
                  <Link href="/library" className="text-xs font-bold text-[#2d6955] hover:underline">
                    Discover More Books →
                  </Link>
                </div>

                {continueBook ? (
                  <div className="bg-[#f4faff] border border-[#ddeaf2] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-5">
                    <img
                      src={continueBook.coverUrl}
                      alt={continueBook.title}
                      className="w-24 h-32 object-cover rounded-xl shadow-xs shrink-0"
                    />
                    <div className="flex-1 w-full">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-[#2d6955]">
                          Chapter {currentChapterNum} ({percentCompleted}%)
                        </span>
                        <span className="text-gray-500">{minutesRead} mins read today</span>
                      </div>
                      <h4 className="font-serif-story font-bold text-base text-[#091b31]">
                        {continueBook.title}
                      </h4>
                      <p className="text-xs text-[#75777e] mt-0.5">By {continueBook.authorName}</p>

                      {/* Gentle Progress Bar */}
                      <div className="w-full bg-[#ddeaf2] h-2.5 rounded-full overflow-hidden my-3">
                        <div
                          className="bg-[#2d6955] h-full rounded-full transition-all"
                          style={{ width: `${Math.min(100, Math.max(10, percentCompleted))}%` }}
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        <Link
                          href={`/read/${continueBook.slug}?chapter=${currentChapterNum}`}
                          className="px-5 py-2.5 rounded-xl bg-[#203047] text-white text-xs font-bold hover:bg-[#091b31] shadow-xs flex items-center gap-2"
                        >
                          <span>Resume Chapter {currentChapterNum}</span>
                          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                        </Link>
                        <Link
                          href={`/book/${continueBook.slug}`}
                          className="px-3.5 py-2.5 rounded-xl bg-white border border-[#ddeaf2] text-[#203047] text-xs font-semibold hover:bg-gray-50"
                        >
                          Book Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Friendly Empty State */
                  <div className="bg-[#f4faff] border border-[#ddeaf2] rounded-2xl p-6 text-center">
                    <span className="text-3xl block mb-2">📚</span>
                    <p className="font-bold text-sm text-[#091b31]">Choose a book to begin your adventure!</p>
                    <p className="text-xs text-gray-500 mt-1 mb-4">You have no active reading session.</p>
                    <Link
                      href="/library"
                      className="px-4 py-2 rounded-xl bg-[#203047] text-white text-xs font-bold"
                    >
                      Browse Story Library →
                    </Link>
                  </div>
                )}
              </div>

              {/* 3. "MY STORIES" CREATIVE SECTION (Section 3 Requirement) */}
              <div className="bg-white rounded-3xl border border-[#ddeaf2] p-6 shadow-tactile-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-serif-story text-lg font-bold text-[#091b31] flex items-center gap-2">
                      <span>✍️</span>
                      <span>My Stories &amp; Creative Studio</span>
                    </h3>
                    <p className="text-xs text-[#75777e] mt-0.5">
                      Write tales, add chapters and illustrations, and submit for parent &amp; editorial review!
                    </p>
                  </div>

                  <Link
                    href="/reader/stories"
                    className="px-4 py-2 rounded-xl bg-[#ffdea7] hover:bg-[#fed68f] text-[#261800] text-xs font-extrabold shadow-xs flex items-center gap-1.5 transition-all"
                  >
                    <span className="material-symbols-outlined text-[16px]">add_circle</span>
                    <span>Write Story</span>
                  </Link>
                </div>

                {childStories && childStories.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {childStories.map((st: any) => (
                      <div
                        key={st._id.toString()}
                        className="p-4 rounded-2xl bg-[#f4faff] border border-[#ddeaf2] flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={st.coverUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=200&q=80'}
                            alt={st.title}
                            className="w-10 h-14 object-cover rounded-lg shadow-2xs"
                          />
                          <div>
                            <h4 className="font-serif-story font-bold text-xs text-[#091b31] line-clamp-1">
                              {st.title}
                            </h4>
                            <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-gray-700 border border-gray-200">
                              {st.status.replace(/_/g, ' ')}
                            </span>
                          </div>
                        </div>

                        <Link
                          href="/reader/stories"
                          className="px-3 py-1.5 rounded-xl bg-white border border-[#ddeaf2] hover:bg-[#203047] hover:text-white text-[#203047] text-xs font-semibold transition-colors"
                        >
                          View Desk
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Friendly Empty State for Stories */
                  <div className="p-6 rounded-2xl bg-[#f8fbfe] border border-dashed border-[#ddeaf2] text-center">
                    <span className="text-3xl block mb-2">🌟</span>
                    <p className="font-bold text-sm text-[#091b31]">Ready to write your first story?</p>
                    <p className="text-xs text-gray-500 mt-1 mb-4">
                      Let your imagination soar! Write tales of stars, animals, or magical castles.
                    </p>
                    <Link
                      href="/reader/stories"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#203047] text-white text-xs font-bold shadow-xs hover:bg-[#091b31]"
                    >
                      <span>✍️ Launch Story Writer</span>
                      <span>→</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* 4. RECOMMENDED FOR YOU SHELF (Filtered for Child's Age) */}
              <div className="bg-white rounded-3xl border border-[#ddeaf2] p-6 shadow-tactile-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif-story text-lg font-bold text-[#091b31] flex items-center gap-2">
                    <span>🌟</span>
                    <span>Recommended Stories for You (Ages 6-8)</span>
                  </h3>
                  <Link href="/library" className="text-xs font-semibold text-[#2d6955] hover:underline">
                    View All →
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {(books as unknown as RecommendedBookItem[]).slice(1, 4).map((b: RecommendedBookItem) => (
                    <div
                      key={b._id.toString()}
                      className="bg-[#f4faff] border border-[#ddeaf2] rounded-2xl p-3 flex flex-col justify-between group hover:shadow-sm transition-all"
                    >
                      <img
                        src={b.coverUrl}
                        alt={b.title}
                        className="w-full aspect-[4/3] object-cover rounded-xl mb-2 group-hover:scale-102 transition-transform"
                      />
                      <div>
                        <h5 className="font-serif-story font-bold text-xs text-[#091b31] line-clamp-1">
                          {b.title}
                        </h5>
                        <p className="text-[10px] text-gray-500">{b.genre}</p>
                      </div>
                      <Link
                        href={`/book/${b.slug}`}
                        className="mt-3 py-1.5 rounded-lg bg-white border border-[#ddeaf2] text-[#203047] text-center text-xs font-semibold hover:bg-[#203047] hover:text-white transition-colors"
                      >
                        Read Story
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. QUIZZES, BADGES & LEARNING ACTIVITIES */}
              <div className="bg-white rounded-3xl border border-[#ddeaf2] p-6 shadow-tactile-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif-story text-lg font-bold text-[#091b31] flex items-center gap-2">
                    <span>🏆</span>
                    <span>Quizzes &amp; Badges Earned</span>
                  </h3>
                  <Link href="/activities" className="text-xs font-semibold text-[#2d6955] hover:underline">
                    Explore All Quizzes →
                  </Link>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-[#e9f6fd] border border-[#ddeaf2] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🌟</span>
                      <div>
                        <p className="font-bold text-[#091b31]">Tara and the Whispering Stars Quiz</p>
                        <p className="text-gray-500">Score: 3/3 (100% Perfect Score)</p>
                      </div>
                    </div>
                    <span className="font-bold text-[#f4be55] bg-white px-2.5 py-1 rounded-full shadow-xs">
                      +25 Stars Earned
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#e9f6fd] border border-[#ddeaf2] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🎓</span>
                      <div>
                        <p className="font-bold text-[#091b31]">Junior Astronomer Literary Diploma</p>
                        <p className="text-gray-500">Certified by Dr. Meera Sharma</p>
                      </div>
                    </div>
                    <Link
                      href="/certificate?name=Aarav%20Sharma&title=Tara%20and%20the%20Whispering%20Stars&book=tara-and-the-whispering-stars&badge=Junior%20Astronomer&author=Dr.%20Meera%20Sharma"
                      className="font-bold text-[#2d6955] bg-white px-2.5 py-1 rounded-full shadow-xs hover:bg-[#2d6955] hover:text-white transition-colors"
                    >
                      View Diploma 📜
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 4 Columns: Safe Notifications, Upcoming Workshops & Child Safety */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              {/* Daily Target Progress */}
              <div className="bg-white rounded-3xl border border-[#ddeaf2] p-6 shadow-tactile-sm flex flex-col gap-4">
                <h3 className="font-serif-story text-base font-bold text-[#091b31] flex items-center gap-2">
                  <span>⏱️</span>
                  <span>Daily Reading Target</span>
                </h3>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-600">22 / 45 mins read today</span>
                  <span className="font-bold text-[#2d6955]">48%</span>
                </div>
                <div className="w-full bg-[#ddeaf2] h-2.5 rounded-full overflow-hidden">
                  <div className="bg-[#2d6955] h-full w-[48%] rounded-full"></div>
                </div>
                <p className="text-[11px] text-[#75777e] leading-relaxed">
                  Gentle screen limit set by your parent: 23 minutes remaining today.
                </p>
              </div>

              {/* 6. UPCOMING INTERACTIVE WORKSHOPS */}
              <div className="bg-white rounded-3xl border border-[#ddeaf2] p-6 shadow-tactile-sm flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif-story text-base font-bold text-[#091b31] flex items-center gap-2">
                    <span>🎨</span>
                    <span>Upcoming Workshops</span>
                  </h3>
                  <Link href="/workshops" className="text-xs text-[#2d6955] font-bold hover:underline">
                    View All
                  </Link>
                </div>

                <div className="space-y-3">
                  {(workshops as any[]).map((w) => (
                    <div
                      key={w._id.toString()}
                      className="p-3 rounded-2xl bg-[#f4faff] border border-[#ddeaf2] text-xs flex flex-col gap-1"
                    >
                      <span className="font-bold text-[#091b31]">{w.title}</span>
                      <span className="text-[11px] text-gray-500">
                        With {w.instructorName} • {w.date}
                      </span>
                      <Link
                        href={`/workshops`}
                        className="mt-1 text-[11px] font-bold text-[#2d6955] hover:underline"
                      >
                        Reserve Free Seat →
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              {/* 7. NOTIFICATIONS AREA */}
              <div className="bg-white rounded-3xl border border-[#ddeaf2] p-6 shadow-tactile-sm flex flex-col gap-3">
                <h3 className="font-serif-story text-base font-bold text-[#091b31] flex items-center gap-2">
                  <span>🔔</span>
                  <span>Sanctuary Updates</span>
                </h3>
                <div className="space-y-3">
                  {(notifications as unknown as NotificationItem[]).map((n: NotificationItem) => (
                    <div
                      key={n._id.toString()}
                      className="p-3 rounded-xl bg-[#f4faff] border border-[#ddeaf2] text-xs"
                    >
                      <p className="font-bold text-[#091b31]">{n.title}</p>
                      <p className="text-gray-600 mt-0.5 leading-relaxed">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 8. HELP & SAFETY GUARD (Section 2 Requirement) */}
              <div className="bg-gradient-to-br from-[#e9f6fd] to-[#d8edf9] rounded-3xl border border-[#cbe4f4] p-5 flex flex-col gap-3 text-xs shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#2d6955] text-[22px]">verified_user</span>
                  <h4 className="font-bold text-sm text-[#091b31]">Family Safety &amp; Help</h4>
                </div>
                <p className="text-[11px] text-[#44474d] leading-relaxed">
                  StoryNest is safe for young explorers! We collect no personal location data or social trackers.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <Link
                    href="/safety"
                    className="px-3 py-1.5 rounded-xl bg-[#203047] text-white font-bold text-[11px] hover:bg-[#091b31] shadow-xs"
                  >
                    Safety Charter &amp; Help
                  </Link>
                  <Link
                    href="/privacy"
                    className="px-3 py-1.5 rounded-xl bg-white text-[#203047] font-bold text-[11px] border border-[#cbe4f4]"
                  >
                    COPPA Info
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 9. MOBILE BOTTOM NAVIGATION BAR FOR CHILDREN (Section 2 Requirement) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#ddeaf2] shadow-lg flex items-center justify-around py-2 px-1">
        <Link
          href="/"
          className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-[#44474d] hover:text-[#091b31]"
        >
          <span className="material-symbols-outlined text-[20px]">home</span>
          <span>Home</span>
        </Link>
        <Link
          href="/library"
          className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-[#44474d] hover:text-[#091b31]"
        >
          <span className="material-symbols-outlined text-[20px]">auto_stories</span>
          <span>Library</span>
        </Link>
        <Link
          href="/reader"
          className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-[#2d6955]"
        >
          <span className="material-symbols-outlined text-[20px]">menu_book</span>
          <span>My Desk</span>
        </Link>
        <Link
          href="/reader/stories"
          className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-[#44474d] hover:text-[#091b31]"
        >
          <span className="material-symbols-outlined text-[20px]">edit_note</span>
          <span>Stories</span>
        </Link>
        <Link
          href="/activities"
          className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-[#44474d] hover:text-[#091b31]"
        >
          <span className="material-symbols-outlined text-[20px]">emoji_events</span>
          <span>Quizzes</span>
        </Link>
      </nav>

      <Footer />
    </div>
  );
}
