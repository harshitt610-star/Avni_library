import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full bg-[#091b31] text-white mt-auto pt-16 pb-12 border-t border-[#203047]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Brand Info */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2d6955] text-white flex items-center justify-center font-serif-story text-xl font-bold shadow-md">
                S
              </div>
              <span className="font-serif-story text-2xl font-bold text-white tracking-tight">
                StoryNest
              </span>
            </div>
            <p className="text-sm text-gray-300 max-w-sm leading-relaxed">
              A bilingual haven where children explore captivating illustrated books in English and
              हिंदी, and passionate authors bring rich cultural narratives to life.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-[#b1f0d6]">
                <span className="material-symbols-outlined text-[16px]">verified_user</span>
                100% COPPA Safe
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-[#ffdea7]">
                <span className="material-symbols-outlined text-[16px]">star</span>
                Ad-Free Sanctuary
              </span>
            </div>
          </div>

          {/* Column 1: Discovery */}
          <div className="flex flex-col gap-3">
            <h4 className="font-serif-story text-base font-bold text-white">Discovery</h4>
            <Link href="/library" className="text-sm text-gray-300 hover:text-white transition-colors">
              Digital Library
            </Link>
            <Link href="/library?genre=Astronomy" className="text-sm text-gray-300 hover:text-white transition-colors">
              STEM & Astronomy
            </Link>
            <Link href="/library?genre=Folklore" className="text-sm text-gray-300 hover:text-white transition-colors">
              Bilingual Indian Folklore
            </Link>
            <Link href="/workshops" className="text-sm text-gray-300 hover:text-white transition-colors">
              Live Author Workshops
            </Link>
            <Link href="/activities" className="text-sm text-gray-300 hover:text-white transition-colors">
              Interactive Quizzes
            </Link>
          </div>

          {/* Column 2: Creator Studio */}
          <div className="flex flex-col gap-3">
            <h4 className="font-serif-story text-base font-bold text-white">Creators & Authors</h4>
            <Link href="/publish" className="text-sm text-gray-300 hover:text-white transition-colors">
              Publish With StoryNest
            </Link>
            <Link href="/author" className="text-sm text-gray-300 hover:text-white transition-colors">
              Manuscript Wizard
            </Link>
            <Link href="/author/promotion" className="text-sm text-gray-300 hover:text-white transition-colors">
              Author Promotion Hub
            </Link>
            <Link href="/activities?tab=contests" className="text-sm text-gray-300 hover:text-white transition-colors">
              Young Authors Arena
            </Link>
            <Link href="/login?role=author" className="text-sm text-gray-300 hover:text-white transition-colors">
              Author Portal
            </Link>
          </div>

          {/* Column 3: Trust & Governance */}
          <div className="flex flex-col gap-3">
            <h4 className="font-serif-story text-base font-bold text-white">Safety & Support</h4>
            <Link href="/safety" className="text-sm text-gray-300 hover:text-white transition-colors">
              Child Safety & COPPA
            </Link>
            <Link href="/parent" className="text-sm text-gray-300 hover:text-white transition-colors">
              Parent Guardian Sanctuary
            </Link>
            <Link href="/faq" className="text-sm text-gray-300 hover:text-white transition-colors">
              Frequently Asked Questions
            </Link>
            <Link href="/contact" className="text-sm text-gray-300 hover:text-white transition-colors">
              Contact Editorial Desk
            </Link>
            <Link href="/privacy" className="text-sm text-gray-300 hover:text-white transition-colors">
              Privacy & Cookie Policy
            </Link>
            <Link href="/terms" className="text-sm text-gray-300 hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>© 2026 StoryNest Literary Publishing Platform. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Powered by MongoDB Compass</span>
            <span>•</span>
            <span>Bilingual English &amp; हिंदी Stories</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
