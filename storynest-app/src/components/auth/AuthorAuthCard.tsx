'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface AuthorAuthCardProps {
  onLogin: (email: string, secret: string) => Promise<void>;
  loading: boolean;
  error?: string;
}

export default function AuthorAuthCard({
  onLogin,
  loading,
  error,
}: AuthorAuthCardProps) {
  const [email, setEmail] = useState('author@storynest.com');
  const [password, setPassword] = useState('author123');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#ddeaf2] flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-3xl">✍️</span>
            <div>
              <h2 className="font-serif-title text-xl font-bold text-[#091b31]">
                Author & Educator Studio
              </h2>
              <p className="text-xs text-[#44474d]">
                Manage manuscripts, host literary workshops, and view reader engagement.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-sky-800 bg-sky-100 px-3 py-1 rounded-full shrink-0">
            Literary Guild
          </span>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#44474d] mb-1.5">
              Author / Educator Email
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="author@storynest.com"
                className="w-full px-4 py-3 bg-[#f8fbfe] border border-[#ddeaf2] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#203047] pl-10"
              />
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
                mail
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#44474d] mb-1.5">
              Studio Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter studio password..."
                className="w-full px-4 py-3 bg-[#f8fbfe] border border-[#ddeaf2] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#203047] pl-10"
              />
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
                lock
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-[#1e4a6d] hover:bg-[#15344d] text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                <span>Opening Studio...</span>
              </>
            ) : (
              <>
                <span>Access Author Studio</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Footer / Demo Shortcut */}
      <div className="mt-6 pt-5 border-t border-[#ddeaf2] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <button
          type="button"
          onClick={() => {
            setEmail('author@storynest.com');
            setPassword('author123');
          }}
          className="text-[#1e4a6d] font-bold hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>📖</span> 1-Click Dr. Meera Demo Credentials
        </button>

        <Link
          href="/publish"
          className="font-bold text-[#203047] hover:underline flex items-center gap-1"
        >
          Explore Publishing Packages →
        </Link>
      </div>
    </div>
  );
}

