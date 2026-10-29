'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Is StoryNest really 100% free and ad-free for children?',
      a: 'Yes! StoryNest is completely ad-free. Our core reading catalogue, comprehension quizzes, and bilingual reader are free for young readers. We sustain our platform through professional author publishing packages and premium live masterclasses.',
    },
    {
      q: 'How does bilingual reading work on StoryNest?',
      a: 'Each book can be read in English, Hindi (हिंदी), or side-by-side in dual columns. Readers can toggle modes in real time in the online reader to develop bilingual literacy naturally.',
    },
    {
      q: 'Do authors keep 100% intellectual copyright for their books?',
      a: 'Absolutely. When you publish through StoryNest or submit via our manuscript wizard, you retain full author copyright. We act as your production and distribution partner.',
    },
    {
      q: 'How does COPPA protect my child’s data?',
      a: 'We do not collect names, emails, phone numbers, or locations from child readers. All student profiles are authorized through a parent or educator account with strict parental consent.',
    },
    {
      q: 'How are live workshops conducted?',
      a: 'Workshops are conducted in safe, instructor-led virtual rooms with moderated questions and answers. Children can raise hands, take sketchpad notes, and download printable worksheets.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 pt-24 pb-16 bg-[#f4faff]">
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2d6955]">
              Help &amp; Knowledge Center
            </span>
            <h1 className="font-serif-story text-3xl sm:text-4xl font-bold text-[#091b31] mt-1">
              Frequently Asked Questions
            </h1>
          </div>

          <div className="bg-white rounded-3xl border border-[#ddeaf2] p-6 sm:p-10 shadow-tactile-sm divide-y divide-[#ddeaf2]">
            {faqs.map((faq, idx) => (
              <div key={idx} className="py-4">
                <button
                  onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                  className="w-full text-left flex items-center justify-between text-sm sm:text-base font-serif-story font-bold text-[#091b31] hover:text-[#2d6955] transition-colors"
                >
                  <span>{faq.q}</span>
                  <span className="text-xl ml-2">{openIndex === idx ? '−' : '+'}</span>
                </button>
                {openIndex === idx && (
                  <p className="mt-2 text-xs sm:text-sm text-[#44474d] leading-relaxed">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
