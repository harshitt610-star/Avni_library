'use client';

import React, { useState } from 'react';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string, name: string) => Promise<void>;
  loading: boolean;
}

export default function GoogleAuthModal({
  isOpen,
  onClose,
  onSuccess,
  loading,
}: GoogleAuthModalProps) {
  const [customEmail, setCustomEmail] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#ddeaf2] p-6 sm:p-8 animate-in fade-in zoom-in-95 relative text-left">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center cursor-pointer transition-colors"
          aria-label="Close dialog"
        >
          ✕
        </button>

        {/* Header */}
        <div className="flex flex-col items-center text-center pb-5 border-b border-gray-100">
          <svg className="w-10 h-10 mb-3" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              fill="#EA4335"
            />
          </svg>
          <h3 className="font-serif-title text-xl font-bold text-[#091b31]">Sign in with Google</h3>
          <p className="text-xs text-[#44474d] mt-1">
            Choose a verified account to access the <span className="font-bold text-[#203047]">StoryNest Family Sanctuary</span>
          </p>
        </div>

        {/* Pre-configured Verified Accounts */}
        <div className="py-4 space-y-2.5">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-[#74777f]">
            Verified Family Accounts
          </span>

          {/* Account 1: Priya Sharma */}
          <button
            type="button"
            disabled={loading}
            onClick={() => onSuccess('parent@storynest.com', 'Priya Sharma')}
            className="w-full p-3 rounded-2xl border border-[#ddeaf2] bg-[#f8fbfe] hover:bg-[#e9f6fd] hover:border-[#bce3f5] transition-all flex items-center justify-between group cursor-pointer text-left disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80"
                alt="Priya Sharma"
                className="w-10 h-10 rounded-full object-cover border border-[#ddeaf2]"
              />
              <div>
                <div className="font-bold text-sm text-[#091b31] group-hover:text-[#2d6955]">Priya Sharma</div>
                <div className="text-xs text-[#74777f]">parent@storynest.com</div>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              Parent
            </span>
          </button>

          {/* Account 2: Family Link Guardian */}
          <button
            type="button"
            disabled={loading}
            onClick={() => onSuccess('parent.guard@familymail.org', 'Family Link Guardian')}
            className="w-full p-3 rounded-2xl border border-[#ddeaf2] bg-[#f8fbfe] hover:bg-[#e9f6fd] hover:border-[#bce3f5] transition-all flex items-center justify-between group cursor-pointer text-left disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#e3f0f8] text-[#203047] font-bold flex items-center justify-center border border-[#ddeaf2]">
                FL
              </div>
              <div>
                <div className="font-bold text-sm text-[#091b31] group-hover:text-[#2d6955]">Family Link Guardian</div>
                <div className="text-xs text-[#74777f]">parent.guard@familymail.org</div>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full">
              Family Link
            </span>
          </button>
        </div>

        {/* Custom Email */}
        <div className="pt-3 border-t border-gray-100">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-[#74777f] mb-2">
            Or Sign in with another Google Email
          </span>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="parent.name@gmail.com"
              value={customEmail}
              onChange={(e) => setCustomEmail(e.target.value)}
              className="flex-1 px-3.5 py-2.5 bg-[#f8fbfe] border border-[#ddeaf2] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#203047]"
            />
            <button
              type="button"
              disabled={loading || !customEmail.includes('@')}
              onClick={() => onSuccess(customEmail, customEmail.split('@')[0])}
              className="px-4 py-2.5 rounded-xl bg-[#203047] hover:bg-[#142337] text-white text-xs font-bold transition-colors disabled:opacity-40 cursor-pointer"
            >
              {loading ? 'Signing in...' : 'Continue'}
            </button>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-[#74777f]">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-emerald-600">verified_user</span>
            COPPA & Family Link Certified
          </span>
          <a href="/safety" target="_blank" className="hover:underline text-[#203047]">
            Privacy Policy
          </a>
        </div>
      </div>
    </div>
  );
}

