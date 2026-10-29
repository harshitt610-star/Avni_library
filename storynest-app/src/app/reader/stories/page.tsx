'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';

interface StoryChapter {
  chapterNumber: number;
  title: string;
  content: string;
  illustrationUrl?: string;
}

interface StoryItem {
  _id: string;
  title: string;
  synopsis?: string;
  genre: string;
  targetAge: string;
  status:
    | 'DRAFT'
    | 'AWAITING_GUARDIAN_APPROVAL'
    | 'SUBMITTED'
    | 'UNDER_REVIEW'
    | 'CHANGES_REQUESTED'
    | 'APPROVED'
    | 'PUBLISHED'
    | 'REJECTED';
  chapters: StoryChapter[];
  coverUrl?: string;
  guardianConsentStatus?: string;
  reviewerFeedback?: string;
  submittedAt?: string;
  publishedAt?: string;
  updatedAt?: string;
}

export default function ReaderStoriesPage() {
  const { user } = useAuth();
  const [stories, setStories] = useState<StoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Studio Flow State: 'list' | 'editor' | 'preview' | 'confirmation'
  const [currentView, setCurrentView] = useState<'list' | 'editor' | 'preview' | 'confirmation'>('list');
  const [selectedStory, setSelectedStory] = useState<StoryItem | null>(null);

  // Editor Form State
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('Adventure & Fantasy');
  const [synopsis, setSynopsis] = useState('');
  const [chapters, setChapters] = useState<StoryChapter[]>([
    {
      chapterNumber: 1,
      title: 'Chapter 1: The Secret Meadow',
      content: 'Once upon a starlit night, I discovered a hidden trail behind the whispering banyan tree...',
      illustrationUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    },
  ]);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [coverUrl, setCoverUrl] = useState(
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80'
  );
  const [saving, setSaving] = useState(false);
  const [feedbackAlert, setFeedbackAlert] = useState('');

  const fetchStories = async () => {
    try {
      const res = await fetch('/api/reader/stories');
      const data = await res.json();
      if (data.stories) {
        setStories(data.stories);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const handleStartNewStory = () => {
    setSelectedStory(null);
    setTitle('');
    setGenre('Adventure & Fantasy');
    setSynopsis('');
    setChapters([
      {
        chapterNumber: 1,
        title: 'Chapter 1: The Magic Discovery',
        content: '',
        illustrationUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
      },
    ]);
    setActiveChapterIndex(0);
    setCoverUrl('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80');
    setCurrentView('editor');
  };

  const handleEditStory = (story: StoryItem) => {
    setSelectedStory(story);
    setTitle(story.title);
    setGenre(story.genre || 'Adventure & Fantasy');
    setSynopsis(story.synopsis || '');
    setChapters(
      story.chapters && story.chapters.length > 0
        ? story.chapters
        : [
            {
              chapterNumber: 1,
              title: 'Chapter 1',
              content: '',
              illustrationUrl: story.coverUrl,
            },
          ]
    );
    setActiveChapterIndex(0);
    setCoverUrl(story.coverUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80');
    setCurrentView('editor');
  };

  const handleSaveDraft = async () => {
    if (!title.trim()) {
      alert('Please enter a story title first!');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/reader/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyId: selectedStory?._id,
          title,
          synopsis,
          genre,
          chapters,
          coverUrl,
          action: 'save_draft',
        }),
      });
      const data = await res.json();
      if (data.success && data.story) {
        setSelectedStory(data.story);
        setFeedbackAlert('✨ Your story draft has been safely saved!');
        setTimeout(() => setFeedbackAlert(''), 3000);
        fetchStories();
      } else {
        alert(data.error || 'Failed to save draft');
      }
    } catch {
      alert('Error saving your story');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (!title.trim()) {
      alert('Please enter a story title before submitting!');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/reader/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyId: selectedStory?._id,
          title,
          synopsis,
          genre,
          chapters,
          coverUrl,
          action: 'submit_review',
        }),
      });
      const data = await res.json();
      if (data.success && data.story) {
        setSelectedStory(data.story);
        setCurrentView('confirmation');
        fetchStories();
      } else {
        alert(data.error || 'Failed to submit story');
      }
    } catch {
      alert('Error submitting your story');
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status: StoryItem['status']) => {
    switch (status) {
      case 'DRAFT':
        return (
          <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-bold flex items-center gap-1">
            <span>📝</span>
            <span>Draft</span>
          </span>
        );
      case 'AWAITING_GUARDIAN_APPROVAL':
        return (
          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold flex items-center gap-1">
            <span>👨‍👩‍👧</span>
            <span>Awaiting Parent Approval</span>
          </span>
        );
      case 'SUBMITTED':
      case 'UNDER_REVIEW':
        return (
          <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-900 text-xs font-bold flex items-center gap-1">
            <span>🔍</span>
            <span>Under Review</span>
          </span>
        );
      case 'CHANGES_REQUESTED':
        return (
          <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-900 text-xs font-bold flex items-center gap-1">
            <span>💡</span>
            <span>Edits Suggested</span>
          </span>
        );
      case 'APPROVED':
        return (
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold flex items-center gap-1">
            <span>✅</span>
            <span>Approved</span>
          </span>
        );
      case 'PUBLISHED':
        return (
          <span className="px-3 py-1 rounded-full bg-[#b1f0d6] text-[#002117] text-xs font-bold flex items-center gap-1">
            <span>🌟</span>
            <span>Published Live</span>
          </span>
        );
      case 'REJECTED':
      default:
        return (
          <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-900 text-xs font-bold flex items-center gap-1">
            <span>💬</span>
            <span>Reviewer Notes</span>
          </span>
        );
    }
  };

  const illustrationPresets = [
    { label: 'Starlit Sky', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80' },
    { label: 'Magic Woods', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80' },
    { label: 'Ocean Voyage', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80' },
    { label: 'Cloud Castle', url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#f4faff] text-[#091b31]">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {/* Top Back Breadcrumb */}
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/reader"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2d6955] hover:underline"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              <span>Back to My Reading Sanctuary</span>
            </Link>

            {currentView !== 'list' && (
              <button
                onClick={() => setCurrentView('list')}
                className="text-xs font-bold text-[#44474d] hover:text-[#091b31]"
              >
                Close Editor
              </button>
            )}
          </div>

          {/* Feedback Toast */}
          {feedbackAlert && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 shadow-tactile-sm">
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
              <span>{feedbackAlert}</span>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 1: MY STORIES LIST & PROGRESS TRACKER               */}
          {/* ========================================================= */}
          {currentView === 'list' && (
            <div>
              {/* Header Creative Banner */}
              <div className="bg-gradient-to-r from-[#203047] via-[#2F6B57] to-[#122842] text-white rounded-3xl p-6 sm:p-8 mb-8 shadow-tactile-md flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 text-3xl flex items-center justify-center border border-white/20">
                    ✍️
                  </div>
                  <div>
                    <span className="text-xs uppercase font-extrabold tracking-wider text-[#ffdea7]">
                      Young Authors Studio
                    </span>
                    <h1 className="font-serif-story text-2xl sm:text-3xl font-bold mt-0.5">
                      My Stories &amp; Creative Desk
                    </h1>
                    <p className="text-xs text-gray-200 mt-1">
                      Write your own magical tales, preview them like a real book, and share them safely with editors and your family!
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleStartNewStory}
                  className="px-5 py-3 rounded-xl bg-[#ffdea7] text-[#261800] hover:bg-white text-xs font-extrabold shadow-md transition-all flex items-center gap-2 shrink-0 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">add_circle</span>
                  <span>Write a New Story</span>
                </button>
              </div>

              {/* Stories Cards Grid */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#ddeaf2]">
                  <h3 className="font-serif-story text-lg font-bold text-[#091b31]">
                    My Story Manuscripts ({stories.length})
                  </h3>
                  <span className="text-xs text-gray-500">Auto-saved to your profile</span>
                </div>

                {loading ? (
                  <div className="p-12 text-center text-xs text-gray-500">
                    Loading your creative tales...
                  </div>
                ) : stories.length === 0 ? (
                  /* Helpful Empty State */
                  <div className="bg-white rounded-3xl border border-[#ddeaf2] p-10 text-center flex flex-col items-center justify-center shadow-tactile-sm">
                    <div className="w-16 h-16 rounded-2xl bg-amber-50 text-3xl flex items-center justify-center mb-3">
                      📖
                    </div>
                    <h4 className="font-serif-story text-base font-bold text-[#091b31]">
                      You haven’t saved a story yet!
                    </h4>
                    <p className="text-xs text-[#75777e] max-w-sm mt-1 mb-5">
                      Ready to write your first story? Let your imagination soar with your favorite animal, starry voyage, or secret kingdom.
                    </p>
                    <button
                      onClick={handleStartNewStory}
                      className="px-6 py-2.5 rounded-xl bg-[#203047] text-white text-xs font-bold hover:bg-[#091b31] shadow-xs cursor-pointer"
                    >
                      ✨ Create My First Story
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {stories.map((st) => (
                      <div
                        key={st._id}
                        className="bg-white rounded-3xl border border-[#ddeaf2] p-5 shadow-tactile-sm flex flex-col justify-between hover:shadow-md transition-shadow"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={st.coverUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=200&q=80'}
                                alt={st.title}
                                className="w-12 h-16 object-cover rounded-xl shadow-2xs"
                              />
                              <div>
                                <h4 className="font-serif-story text-base font-bold text-[#091b31] line-clamp-1">
                                  {st.title}
                                </h4>
                                <p className="text-[11px] text-gray-500">
                                  {st.genre} • {st.chapters?.length || 1} Chapter{(st.chapters?.length || 1) > 1 ? 's' : ''}
                                </p>
                              </div>
                            </div>
                            {getStatusBadge(st.status)}
                          </div>

                          {st.synopsis && (
                            <p className="text-xs text-[#44474d] line-clamp-2 mb-3">
                              {st.synopsis}
                            </p>
                          )}

                          {/* Reviewer or Parent Feedback */}
                          {st.reviewerFeedback && (
                            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 mb-3">
                              <span className="font-bold block mb-0.5">💬 Note from Reviewers:</span>
                              <span>{st.reviewerFeedback}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-[#ddeaf2] mt-2">
                          <span className="text-[10px] text-gray-400">
                            {st.status === 'PUBLISHED'
                              ? 'Published'
                              : st.status === 'DRAFT'
                              ? 'Draft in progress'
                              : 'Under Review'}
                          </span>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditStory(st)}
                              className="px-3 py-1.5 rounded-xl bg-[#e9f6fd] hover:bg-[#ddeaf2] text-[#203047] text-xs font-bold cursor-pointer"
                            >
                              Edit Story ✏️
                            </button>
                            <button
                              onClick={() => {
                                handleEditStory(st);
                                setCurrentView('preview');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-[#203047] hover:bg-[#091b31] text-white text-xs font-bold cursor-pointer"
                            >
                              Preview 📖
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 2: STEP 1 - CREATE & EDIT A STORY                    */}
          {/* ========================================================= */}
          {currentView === 'editor' && (
            <div className="bg-white rounded-3xl border border-[#ddeaf2] p-6 sm:p-8 shadow-tactile-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#ddeaf2] gap-4">
                <div>
                  <span className="text-xs font-extrabold uppercase text-[#2d6955] tracking-wider">
                    Step 1 of 3: Story Creation
                  </span>
                  <h2 className="font-serif-story text-2xl font-bold text-[#091b31] mt-0.5">
                    {selectedStory ? `Editing: ${title || 'Untitled'}` : 'Write Your Story'}
                  </h2>
                  <p className="text-xs text-[#75777e] mt-1">
                    Fill in your tale&apos;s title and write down your ideas. You can preview anytime!
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveDraft}
                    disabled={saving}
                    className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#091b31] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[18px]">save</span>
                    <span>{saving ? 'Saving...' : 'Save Draft'}</span>
                  </button>

                  <button
                    onClick={() => setCurrentView('preview')}
                    className="px-5 py-2.5 rounded-xl bg-[#203047] hover:bg-[#091b31] text-white text-xs font-bold shadow-tactile-sm transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Preview Story</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                </div>
              </div>

              {/* Editor Fields */}
              <div className="space-y-6 mt-6">
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#44474d] mb-1.5">
                    Story Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., The Secret of the Whispering Banyan"
                    className="w-full px-4 py-3 rounded-2xl border border-[#ddeaf2] bg-[#f8fbfe] text-base font-serif-story font-bold text-[#091b31] focus:outline-none focus:ring-2 focus:ring-[#203047]"
                  />
                </div>

                {/* Genre & Target Age */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#44474d] mb-1.5">
                      Story Theme / Genre
                    </label>
                    <select
                      value={genre}
                      onChange={(e) => setGenre(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#ddeaf2] bg-[#f8fbfe] text-xs font-bold text-[#091b31] focus:outline-none focus:ring-2 focus:ring-[#203047]"
                    >
                      <option>Adventure &amp; Fantasy</option>
                      <option>Animal Tales &amp; Nature</option>
                      <option>Space &amp; Science Explorers</option>
                      <option>Folktales &amp; Legends</option>
                      <option>Family, Friendship &amp; School</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#44474d] mb-1.5">
                      Short Synopsis / Hook
                    </label>
                    <input
                      type="text"
                      value={synopsis}
                      onChange={(e) => setSynopsis(e.target.value)}
                      placeholder="One sentence about what happens in your story"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#ddeaf2] bg-[#f8fbfe] text-xs font-medium text-[#091b31] focus:outline-none focus:ring-2 focus:ring-[#203047]"
                    />
                  </div>
                </div>

                {/* Cover Art Picker */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#44474d] mb-2">
                    Pick a Story Illustration Cover
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {illustrationPresets.map((img) => (
                      <button
                        key={img.url}
                        type="button"
                        onClick={() => setCoverUrl(img.url)}
                        className={`relative rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${
                          coverUrl === img.url ? 'border-[#203047] ring-2 ring-[#ffdea7]' : 'border-transparent'
                        }`}
                      >
                        <img src={img.url} alt={img.label} className="w-full h-24 object-cover" />
                        <span className="absolute bottom-1 left-2 text-[10px] font-bold text-white bg-black/60 px-1.5 py-0.5 rounded">
                          {img.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chapters Navigation Tabs */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#44474d]">
                      Story Chapters
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const newChapNum = chapters.length + 1;
                        setChapters([
                          ...chapters,
                          {
                            chapterNumber: newChapNum,
                            title: `Chapter ${newChapNum}`,
                            content: '',
                            illustrationUrl: coverUrl,
                          },
                        ]);
                        setActiveChapterIndex(chapters.length);
                      }}
                      className="text-xs text-[#2d6955] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">add</span>
                      <span>Add Next Chapter</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {chapters.map((ch, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveChapterIndex(idx)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          activeChapterIndex === idx
                            ? 'bg-[#203047] text-white shadow-xs'
                            : 'bg-[#e9f6fd] text-[#44474d] hover:bg-[#ddeaf2]'
                        }`}
                      >
                        {ch.title || `Chapter ${idx + 1}`}
                      </button>
                    ))}
                  </div>

                  {/* Active Chapter Title Input */}
                  <div className="mb-3">
                    <input
                      type="text"
                      value={chapters[activeChapterIndex]?.title || ''}
                      onChange={(e) => {
                        const updated = [...chapters];
                        updated[activeChapterIndex].title = e.target.value;
                        setChapters(updated);
                      }}
                      placeholder="Chapter Title..."
                      className="w-full px-4 py-2 rounded-xl border border-[#ddeaf2] bg-[#f8fbfe] font-serif-story font-bold text-sm text-[#091b31] focus:outline-none focus:ring-1 focus:ring-[#203047]"
                    />
                  </div>

                  {/* Story Textarea */}
                  <textarea
                    rows={10}
                    value={chapters[activeChapterIndex]?.content || ''}
                    onChange={(e) => {
                      const updated = [...chapters];
                      updated[activeChapterIndex].content = e.target.value;
                      setChapters(updated);
                    }}
                    placeholder="Write your story here... Let your words flow freely!"
                    className="w-full px-5 py-4 rounded-2xl border border-[#ddeaf2] bg-[#fdfefe] text-sm leading-relaxed font-serif-story text-[#091b31] focus:outline-none focus:ring-2 focus:ring-[#203047]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 3: STEP 2 - PREVIEW YOUR STORY                       */}
          {/* ========================================================= */}
          {currentView === 'preview' && (
            <div className="bg-white rounded-3xl border border-[#ddeaf2] p-6 sm:p-10 shadow-tactile-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#ddeaf2] gap-4 mb-6">
                <div>
                  <span className="text-xs font-extrabold uppercase text-[#2d6955] tracking-wider">
                    Step 2 of 3: Reader Preview
                  </span>
                  <h2 className="font-serif-story text-2xl font-bold text-[#091b31]">
                    How Your Story Looks to Readers
                  </h2>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCurrentView('editor')}
                    className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#091b31] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>✏️ Edit More</span>
                  </button>

                  <button
                    onClick={handleSubmitForReview}
                    disabled={saving}
                    className="px-6 py-2.5 rounded-xl bg-[#2d6955] hover:bg-[#204e3f] text-white text-xs font-bold shadow-tactile-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <span>Proceed to Submit</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                </div>
              </div>

              {/* Book Reader Preview Canvas */}
              <div className="max-w-2xl mx-auto bg-[#FAF7F0] rounded-3xl p-8 border border-[#E6E7E5] shadow-inner text-[#263238]">
                <div className="text-center mb-6">
                  <img
                    src={coverUrl}
                    alt={title}
                    className="w-32 h-44 object-cover mx-auto rounded-2xl shadow-md mb-4"
                  />
                  <span className="text-xs uppercase font-extrabold tracking-widest text-[#2d6955]">
                    {genre}
                  </span>
                  <h1 className="font-serif-story text-3xl font-bold mt-1 text-[#091b31]">
                    {title || 'Untitled Story'}
                  </h1>
                  <p className="text-xs text-gray-500 mt-1">
                    Written by young author {user?.name || 'StoryNest Creator'}
                  </p>
                </div>

                {chapters.map((ch, idx) => (
                  <div key={idx} className="mt-8 pt-6 border-t border-black/10">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#2d6955]">
                      Chapter {ch.chapterNumber}
                    </span>
                    <h3 className="font-serif-story text-xl font-bold mt-1 mb-4 text-[#091b31]">
                      {ch.title}
                    </h3>
                    <p className="font-serif-story text-sm leading-relaxed whitespace-pre-wrap">
                      {ch.content || '(This chapter is currently empty. Click "Edit More" to add words!)'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 4: STEP 3 - SUBMIT FOR REVIEW CONFIRMATION           */}
          {/* ========================================================= */}
          {currentView === 'confirmation' && (
            <div className="bg-white rounded-3xl border border-[#ddeaf2] p-8 sm:p-12 shadow-tactile-sm text-center max-w-xl mx-auto">
              <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-800 text-4xl flex items-center justify-center mx-auto mb-4">
                🎉
              </div>
              <span className="text-xs uppercase font-extrabold tracking-widest text-[#2d6955]">
                Step 3: Submission Confirmed
              </span>
              <h2 className="font-serif-story text-2xl sm:text-3xl font-bold text-[#091b31] mt-1 mb-3">
                Hooray! &ldquo;{title}&rdquo; is Submitted!
              </h2>

              <p className="text-xs text-[#44474d] leading-relaxed mb-6">
                Your story has been safely entered into our friendly editorial workflow!
                Our gentle StoryNest editors and your parent/guardian will review your creative work before it is published in the community.
              </p>

              <div className="p-4 rounded-2xl bg-[#f4faff] border border-[#ddeaf2] text-left text-xs space-y-2 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span className="font-bold text-amber-800">
                    {selectedStory?.guardianConsentStatus === 'PENDING'
                      ? 'Awaiting Required Parent Approval'
                      : 'Submitted for Review'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Privacy Guard:</span>
                  <span className="font-bold text-[#2d6955]">COPPA Safe &amp; Moderated ✓</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => setCurrentView('list')}
                  className="px-6 py-2.5 rounded-xl bg-[#203047] text-white text-xs font-bold hover:bg-[#091b31] shadow-xs cursor-pointer"
                >
                  View My Stories Progress
                </button>
                <Link
                  href="/reader"
                  className="px-6 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#091b31] text-xs font-bold"
                >
                  Return to Reading Sanctuary
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

