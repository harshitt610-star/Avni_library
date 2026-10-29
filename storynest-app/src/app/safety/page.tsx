import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { connectToDatabase } from '@/lib/mongodb';
import { CmsPage } from '@/models';

export const dynamic = 'force-dynamic';

export default async function SafetyPage() {
  await connectToDatabase();
  const cms = await CmsPage.findOne({ slug: 'safety' }).lean();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 pt-24 pb-16 bg-[#f4faff]">
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#2d6955] text-white rounded-3xl p-8 sm:p-12 mb-10 shadow-tactile-lg">
            <span className="text-xs uppercase font-bold tracking-wider text-[#b1f0d6]">
              {cms?.heroBadge || 'Unimpeachable Child Safety'}
            </span>
            <h1 className="font-serif-story text-3xl sm:text-4xl font-bold mt-2">
              {cms?.heroHeadline || 'COPPA & Family Privacy Standards'}
            </h1>
            <p className="text-xs sm:text-sm text-gray-200 mt-2">
              {cms?.heroSubheadline || 'Verified COPPA Compliance Statement • 100% Ad-Free Digital Haven for Young Readers'}
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-[#ddeaf2] p-8 sm:p-12 shadow-tactile-sm space-y-8 text-xs sm:text-sm text-[#44474d] leading-relaxed">
            {cms?.bodyContent ? (
              <div className="whitespace-pre-line font-sans text-gray-700 leading-relaxed">
                {cms.bodyContent}
              </div>
            ) : (
              <>
                <section>
                  <h2 className="font-serif-story text-xl font-bold text-[#091b31] mb-2">
                    1. Our Commitment to Children’s Privacy (COPPA)
                  </h2>
                  <p>
                    StoryNest strictly adheres to the United States Children’s Online Privacy Protection Act (COPPA)
                    and international child digital safety guidelines. We recognize that young minds deserve an online sanctuary
                    devoid of surveillance, behavioral advertising, and algorithmic coercion.
                  </p>
                </section>

                <section>
                  <h2 className="font-serif-story text-xl font-bold text-[#091b31] mb-2">
                    2. Information We Never Collect from Children
                  </h2>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li>Real full names or offline postal addresses of minors</li>
                    <li>Exact GPS or fine-grained geolocation data</li>
                    <li>Biometric data, facial images, or voice recordings for biometric analysis</li>
                    <li>Device identifiers or ad-tracking cookies across third-party websites</li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-serif-story text-xl font-bold text-[#091b31] mb-2">
                    3. Parental Consent &amp; Guardian Controls
                  </h2>
                  <p>
                    A child profile can only be created with verifiable parental consent under an authorized Parent/Guardian
                    account. Parents have absolute control over screen-time quotas, reading history deletion, and account termination
                    at any time via the <Link href="/parent" className="font-bold text-[#2d6955] underline">Parent Sanctuary</Link>.
                  </p>
                </section>

                <section>
                  <h2 className="font-serif-story text-xl font-bold text-[#091b31] mb-2">
                    4. Zero Third-Party Advertising
                  </h2>
                  <p>
                    StoryNest contains zero behavioral advertisements, zero pop-up sponsors, and zero commercial product placement.
                    Our revenue comes solely from transparent digital subscriptions and ethical publishing services for creators.
                  </p>
                </section>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
