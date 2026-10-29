'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface AuthorManuscriptItem {
  _id: string;
  title: string;
  titleHindi?: string;
  synopsis: string;
  targetAge: string;
  genre: string;
  status: string;
  wordCount?: string | number;
  reviewerFeedback?: string;
  reviewerNotes?: string;
  manuscriptFileUrl?: string;
  coverUrl?: string;
  coverFileUrl?: string;
  createdAt: string;
}

export default function AuthorDashboardPage() {
  const [manuscripts, setManuscripts] = useState<AuthorManuscriptItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [selectedManuscriptForFeedback, setSelectedManuscriptForFeedback] = useState<AuthorManuscriptItem | null>(null);

  // 7-Step Wizard Form State
  const [wizardForm, setWizardForm] = useState({
    title: '',
    titleHindi: '',
    synopsis: '',
    targetAge: '6-8',
    genre: 'Astronomy & Adventure',
    wordCount: '1500',
    manuscriptFileName: 'my_story_manuscript.docx',
    manuscriptFileUrl: '',
    coverFileUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    needsTranslation: true,
    needsIllustration: true,
  });
  const [submittingWizard, setSubmittingWizard] = useState(false);
  const [wizardSubmitted, setWizardSubmitted] = useState(false);

  const fetchManuscripts = async () => {
    try {
      const res = await fetch('/api/author/manuscripts');
      const data = await res.json();
      if (data.manuscripts) setManuscripts(data.manuscripts);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManuscripts();
  }, []);

  const handleFinishWizard = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingWizard(true);
    try {
      const res = await fetch('/api/author/manuscripts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wizardForm),
      });
      const data = await res.json();
      if (data.success) {
        setWizardSubmitted(true);
        fetchManuscripts();
      } else {
        alert(data.error || 'Failed to submit manuscript');
      }
    } catch {
      alert('Error submitting manuscript');
    } finally {
      setSubmittingWizard(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return <span className="px-3 py-1 rounded-full bg-[#b1f0d6] text-[#002117] text-xs font-bold">Published Live</span>;
      case 'UNDER_REVIEW':
        return <span className="px-3 py-1 rounded-full bg-[#ffdea7] text-[#261800] text-xs font-bold">Under Review</span>;
      case 'CHANGES_REQUESTED':
        return <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-bold">Revisions Needed</span>;
      case 'APPROVED':
        return <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">Approved for Layout</span>;
      case 'SUBMITTED':
      default:
        return <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-bold">Submitted</span>;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 pt-24 pb-16 bg-[#f4faff]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Author Header Banner */}
          <div className="bg-[#203047] text-white rounded-3xl p-6 sm:p-10 mb-8 shadow-tactile-lg flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&q=80"
                alt="Dr. Meera Sharma"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-[#ffdea7] shadow-md"
              />
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-[#ffdea7]">
                  Author Publishing Studio
                </span>
                <h1 className="font-serif-story text-2xl sm:text-3xl font-bold mt-0.5">
                  Dr. Meera Sharma
                </h1>
                <p className="text-xs text-gray-300 max-w-md mt-1">
                  Astrophysicist &amp; Children’s Author • Author of the Tara Cosmos series.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                <div className="text-center px-3">
                  <span className="text-xl sm:text-2xl font-bold block text-[#ffdea7]">2,380</span>
                  <span className="text-[10px] text-gray-300">Total Readers</span>
                </div>
                <span className="h-8 w-px bg-white/20 inline-block"></span>
                <div className="text-center px-3">
                  <span className="text-xl sm:text-2xl font-bold block text-[#b1f0d6]">₹48,500</span>
                  <span className="text-[10px] text-gray-300">Royalties</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowWizard(true);
                  setWizardStep(1);
                  setWizardSubmitted(false);
                }}
                className="px-6 py-3.5 rounded-xl bg-[#2d6955] text-white text-xs font-bold hover:opacity-95 shadow-tactile-sm transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                <span>Submit New Manuscript</span>
              </button>
            </div>
          </div>

          {/* Quick Hub Navigation Bar */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <span className="px-4 py-2 rounded-2xl bg-[#203047] text-white text-xs font-bold shadow-tactile-sm">
              Manuscript Pipeline ({manuscripts.length})
            </span>
            <Link
              href="/author/promotion"
              className="px-4 py-2 rounded-2xl bg-white text-[#203047] border border-[#ddeaf2] text-xs font-bold hover:bg-[#e9f6fd] transition-colors"
            >
              My Books Promotion Hub 📢
            </Link>
            <Link
              href="/publish"
              className="px-4 py-2 rounded-2xl bg-white text-[#203047] border border-[#ddeaf2] text-xs font-bold hover:bg-[#e9f6fd] transition-colors"
            >
              Publishing Service Packages 📦
            </Link>
          </div>

          {/* Manuscripts Pipeline Table */}
          <div className="bg-white rounded-3xl border border-[#ddeaf2] p-6 sm:p-8 shadow-tactile-sm mb-12">
            <div className="flex items-center justify-between pb-6 border-b border-[#ddeaf2]">
              <div>
                <h3 className="font-serif-story text-xl font-bold text-[#091b31]">
                  Manuscript Publishing Lifecycle
                </h3>
                <p className="text-xs text-[#75777e] mt-0.5">
                  Track your submissions from initial draft through editorial critique, illustration, and live release.
                </p>
              </div>
              <span className="text-xs font-semibold text-[#2d6955]">
                ● Real-time Editorial Sync
              </span>
            </div>

            {loading ? (
              <div className="py-16 text-center text-sm text-[#44474d]">
                Loading your author submissions...
              </div>
            ) : manuscripts.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                No manuscripts submitted yet. Click "Submit New Manuscript" to begin!
              </div>
            ) : (
              <div className="divide-y divide-[#ddeaf2] mt-4">
                {manuscripts.map((m) => (
                  <div
                    key={m._id}
                    className="py-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-16 rounded-xl bg-[#203047] overflow-hidden shrink-0 shadow-xs">
                        <img
                          src={m.coverFileUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=200&q=80'}
                          alt={m.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-serif-story font-bold text-base text-[#091b31]">
                            {m.title}
                          </h4>
                          {m.titleHindi && (
                            <span className="text-xs text-[#2d6955] font-semibold">
                              ({m.titleHindi})
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#75777e] line-clamp-1 max-w-md">{m.synopsis}</p>
                        <div className="flex items-center gap-4 text-[11px] text-[#44474d] mt-2">
                          <span>Genre: {m.genre}</span>
                          <span>•</span>
                          <span>Ages: {m.targetAge}</span>
                          <span>•</span>
                          <span>Words: {m.wordCount}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {getStatusBadge(m.status)}
                      {m.reviewerNotes && (
                        <button
                          onClick={() => setSelectedManuscriptForFeedback(m)}
                          className="px-3 py-1.5 rounded-xl bg-[#e9f6fd] text-[#203047] text-xs font-semibold hover:bg-[#ddeaf2]"
                        >
                          Reviewer Feedback 💬
                        </button>
                      )}
                      {m.status === 'PUBLISHED' && (
                        <Link
                          href={`/book/tara-and-the-whispering-stars`}
                          className="px-3.5 py-1.5 rounded-xl bg-[#203047] text-white text-xs font-semibold hover:bg-[#091b31]"
                        >
                          View In Library →
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Reviewer Feedback Drawer Modal */}
      {selectedManuscriptForFeedback && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-tactile-xl border border-[#ddeaf2]">
            <div className="flex items-center justify-between pb-4 border-b border-[#ddeaf2]">
              <h3 className="font-serif-story text-lg font-bold text-[#091b31]">
                Editorial Feedback Notes
              </h3>
              <button
                onClick={() => setSelectedManuscriptForFeedback(null)}
                className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center"
              >
                ✕
              </button>
            </div>
            <div className="py-4 flex flex-col gap-3 text-xs text-[#44474d]">
              <p>
                <strong>Manuscript:</strong> {selectedManuscriptForFeedback.title}
              </p>
              <div className="p-4 rounded-2xl bg-[#e9f6fd] border border-[#ddeaf2] text-[#091b31] leading-relaxed">
                <span className="font-bold block mb-1">Editor Critique:</span>
                "{selectedManuscriptForFeedback.reviewerNotes}"
              </div>
              <p className="text-[11px] text-gray-500">
                You can upload a revised draft directly via the Submission Wizard or discuss adjustments with your assigned project editor.
              </p>
            </div>
            <button
              onClick={() => setSelectedManuscriptForFeedback(null)}
              className="w-full mt-2 py-2.5 rounded-xl bg-[#203047] text-white text-xs font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* 7-Step Manuscript Submission Wizard Modal */}
      {showWizard && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-10 shadow-tactile-xl border border-[#ddeaf2] max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-[#ddeaf2]">
              <div>
                <span className="text-xs font-bold uppercase text-[#2d6955]">
                  Step {wizardStep} of 7: {wizardStep === 1 ? 'Title & Identity' : wizardStep === 2 ? 'Synopsis' : wizardStep === 3 ? 'Target Category' : wizardStep === 4 ? 'Upload Document' : wizardStep === 5 ? 'Illustration & Cover' : wizardStep === 6 ? 'Publishing Preferences' : 'Review & Submit'}
                </span>
                <h3 className="font-serif-story text-xl font-bold text-[#091b31]">
                  Book Submission Wizard
                </h3>
              </div>
              <button
                onClick={() => setShowWizard(false)}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500"
              >
                ✕
              </button>
            </div>

            {/* Stepper Progress Bar */}
            <div className="w-full bg-[#ddeaf2] h-2 rounded-full overflow-hidden my-6">
              <div
                className="bg-[#2d6955] h-full transition-all duration-300 rounded-full"
                style={{ width: `${(wizardStep / 7) * 100}%` }}
              />
            </div>

            {wizardSubmitted ? (
              <div className="py-10 text-center flex flex-col items-center gap-3">
                <span className="text-5xl">🎉 📜</span>
                <h3 className="font-serif-story text-2xl font-bold text-[#091b31]">
                  Manuscript Successfully Submitted!
                </h3>
                <p className="text-xs text-[#44474d] max-w-md">
                  "{wizardForm.title}" has been safely queued in the StoryNest Editorial Review Suite. You can track status updates in your author dashboard.
                </p>
                <button
                  onClick={() => setShowWizard(false)}
                  className="mt-4 px-6 py-2.5 rounded-xl bg-[#203047] text-white text-xs font-bold"
                >
                  Return to Dashboard
                </button>
              </div>
            ) : (
              <form onSubmit={handleFinishWizard} className="flex flex-col gap-6">
                {/* STEP 1 */}
                {wizardStep === 1 && (
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#44474d] mb-1">
                        Book Title (English)
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Secrets of the Comet Riders"
                        value={wizardForm.title}
                        onChange={(e) => setWizardForm({ ...wizardForm, title: e.target.value })}
                        className="w-full px-4 py-2.5 bg-[#f4faff] border border-[#ddeaf2] rounded-xl text-xs focus:ring-2 focus:ring-[#203047]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#44474d] mb-1">
                        Bilingual Title (हिंदी, optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. धूमकेतु के सवार"
                        value={wizardForm.titleHindi}
                        onChange={(e) => setWizardForm({ ...wizardForm, titleHindi: e.target.value })}
                        className="w-full px-4 py-2.5 bg-[#f4faff] border border-[#ddeaf2] rounded-xl text-xs focus:ring-2 focus:ring-[#203047]"
                      />
                    </div>
                  </div>
                )}

                {/* STEP 2 */}
                {wizardStep === 2 && (
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#44474d] mb-1">
                        Story Synopsis &amp; Hook (100–300 words)
                      </label>
                      <textarea
                        rows={6}
                        required
                        placeholder="Explain the narrative premise, central characters, conflict, and theme..."
                        value={wizardForm.synopsis}
                        onChange={(e) => setWizardForm({ ...wizardForm, synopsis: e.target.value })}
                        className="w-full p-4 bg-[#f4faff] border border-[#ddeaf2] rounded-xl text-xs focus:ring-2 focus:ring-[#203047]"
                      />
                    </div>
                  </div>
                )}

                {/* STEP 3 */}
                {wizardStep === 3 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#44474d] mb-1">
                        Target Age Group
                      </label>
                      <select
                        value={wizardForm.targetAge}
                        onChange={(e) => setWizardForm({ ...wizardForm, targetAge: e.target.value })}
                        className="w-full px-4 py-2.5 bg-[#f4faff] border border-[#ddeaf2] rounded-xl text-xs focus:ring-2 focus:ring-[#203047]"
                      >
                        <option value="3-5">Ages 3-5 (Early Picture Books)</option>
                        <option value="6-8">Ages 6-8 (Early Chapter Readers)</option>
                        <option value="9-12">Ages 9-12 (Middle Grade Adventures)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#44474d] mb-1">
                        Literary Genre
                      </label>
                      <select
                        value={wizardForm.genre}
                        onChange={(e) => setWizardForm({ ...wizardForm, genre: e.target.value })}
                        className="w-full px-4 py-2.5 bg-[#f4faff] border border-[#ddeaf2] rounded-xl text-xs focus:ring-2 focus:ring-[#203047]"
                      >
                        <option value="Astronomy & Adventure">Astronomy &amp; Adventure</option>
                        <option value="Folklore & Nature">Folklore &amp; Nature</option>
                        <option value="Animals & Seasons">Animals &amp; Seasons</option>
                        <option value="Fantasy & Magic">Fantasy &amp; Magic</option>
                        <option value="Historical Fiction">Historical Fiction</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* STEP 4 */}
                {wizardStep === 4 && (
                  <div className="flex flex-col gap-4">
                    <div className="p-8 border-2 border-dashed border-[#ddeaf2] rounded-2xl bg-[#f4faff] text-center flex flex-col items-center gap-3">
                      <span className="material-symbols-outlined text-4xl text-[#2d6955]">
                        upload_file
                      </span>
                      <div>
                        <p className="font-bold text-xs text-[#091b31]">
                          Selected File: {wizardForm.manuscriptFileName}
                        </p>
                        <p className="text-[11px] text-gray-500 mt-1">
                          Upload your manuscript (PDF, Word .docx, or text)
                        </p>
                      </div>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const fd = new FormData();
                          fd.append('file', file);
                          fd.append('type', 'manuscript');
                          try {
                            const res = await fetch('/api/upload', { method: 'POST', body: fd });
                            const data = await res.json();
                            if (data.success) {
                              setWizardForm({
                                ...wizardForm,
                                manuscriptFileName: file.name,
                                manuscriptFileUrl: data.url,
                              });
                              alert(`Uploaded ${file.name} successfully!`);
                            }
                          } catch {
                            alert('Upload error');
                          }
                        }}
                        className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#203047] file:text-white hover:file:bg-[#091b31] cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#44474d] mb-1">
                        Approximate Word Count
                      </label>
                      <input
                        type="number"
                        value={wizardForm.wordCount}
                        onChange={(e) => setWizardForm({ ...wizardForm, wordCount: e.target.value })}
                        className="w-full px-4 py-2.5 bg-[#f4faff] border border-[#ddeaf2] rounded-xl text-xs focus:ring-2 focus:ring-[#203047]"
                      />
                    </div>
                  </div>
                )}

                {/* STEP 5 */}
                {wizardStep === 5 && (
                  <div className="flex flex-col gap-4">
                    <div className="p-6 border-2 border-dashed border-[#ddeaf2] rounded-2xl bg-[#f4faff] text-center flex flex-col items-center gap-2">
                      <span className="material-symbols-outlined text-3xl text-[#2d6955]">image</span>
                      <p className="font-bold text-xs text-[#091b31]">Upload Cover Artwork or Sample Plate</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const fd = new FormData();
                          fd.append('file', file);
                          fd.append('type', 'cover');
                          try {
                            const res = await fetch('/api/upload', { method: 'POST', body: fd });
                            const data = await res.json();
                            if (data.success) {
                              setWizardForm({ ...wizardForm, coverFileUrl: data.url });
                              alert('Cover image uploaded successfully!');
                            }
                          } catch {
                            alert('Upload error');
                          }
                        }}
                        className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#2d6955] file:text-white hover:file:opacity-90 cursor-pointer"
                      />
                    </div>
                    {wizardForm.coverFileUrl && (
                      <div className="w-28 h-36 rounded-xl overflow-hidden border border-[#ddeaf2] shadow-xs mx-auto">
                        <img
                          src={wizardForm.coverFileUrl}
                          alt="Cover Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 6 */}
                {wizardStep === 6 && (
                  <div className="flex flex-col gap-3">
                    <h4 className="font-bold text-xs text-[#091b31]">Publishing Add-Ons:</h4>
                    <label className="p-3 rounded-xl border border-[#ddeaf2] bg-[#f4faff] flex items-center gap-3 text-xs">
                      <input
                        type="checkbox"
                        checked={wizardForm.needsTranslation}
                        onChange={(e) =>
                          setWizardForm({ ...wizardForm, needsTranslation: e.target.checked })
                        }
                      />
                      <span>Request bilingual Hindi translation &amp; editorial proofing</span>
                    </label>
                    <label className="p-3 rounded-xl border border-[#ddeaf2] bg-[#f4faff] flex items-center gap-3 text-xs">
                      <input
                        type="checkbox"
                        checked={wizardForm.needsIllustration}
                        onChange={(e) =>
                          setWizardForm({ ...wizardForm, needsIllustration: e.target.checked })
                        }
                      />
                      <span>Collaborate with StoryNest vetted children’s illustrators</span>
                    </label>
                  </div>
                )}

                {/* STEP 7 */}
                {wizardStep === 7 && (
                  <div className="p-5 rounded-2xl bg-[#e9f6fd] border border-[#ddeaf2] flex flex-col gap-3 text-xs">
                    <h4 className="font-bold text-sm text-[#091b31]">Submission Summary Review</h4>
                    <p><strong>Title:</strong> {wizardForm.title}</p>
                    <p><strong>Genre &amp; Age:</strong> {wizardForm.genre} • Ages {wizardForm.targetAge}</p>
                    <p><strong>Words:</strong> {wizardForm.wordCount} words</p>
                    <p><strong>Synopsis:</strong> {wizardForm.synopsis}</p>
                    <p className="text-[11px] text-[#2d6955] font-semibold pt-2 border-t border-[#ddeaf2]">
                      ✓ By submitting, you retain 100% intellectual copyright. StoryNest editors will review and reply within 72 hours.
                    </p>
                  </div>
                )}

                {/* Stepper Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-[#ddeaf2]">
                  {wizardStep > 1 ? (
                    <button
                      type="button"
                      onClick={() => setWizardStep(wizardStep - 1)}
                      className="px-4 py-2 rounded-xl bg-gray-100 text-xs font-semibold"
                    >
                      ← Back
                    </button>
                  ) : <div />}

                  {wizardStep < 7 ? (
                    <button
                      type="button"
                      disabled={wizardStep === 1 && !wizardForm.title}
                      onClick={() => setWizardStep(wizardStep + 1)}
                      className="px-6 py-2.5 rounded-xl bg-[#203047] text-white text-xs font-bold hover:bg-[#091b31]"
                    >
                      Next Step →
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={submittingWizard}
                      className="px-8 py-3 rounded-xl bg-[#2d6955] text-white text-xs font-bold hover:opacity-95 shadow-tactile-sm"
                    >
                      {submittingWizard ? 'Submitting...' : 'Confirm & Submit to Editorial Board'}
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
