'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PublishServicesPage() {
  const [selectedTier, setSelectedTier] = useState<'Starter Sprout' | 'Illustrator Gold' | 'Master Guild'>('Illustrator Gold');
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [portalEnabled, setPortalEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.enablePublishingPortal !== undefined) {
          setPortalEnabled(data.enablePublishingPortal);
        } else {
          setPortalEnabled(true);
        }
      })
      .catch(() => setPortalEnabled(true));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/publish/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorName,
          authorEmail,
          packageTier: selectedTier,
          notes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        alert(data.error || 'Failed to submit request');
      }
    } catch {
      alert('Error submitting publishing inquiry');
    } finally {
      setLoading(false);
    }
  };

  const tiers = [
    {
      name: 'Starter Sprout',
      subtitle: 'For emerging authors with completed text',
      price: '₹14,999 / $180',
      badge: 'Editorial Essentials',
      features: [
        'Developmental manuscript critique',
        'Line-by-line copyediting & proofreading',
        'Standard typographic interior formatting',
        'Official ISBN assignment & barcode',
        'Digital publication on StoryNest catalogue',
      ],
    },
    {
      name: 'Illustrator Gold',
      subtitle: 'Our most popular author package',
      price: '₹39,999 / $480',
      badge: 'Most Popular ⭐',
      highlight: true,
      features: [
        'Everything in Starter Sprout',
        '12 custom full-spread illustrations by vetted artists',
        'Bilingual layout (Hindi & English dual typography)',
        'Print-on-demand paperback distribution setup',
        'Author spotlight interview & featured library carousel',
        'Dedicated editorial project manager',
      ],
    },
    {
      name: 'Master Guild',
      subtitle: 'Full-scale literary launch & multimedia',
      price: '₹74,999 / $890',
      badge: 'All-Inclusive Master Suite',
      features: [
        'Everything in Illustrator Gold',
        'Professional audio narration studio recording',
        'Interactive comprehension quiz built for your story',
        '1 live StoryNest workshop hosted with young readers',
        'Author website landing page + promotional social kit',
        'Global library licensing & school district pitching',
      ],
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 pt-24 pb-16 bg-[#f4faff]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Banner */}
          <div className="bg-[#203047] text-white rounded-3xl p-8 sm:p-14 mb-12 shadow-tactile-xl relative overflow-hidden">
            <div className="relative z-10 max-w-2xl flex flex-col gap-4">
              <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-[#ffdea7] text-xs font-bold w-fit">
                StoryNest Publishing Services
              </span>
              <h1 className="font-serif-story text-3xl sm:text-5xl font-bold leading-tight">
                Your Story Deserves to Be Read.
              </h1>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                Whether you have an unpolished draft, completed verses, or a full picture-book concept,
                our dedicated team of children’s editors, bilingual typographers, and illustrators will guide
                you from first draft to global publication.
              </p>
              <div className="pt-2 flex items-center gap-4">
                <a
                  href="#packages"
                  className="px-6 py-3 rounded-xl bg-[#2d6955] text-white text-xs font-bold hover:opacity-95 shadow-tactile-sm"
                >
                  View Packages Below
                </a>
                <Link
                  href="/author"
                  className="px-6 py-3 rounded-xl bg-white/10 text-white text-xs font-bold hover:bg-white/20"
                >
                  Go to Manuscript Wizard →
                </Link>
              </div>
            </div>
          </div>

          {portalEnabled === false && (
            <div className="mb-10 p-6 rounded-2xl bg-[#ffdad6]/60 border-2 border-[#ba1a1a] text-[#410002] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-4">
                <span className="text-3xl">🔒</span>
                <div>
                  <h3 className="font-serif-story font-bold text-base text-[#93000a]">
                    Publishing Portal Controlled by Admin Panel
                  </h3>
                  <p className="text-xs text-[#93000a]/80 mt-0.5">
                    New author publishing package inquiries are currently closed by the StoryNest Editorial Board. Administrators can enable access at any time from the Platform Settings in the Admin Panel.
                  </p>
                </div>
              </div>
              <Link
                href="/library"
                className="px-5 py-2.5 rounded-xl bg-[#203047] text-white text-xs font-bold hover:bg-[#091b31] shrink-0"
              >
                Browse Library
              </Link>
            </div>
          )}

          {/* Pricing & Packages Section */}
          <section id="packages" className="mb-16">
            <div className="text-center max-w-xl mx-auto mb-10">
              <span className="text-xs font-bold uppercase tracking-wider text-[#2d6955]">
                Transparent Author Packages
              </span>
              <h2 className="font-serif-story text-3xl font-bold text-[#091b31] mt-1">
                Select Your Publishing Path
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
              {tiers.map((t) => (
                <div
                  key={t.name}
                  className={`rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all border ${
                    t.highlight
                      ? 'bg-white border-[#203047] ring-2 ring-[#203047] shadow-tactile-lg relative'
                      : 'bg-white border-[#ddeaf2] shadow-tactile-sm hover:shadow-tactile-md'
                  }`}
                >
                  {t.highlight && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#203047] text-white text-[11px] font-bold shadow-xs">
                      {t.badge}
                    </span>
                  )}
                  <div>
                    <h3 className="font-serif-story text-xl font-bold text-[#091b31]">{t.name}</h3>
                    <p className="text-xs text-[#75777e] mt-1">{t.subtitle}</p>
                    <div className="my-4 pb-4 border-b border-[#ddeaf2]">
                      <span className="text-2xl font-bold text-[#091b31] font-serif-story">
                        {t.price}
                      </span>
                      <span className="text-xs text-[#75777e] block mt-0.5">one-time full production fee</span>
                    </div>

                    <ul className="space-y-2.5 text-xs text-[#44474d]">
                      {t.features.map((f, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-[#2d6955] font-bold shrink-0">✓</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-6 mt-6 border-t border-[#ddeaf2]">
                    <button
                      onClick={() => {
                        setSelectedTier(t.name as any);
                        const form = document.getElementById('inquiry-form');
                        form?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className={`w-full py-3 rounded-xl text-xs font-bold transition-all ${
                        selectedTier === t.name
                          ? 'bg-[#2d6955] text-white shadow-tactile-sm'
                          : 'bg-[#e9f6fd] text-[#203047] hover:bg-[#203047] hover:text-white'
                      }`}
                    >
                      {selectedTier === t.name ? 'Selected for Inquiry' : 'Choose Package'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Consultation Order Request Form */}
          <section id="inquiry-form" className="max-w-2xl mx-auto bg-white rounded-3xl border border-[#ddeaf2] p-6 sm:p-10 shadow-tactile-sm">
            {submitted ? (
              <div className="py-8 text-center flex flex-col items-center gap-3">
                <span className="text-5xl">📖 🤝</span>
                <h3 className="font-serif-story text-2xl font-bold text-[#091b31]">
                  Consultation Request Received!
                </h3>
                <p className="text-xs text-[#44474d] max-w-md">
                  Thank you, {authorName}. Our children’s publishing editorial board has received your request for the <strong>{selectedTier}</strong> tier. An editor will contact you at {authorEmail} within 24 hours.
                </p>
                <Link
                  href="/author"
                  className="mt-4 px-6 py-2.5 rounded-xl bg-[#203047] text-white text-xs font-bold"
                >
                  Visit Author Studio
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <span className="text-xs font-bold text-[#2d6955] uppercase">
                  Schedule Free Editorial Consultation
                </span>
                <h3 className="font-serif-story text-2xl font-bold text-[#091b31]">
                  Connect with StoryNest Editors
                </h3>
                <p className="text-xs text-[#44474d]">
                  Selected Package: <strong className="text-[#091b31]">{selectedTier}</strong>
                </p>

                <div>
                  <label className="block text-xs font-bold text-[#44474d] mb-1">
                    Your Full Author Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Meera Sharma"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#f4faff] border border-[#ddeaf2] rounded-xl text-xs focus:ring-2 focus:ring-[#203047]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#44474d] mb-1">
                    Contact Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="author@example.com"
                    value={authorEmail}
                    onChange={(e) => setAuthorEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#f4faff] border border-[#ddeaf2] rounded-xl text-xs focus:ring-2 focus:ring-[#203047]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#44474d] mb-1">
                    Tell us about your story or manuscript (Synopsis, target age, bilingual goals)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="My story is an illustrated astronomy tale for ages 6-8, seeking watercolor plates and Hindi translation..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-4 bg-[#f4faff] border border-[#ddeaf2] rounded-xl text-xs focus:ring-2 focus:ring-[#203047]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="py-3.5 rounded-xl bg-[#203047] text-white text-xs font-bold hover:bg-[#091b31] shadow-tactile-sm transition-all"
                >
                  {loading ? 'Submitting Request...' : 'Submit Publishing Consultation Request'}
                </button>
              </form>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
