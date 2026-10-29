'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';

interface LibraryBook {
  _id: string;
  title: string;
  titleHindi?: string;
  slug: string;
  authorName: string;
  synopsis: string;
  coverUrl: string;
  genre: string;
  ageBracket: string;
  language: string;
  readingTimeMinutes: number;
}

export default function LibraryPage() {
  const { requireAuth } = useAuth();
  const [books, setBooks] = useState<LibraryBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedAge, setSelectedAge] = useState('All');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedLang, setSelectedLang] = useState('All');
  const [sortOption, setSortOption] = useState('popular');

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('q', search);
      if (selectedAge !== 'All') params.append('age', selectedAge);
      if (selectedGenre !== 'All') params.append('genre', selectedGenre);
      if (selectedLang !== 'All') params.append('lang', selectedLang);
      if (sortOption) params.append('sort', sortOption);

      const res = await fetch(`/api/books?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setBooks(data.books);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [selectedAge, selectedGenre, selectedLang, sortOption]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBooks();
  };

  const agePills = ['All', '3-5', '6-8', '9-12'];
  const genres = ['All', 'Astronomy', 'Folklore', 'Animals', 'Adventure'];
  const languages = ['All', 'Bilingual', 'English', 'Hindi'];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 pt-24 pb-16 bg-[#f4faff]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Banner */}
          <div className="bg-[#e9f6fd] border border-[#ddeaf2] rounded-3xl p-6 sm:p-10 mb-8 shadow-tactile-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2d6955]">
              StoryNest Digital Catalogue
            </span>
            <h1 className="font-serif-story text-3xl sm:text-4xl font-bold text-[#091b31] mt-1">
              Explore Stories That Nurture Young Imaginations
            </h1>
            <p className="text-sm text-[#44474d] max-w-2xl mt-2 leading-relaxed">
              Every book in our digital haven is carefully curated, ad-free, bilingual, and accompanied by
              rich audio previews and comprehension quizzes.
            </p>

            {/* Search Input Bar */}
            <form onSubmit={handleSearchSubmit} className="mt-6 flex flex-col sm:flex-row gap-3 max-w-3xl">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search by title, author, or keyword (e.g. Tara, telescope, squirrel)..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-[#ddeaf2] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#203047]"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-[#203047] text-white text-sm font-semibold hover:bg-[#091b31] shadow-tactile-sm transition-all"
              >
                Search Catalogue
              </button>
            </form>
          </div>

          {/* Filter Bar */}
          <div className="bg-white border border-[#ddeaf2] rounded-2xl p-4 sm:p-5 mb-8 shadow-tactile-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Age Filter */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-[#44474d] mr-1">Age Bracket:</span>
              {agePills.map((age) => (
                <button
                  key={age}
                  onClick={() => setSelectedAge(age)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    selectedAge === age
                      ? 'bg-[#203047] text-white shadow-xs'
                      : 'bg-[#e9f6fd] text-[#44474d] hover:bg-[#ddeaf2]'
                  }`}
                >
                  {age === 'All' ? 'All Ages' : `${age} yrs`}
                </button>
              ))}
            </div>

            {/* Genre & Language Selectors */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-[#44474d]">
                <span className="font-semibold">Genre:</span>
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="bg-[#e9f6fd] border border-[#ddeaf2] rounded-lg px-2.5 py-1 text-xs text-[#091b31] font-semibold focus:outline-none"
                >
                  {genres.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-[#44474d]">
                <span className="font-semibold">Language:</span>
                <select
                  value={selectedLang}
                  onChange={(e) => setSelectedLang(e.target.value)}
                  className="bg-[#e9f6fd] border border-[#ddeaf2] rounded-lg px-2.5 py-1 text-xs text-[#091b31] font-semibold focus:outline-none"
                >
                  {languages.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-[#44474d]">
                <span className="font-semibold">Sort:</span>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="bg-[#e9f6fd] border border-[#ddeaf2] rounded-lg px-2.5 py-1 text-xs text-[#091b31] font-semibold focus:outline-none"
                >
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Newest Releases</option>
                  <option value="quick">Quick Reads (&lt;10m)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Books Grid */}
          {loading ? (
            <div className="py-20 text-center">
              <div className="inline-block w-8 h-8 border-4 border-[#203047] border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-sm text-[#44474d]">Opening StoryNest library shelves...</p>
            </div>
          ) : books.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#ddeaf2] p-12 text-center shadow-tactile-sm max-w-lg mx-auto">
              <span className="material-symbols-outlined text-4xl text-[#75777e] mb-2">auto_stories</span>
              <h3 className="font-serif-story text-xl font-bold text-[#091b31]">No Stories Found</h3>
              <p className="text-xs text-[#44474d] mt-1 mb-4">
                We couldn’t find any books matching your current filters. Try resetting the filters or searching a different keyword.
              </p>
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedAge('All');
                  setSelectedGenre('All');
                  setSelectedLang('All');
                }}
                className="px-4 py-2 rounded-xl bg-[#203047] text-white text-xs font-semibold"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {books.map((book) => (
                <div
                  key={book._id}
                  className="bg-white rounded-2xl border border-[#ddeaf2] overflow-hidden shadow-tactile-sm hover:shadow-tactile-md transition-all flex flex-col group"
                >
                  <div className="relative aspect-[3/4] bg-[#203047] overflow-hidden">
                    <img
                      src={book.coverUrl}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 flex flex-col gap-1">
                      <span className="px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-xs text-[10px] font-bold text-[#091b31] shadow-xs">
                        Ages {book.ageBracket}
                      </span>
                      {book.language === 'bilingual' && (
                        <span className="px-2 py-0.5 rounded-full bg-[#ffdea7] text-[10px] font-bold text-[#261800] shadow-xs">
                          हिंदी + EN
                        </span>
                      )}
                    </div>
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
                      <p className="text-xs text-[#44474d] mt-2 line-clamp-2 leading-relaxed">
                        {book.synopsis}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#ddeaf2] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-[#44474d]">
                        <span className="material-symbols-outlined text-[16px] text-[#2d6955]">schedule</span>
                        <span>{book.readingTimeMinutes} min</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/book/${book.slug}`}
                          className="px-3 py-1.5 rounded-lg bg-[#e9f6fd] text-[#203047] font-semibold hover:bg-[#ddeaf2] transition-colors"
                        >
                          Details
                        </Link>
                        <button
                          type="button"
                          onClick={() =>
                            requireAuth(
                              `/read/${book.slug}`,
                              `Sign in or choose your pen-name to start reading "${book.title}" and collect Spark Stars!`
                            )
                          }
                          className="px-3.5 py-1.5 rounded-lg bg-[#203047] text-white font-semibold hover:bg-[#091b31] shadow-tactile-sm transition-all cursor-pointer"
                        >
                          Read
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
