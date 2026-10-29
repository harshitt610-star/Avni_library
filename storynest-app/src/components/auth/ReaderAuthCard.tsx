'use client';

import React, { useState } from 'react';

const funAdjectives = ['Curious', 'Brave', 'Cosmic', 'Starlight', 'Velvet', 'Nimble', 'Solar', 'Clever', 'Wonder'];
const funAnimals = ['Otter', 'Falcon', 'Koala', 'Fox', 'Dolphin', 'Dragon', 'Phoenix', 'Sparrow', 'Badger'];

interface ReaderAuthCardProps {
  onLogin: (penName: string, secret: string) => Promise<void>;
  onOpenRegister: () => void;
  loading: boolean;
  error?: string;
}

export default function ReaderAuthCard({
  onLogin,
  onOpenRegister,
  loading,
  error,
}: ReaderAuthCardProps) {
  const [penName, setPenName] = useState('StarlightFalcon42');
  const [secret, setSecret] = useState('GoldenPhoenix99');

  const handleGenerateRandom = () => {
    const adj = funAdjectives[Math.floor(Math.random() * funAdjectives.length)];
    const animal = funAnimals[Math.floor(Math.random() * funAnimals.length)];
    const num = Math.floor(Math.random() * 90) + 10;
    setPenName(`${adj}${animal}${num}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(penName, secret);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#ddeaf2] flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🧒</span>
            <div>
              <h2 className="font-serif-title text-xl font-bold text-[#091b31]">
                Young Reader Sanctuary
              </h2>
              <p className="text-xs text-[#44474d]">
                Enter your secret pen-name to resume your adventures & badges.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full shrink-0">
            Ages 6–12
          </span>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Pen Name */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#44474d]">
                Secret Pen-Name
              </label>
              <button
                type="button"
                onClick={handleGenerateRandom}
                className="text-xs font-bold text-[#2d6955] hover:text-[#1e483a] flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>🎲</span> Random Idea
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                value={penName}
                onChange={(e) => setPenName(e.target.value)}
                required
                placeholder="e.g. CosmicOtter42"
                className="w-full px-4 py-3 bg-[#f8fbfe] border border-[#ddeaf2] rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#203047] pl-10"
              />
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
                badge
              </span>
            </div>
          </div>

          {/* Passphrase */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#44474d] mb-1.5">
              Secret Passphrase
            </label>
            <div className="relative">
              <input
                type="password"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                required
                placeholder="Enter passphrase..."
                className="w-full px-4 py-3 bg-[#f8fbfe] border border-[#ddeaf2] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#203047] pl-10"
              />
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
                key
              </span>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#203047] to-[#18293d] hover:from-[#142337] hover:to-[#0f1b2b] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                <span>Unlocking Books...</span>
              </>
            ) : (
              <>
                <span>Enter Reading Sanctuary</span>
                <span className="material-symbols-outlined text-[18px]">auto_stories</span>
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
            setPenName('reader@storynest.com');
            setSecret('reader123');
          }}
          className="text-[#2d6955] font-bold hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>🚀</span> 1-Click Aarav Demo Credentials
        </button>

        <button
          type="button"
          onClick={onOpenRegister}
          className="font-bold text-[#203047] hover:underline cursor-pointer"
        >
          New Reader? Create Pen-Name →
        </button>
      </div>
    </div>
  );
}

