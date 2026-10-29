import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 pt-24 pb-16 bg-[#f4faff]">
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#203047] text-white rounded-3xl p-8 sm:p-12 mb-8 shadow-tactile-lg">
            <h1 className="font-serif-story text-3xl font-bold">Terms of Service</h1>
            <p className="text-xs text-gray-300 mt-1">Effective October 2026</p>
          </div>

          <div className="bg-white rounded-3xl border border-[#ddeaf2] p-8 sm:p-12 shadow-tactile-sm space-y-6 text-xs sm:text-sm text-[#44474d] leading-relaxed">
            <section>
              <h2 className="font-serif-story text-lg font-bold text-[#091b31] mb-2">1. Acceptance of Terms</h2>
              <p>
                By accessing StoryNest, you agree to abide by our community standards, author copyright protections, and child safety rules.
              </p>
            </section>
            <section>
              <h2 className="font-serif-story text-lg font-bold text-[#091b31] mb-2">2. Author Copyright Protections</h2>
              <p>
                Authors submitting stories through our wizard retain full ownership of their text, characters, and intellectual properties. StoryNest is granted a non-exclusive distribution license for platform readers.
              </p>
            </section>
            <section>
              <h2 className="font-serif-story text-lg font-bold text-[#091b31] mb-2">3. Community Standards</h2>
              <p>
                Submissions and workshop discussions must remain suitable for children under 13. Defamatory, inappropriate, or harmful content will be permanently removed by the moderation board.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
