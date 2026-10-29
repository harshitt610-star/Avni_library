import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { connectToDatabase } from '@/lib/mongodb';
import { CmsPage } from '@/models';

export const dynamic = 'force-dynamic';

export default async function AboutPage() {
  await connectToDatabase();
  const cms = await CmsPage.findOne({ slug: 'about' }).lean();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 pt-24 pb-16 bg-[#f4faff]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#203047] text-white rounded-3xl p-8 sm:p-14 mb-12 shadow-tactile-xl relative overflow-hidden">
            <span className="text-xs uppercase font-bold tracking-wider text-[#ffdea7]">
              {cms?.heroBadge || 'Our Literary Mission'}
            </span>
            <h1 className="font-serif-story text-3xl sm:text-5xl font-bold mt-2 leading-tight">
              {cms?.heroHeadline || 'Where Young Minds Read, Create & Grow'}
            </h1>
            <p className="text-gray-300 text-sm sm:text-base max-w-2xl mt-3 leading-relaxed">
              {cms?.heroSubheadline ||
                'StoryNest was founded on the belief that children’s literature should be vibrant, bilingual, tactile, and unconditionally safe. We empower independent writers, illustrators, and curious readers to connect across languages and cultures.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white rounded-3xl border border-[#ddeaf2] p-8 shadow-tactile-sm">
              <span className="text-4xl block mb-3">📖</span>
              <h3 className="font-serif-story text-xl font-bold text-[#091b31]">Bilingual Harmony</h3>
              <p className="text-xs sm:text-sm text-[#44474d] mt-2 leading-relaxed">
                Stories published side-by-side in English and हिंदी (Hindi), preserving regional Indian folklore,
                cosmic STEM science, and seasonal nature narratives.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-[#ddeaf2] p-8 shadow-tactile-sm">
              <span className="text-4xl block mb-3">🛡️</span>
              <h3 className="font-serif-story text-xl font-bold text-[#091b31]">100% Ad-Free &amp; COPPA Safe</h3>
              <p className="text-xs sm:text-sm text-[#44474d] mt-2 leading-relaxed">
                No third-party behavioral trackers, no algorithms monetizing children’s screen time.
                A calm, paper-inspired sanctuary parents and educators can trust.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-[#ddeaf2] p-8 shadow-tactile-sm">
              <span className="text-4xl block mb-3">✍️</span>
              <h3 className="font-serif-story text-xl font-bold text-[#091b31]">Author Guild Support</h3>
              <p className="text-xs sm:text-sm text-[#44474d] mt-2 leading-relaxed">
                Independent authors receive expert developmental editing, professional children’s illustration,
                and direct royalty distribution while retaining 100% intellectual copyright.
              </p>
            </div>
          </div>

          {cms?.bodyContent && (
            <div className="bg-white rounded-3xl border border-[#ddeaf2] p-8 sm:p-10 shadow-tactile mb-16">
              <h3 className="font-serif-story text-2xl font-bold text-[#203047] mb-4">
                Platform Principles &amp; Governance
              </h3>
              <div className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line font-sans">
                {cms.bodyContent}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
