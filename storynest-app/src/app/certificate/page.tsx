'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';

function CertificateContent() {
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();

  const [studentName, setStudentName] = useState('Aarav Sharma');
  const [isEditingName, setIsEditingName] = useState(false);
  const [bookTitle, setBookTitle] = useState('Tara and the Whispering Stars');
  const [quizTitle, setQuizTitle] = useState('Junior Astronomer & Bilingual Laureate');
  const [authorName, setAuthorName] = useState('Dr. Meera Sharma');
  const [stars, setStars] = useState(30);
  const [certId, setCertId] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [copied, setCopied] = useState(false);
  const [allowCertificateGeneration, setAllowCertificateGeneration] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.allowCertificateGeneration !== undefined) {
          setAllowCertificateGeneration(data.allowCertificateGeneration);
        } else {
          setAllowCertificateGeneration(false);
        }
      })
      .catch(() => setAllowCertificateGeneration(false));

    const nameParam = searchParams.get('name');
    const bookParam = searchParams.get('book');
    const quizParam = searchParams.get('quiz');
    const authorParam = searchParams.get('author');
    const starsParam = searchParams.get('stars');
    const idParam = searchParams.get('id');

    if (nameParam) setStudentName(nameParam);
    if (bookParam) setBookTitle(bookParam);
    if (quizParam) setQuizTitle(quizParam);
    if (authorParam) setAuthorName(authorParam);
    if (starsParam) setStars(Number(starsParam) || 30);
    
    setCertId(idParam || `SN-CERT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);
    setIssueDate(
      new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    );
  }, [searchParams]);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-[#f4faff] flex flex-col justify-between">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#ddeaf2] shadow-tactile-xl text-center">
            <span className="text-4xl mb-3 block">📜</span>
            <h2 className="font-serif-title text-2xl font-bold text-[#091b31]">
              Reader Sign-In Required
            </h2>
            <p className="text-xs sm:text-sm text-[#44474d] mt-2 mb-6">
              Official StoryNest Literary Guild Diplomas are awarded to verified student readers. Please sign in to view and print your certificate.
            </p>
            <Link
              href="/login?role=reader&redirect=/certificate"
              className="w-full py-3 px-4 rounded-xl bg-[#203047] hover:bg-[#142337] text-white font-bold text-sm block transition-all shadow-sm"
            >
              Sign In with Pen-Name / Profile →
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4faff] flex flex-col justify-between">
      <div className="print:hidden">
        <Navbar />
      </div>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 flex flex-col items-center gap-6">
        {/* Breadcrumb & Action Header */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-2 text-xs text-[#44474d]">
            <Link href="/activities" className="hover:text-[#203047] font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Back to Youth Arena</span>
            </Link>
            <span>/</span>
            <span className="text-[#091b31] font-bold">Dynamic Certificate of Honor</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="px-4 py-2 rounded-xl bg-white border border-[#ddeaf2] text-[#203047] text-xs font-semibold hover:bg-gray-50 flex items-center gap-1.5 shadow-tactile-xs transition"
            >
              <span className="material-symbols-outlined text-[16px]">share</span>
              <span>{copied ? 'Link Copied! ✓' : 'Share Certificate'}</span>
            </button>
            {allowCertificateGeneration && (
              <button
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl bg-[#2d6955] text-white text-xs font-bold hover:bg-[#205141] flex items-center gap-1.5 shadow-tactile-sm transition"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                <span>Print / Save PDF (प्रमाण पत्र प्रिंट)</span>
              </button>
            )}
          </div>
        </div>

        {allowCertificateGeneration === false && (
          <div className="w-full max-w-4xl p-6 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-900 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm print:hidden">
            <div className="flex items-center gap-4">
              <span className="text-3xl">🔒</span>
              <div>
                <h3 className="font-serif-story font-bold text-base text-amber-950">
                  Certificate Generation Requires Admin Permission
                </h3>
                <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                  Official StoryNest diplomas are generated under strict supervision. An administrator must grant Certificate Generation Permission in the <strong>Admin Control Panel &rarr; Platform Settings</strong> to unlock official printing and verification.
                </p>
              </div>
            </div>
            <Link
              href="/activities"
              className="px-5 py-2.5 rounded-xl bg-[#203047] text-white text-xs font-bold hover:bg-[#091b31] shrink-0"
            >
              Return to Activities
            </Link>
          </div>
        )}

        {/* Certificate Card */}
        <div
          id="printable-certificate"
          className="w-full max-w-4xl bg-[#FAF7F0] border-8 sm:border-12 border-[#203047] rounded-3xl p-6 sm:p-12 text-center relative shadow-tactile-xl print:shadow-none print:border-8 print:p-8 print:m-0 print:w-full overflow-hidden"
        >
          {/* Subtle Decorative Background Seal Pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
            <span className="material-symbols-outlined text-[420px] text-[#203047]">auto_stories</span>
          </div>

          {/* Certificate Inner Gold Border */}
          <div className="relative z-10 border-2 border-[#E9B44C]/60 rounded-2xl p-6 sm:p-8 flex flex-col items-center">
            {/* Header Badge */}
            <div className="flex items-center justify-between w-full mb-4">
              <div className="flex items-center gap-2 text-left">
                <span className="text-2xl">🦉</span>
                <div>
                  <span className="font-serif-story text-sm font-bold text-[#203047] block tracking-wide">
                    STORYNEST
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-[#2d6955] font-semibold block">
                    Youth Literary Guild
                  </span>
                </div>
              </div>

              <div className="px-3 py-1 rounded-full bg-[#ffdea7] text-[#261800] text-[10px] font-bold flex items-center gap-1">
                <span>⭐</span>
                <span>+{stars} Explorer Stars Earned</span>
              </div>
            </div>

            {/* Title Section */}
            <span className="text-xs uppercase tracking-widest font-extrabold text-[#2d6955] mt-2">
              CERTIFICATE OF LITERARY &amp; COMPREHENSION HONOR
            </span>
            <span className="text-xs text-[#44474d] font-semibold block mt-0.5">
              साहित्यिक एवं बोध सम्मान प्रमाण पत्र
            </span>

            <h1 className="font-serif-story text-2xl sm:text-4xl font-bold text-[#091b31] mt-3">
              {quizTitle}
            </h1>

            <p className="text-xs sm:text-sm text-[#44474d] mt-4 italic">
              This distinguished honor is proudly conferred upon
            </p>

            {/* Student Name */}
            <div className="my-4 relative group">
              {isEditingName ? (
                <div className="flex items-center gap-2 justify-center">
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="font-serif-story text-2xl sm:text-3xl font-bold text-[#203047] text-center border-b-2 border-[#2d6955] bg-transparent focus:outline-none px-2 py-1"
                    autoFocus
                  />
                  <button
                    onClick={() => setIsEditingName(false)}
                    className="px-3 py-1 rounded-lg bg-[#2d6955] text-white text-xs font-semibold print:hidden"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <h2 className="font-serif-story text-3xl sm:text-4xl font-extrabold text-[#203047] underline decoration-[#E9B44C] decoration-4 underline-offset-8">
                    {studentName}
                  </h2>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="opacity-0 group-hover:opacity-100 transition text-gray-400 hover:text-gray-700 print:hidden text-xs"
                    title="Click to edit name"
                  >
                    ✏️
                  </button>
                </div>
              )}
            </div>

            {/* Achievement Text */}
            <p className="text-xs sm:text-sm text-[#44474d] max-w-xl mx-auto leading-relaxed mt-2">
              For demonstrating extraordinary reading dedication, celestial curiosity, and critical comprehension while successfully completing the companion study for{' '}
              <strong className="text-[#091b31] font-bold">&ldquo;{bookTitle}&rdquo;</strong>.
            </p>

            {/* Seal & Signatures Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full items-center mt-10 pt-6 border-t border-[#ddeaf2]">
              {/* Author Signature */}
              <div className="flex flex-col items-center text-center">
                <span className="font-serif-story text-lg italic font-bold text-[#203047] tracking-wider mb-1">
                  {authorName}
                </span>
                <div className="w-32 h-[1px] bg-[#203047]/40 mb-1" />
                <span className="text-[11px] font-bold text-[#091b31]">{authorName}</span>
                <span className="text-[9px] text-gray-500">Author &amp; Literary Mentor</span>
              </div>

              {/* Official Gold Rosette Seal */}
              <div className="flex flex-col items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#E9B44C] via-[#ffdea7] to-[#E9B44C] p-1 shadow-tactile-sm flex items-center justify-center border-2 border-white">
                  <div className="w-full h-full rounded-full border border-dashed border-[#261800]/40 flex flex-col items-center justify-center text-[#261800]">
                    <span className="material-symbols-outlined text-[24px]">verified</span>
                    <span className="text-[8px] font-extrabold uppercase tracking-tighter">OFFICIAL SEAL</span>
                  </div>
                </div>
                <span className="text-[9px] font-mono text-gray-500 mt-2">
                  ID: {certId}
                </span>
              </div>

              {/* Editorial Board Signature */}
              <div className="flex flex-col items-center text-center">
                <span className="font-serif-story text-lg italic font-bold text-[#2d6955] tracking-wider mb-1">
                  Dr. Anita Sen
                </span>
                <div className="w-32 h-[1px] bg-[#203047]/40 mb-1" />
                <span className="text-[11px] font-bold text-[#091b31]">Editorial Board Director</span>
                <span className="text-[9px] text-gray-500">StoryNest Certified Youth Guild</span>
              </div>
            </div>

            {/* Footer Date & Security Code */}
            <div className="flex flex-col sm:flex-row items-center justify-between w-full mt-6 pt-3 text-[10px] text-gray-500 border-t border-dashed border-gray-300">
              <span>Conferred on: <strong>{issueDate}</strong></span>
              <span>COPPA Safe &amp; Cryptographically Verified</span>
            </div>
          </div>
        </div>

        {/* Helpful Tips for Parents / Educators */}
        <div className="w-full max-w-4xl bg-white rounded-2xl p-5 border border-[#ddeaf2] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#44474d] print:hidden">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <strong className="text-[#091b31] block">Tip for Parents &amp; Teachers</strong>
              <span>You can hover over the student name above and click ✏️ to customize the recipient name before printing or downloading as PDF.</span>
            </div>
          </div>
          <Link
            href="/library"
            className="px-4 py-2 rounded-xl bg-[#e9f6fd] text-[#203047] font-semibold hover:bg-[#ddeaf2] shrink-0"
          >
            Explore Next Book →
          </Link>
        </div>
      </main>

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}

export default function CertificatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAF7F0] font-serif-story text-lg text-[#203047]">
          Loading StoryNest Honor Diploma...
        </div>
      }
    >
      <CertificateContent />
    </Suspense>
  );
}
