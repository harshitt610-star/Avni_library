import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 pt-24 pb-16 bg-[#f4faff]">
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#203047] text-white rounded-3xl p-8 sm:p-12 mb-8 shadow-tactile-lg">
            <h1 className="font-serif-story text-3xl font-bold">Privacy &amp; Cookie Policy</h1>
            <p className="text-xs text-gray-300 mt-1">Effective October 2026</p>
          </div>

          <div className="bg-white rounded-3xl border border-[#ddeaf2] p-8 sm:p-12 shadow-tactile-sm space-y-6 text-xs sm:text-sm text-[#44474d] leading-relaxed">
            <section>
              <h2 className="font-serif-story text-lg font-bold text-[#091b31] mb-2">1. Overview</h2>
              <p>
                StoryNest is committed to safeguarding the privacy of children, parents, and authors. We operate under strict principles of data minimization and zero external behavioral tracking.
              </p>
            </section>
            <section>
              <h2 className="font-serif-story text-lg font-bold text-[#091b31] mb-2">2. Data Storage &amp; Encryption</h2>
              <p>
                All account records and reading milestones are securely persisted in our local MongoDB databases with salted hash encryption for authentication secrets.
              </p>
            </section>
            <section>
              <h2 className="font-serif-story text-lg font-bold text-[#091b31] mb-2">3. Third-Party Sharing</h2>
              <p>
                We do not sell, rent, or trade student reading histories or parent contact information to any advertising networks.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
