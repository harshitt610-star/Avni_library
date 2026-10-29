'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function ActionGateModal() {
  const router = useRouter();
  const { gateState, closeGate, checkAuth } = useAuth();
  const [loadingRole, setLoadingRole] = useState<string | null>(null);

  if (!gateState.isOpen) return null;

  const handleQuickLogin = async (role: 'reader' | 'parent' | 'author') => {
    setLoadingRole(role);
    try {
      const email =
        role === 'reader'
          ? 'reader@storynest.com'
          : role === 'parent'
          ? 'parent@storynest.com'
          : 'author@storynest.com';
      const password =
        role === 'reader'
          ? 'reader123'
          : role === 'parent'
          ? 'parent123'
          : 'author123';

      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email, password }),
      });

      const data = await res.json();
      if (data.success) {
        await checkAuth();
        closeGate();
        router.push(gateState.targetUrl);
      } else {
        router.push(`/login?role=${role}&redirect=${encodeURIComponent(gateState.targetUrl)}`);
      }
    } catch {
      router.push(`/login?role=${role}&redirect=${encodeURIComponent(gateState.targetUrl)}`);
    } finally {
      setLoadingRole(null);
    }
  };

  const handleCustomSignIn = (role: 'reader' | 'parent' | 'author') => {
    closeGate();
    router.push(`/login?role=${role}&redirect=${encodeURIComponent(gateState.targetUrl)}`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#ddeaf2] p-6 sm:p-8 animate-in fade-in zoom-in-95 relative text-left">
        {/* Close Button */}
        <button
          type="button"
          onClick={closeGate}
          className="absolute right-5 top-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center cursor-pointer transition-colors"
          aria-label="Close dialog"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e9f6fd] border border-[#bce3f5] text-[#203047] text-xs font-bold mb-2.5">
            <span>✨</span>
            <span>Sign In to Continue</span>
          </div>

          <h3 className="font-serif-title text-2xl font-bold text-[#091b31]">
            Unlock Your Literary Adventure
          </h3>
          <p className="text-xs sm:text-sm text-[#44474d] mt-1.5 leading-relaxed">
            {gateState.reason || 'Sign in or pick a pen-name to read full chapters, earn Spark Stars, and save your reading streak.'}
          </p>
        </div>

        {/* 1-Click Fast Persona Options */}
        <div className="space-y-3 my-5">
          {/* Option 1: Young Reader */}
          <div className="p-3.5 rounded-2xl border border-[#ddeaf2] bg-[#f8fbfe] hover:bg-[#e9f6fd] transition-all flex items-center justify-between gap-3 group">
            <div className="flex items-center gap-3">
              <span className="text-2xl sm:text-3xl">🧒</span>
              <div>
                <div className="font-bold text-sm text-[#091b31] group-hover:text-[#2d6955]">
                  I am a Young Reader
                </div>
                <div className="text-xs text-[#74777f]">
                  Read stories, take quizzes & collect Spark Stars ⭐
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                disabled={loadingRole !== null}
                onClick={() => handleQuickLogin('reader')}
                className="py-1.5 px-3 rounded-xl bg-[#203047] hover:bg-[#142337] text-white text-xs font-bold cursor-pointer transition-colors disabled:opacity-50"
              >
                {loadingRole === 'reader' ? 'Loading...' : '1-Click Aarav'}
              </button>
              <button
                type="button"
                onClick={() => handleCustomSignIn('reader')}
                className="py-1.5 px-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#091b31] text-xs font-semibold cursor-pointer"
                title="Enter custom pen-name"
              >
                Pen-Name →
              </button>
            </div>
          </div>

          {/* Option 2: Parent Sanctuary */}
          <div className="p-3.5 rounded-2xl border border-[#ddeaf2] bg-[#f8fbfe] hover:bg-[#e9f6fd] transition-all flex items-center justify-between gap-3 group">
            <div className="flex items-center gap-3">
              <span className="text-2xl sm:text-3xl">🏡</span>
              <div>
                <div className="font-bold text-sm text-[#091b31] group-hover:text-[#2d6955]">
                  I am a Parent / Guardian
                </div>
                <div className="text-xs text-[#74777f]">
                  Supervise reading time & Google Family Link
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                disabled={loadingRole !== null}
                onClick={() => handleQuickLogin('parent')}
                className="py-1.5 px-3 rounded-xl bg-[#2d6955] hover:bg-[#1f4a3c] text-white text-xs font-bold cursor-pointer transition-colors disabled:opacity-50"
              >
                {loadingRole === 'parent' ? 'Loading...' : 'Google Parent'}
              </button>
              <button
                type="button"
                onClick={() => handleCustomSignIn('parent')}
                className="py-1.5 px-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#091b31] text-xs font-semibold cursor-pointer"
                title="Sign in with email"
              >
                Email →
              </button>
            </div>
          </div>

          {/* Option 3: Author */}
          <div className="p-3.5 rounded-2xl border border-[#ddeaf2] bg-[#f8fbfe] hover:bg-[#e9f6fd] transition-all flex items-center justify-between gap-3 group">
            <div className="flex items-center gap-3">
              <span className="text-2xl sm:text-3xl">✍️</span>
              <div>
                <div className="font-bold text-sm text-[#091b31] group-hover:text-[#2d6955]">
                  I am an Author / Educator
                </div>
                <div className="text-xs text-[#74777f]">
                  Publish manuscripts & host interactive workshops
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                disabled={loadingRole !== null}
                onClick={() => handleQuickLogin('author')}
                className="py-1.5 px-3 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold cursor-pointer transition-colors disabled:opacity-50"
              >
                {loadingRole === 'author' ? 'Loading...' : 'Author Desk'}
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#74777f]">
          <button
            type="button"
            onClick={() => {
              closeGate();
              router.push(`/register?redirect=${encodeURIComponent(gateState.targetUrl)}`);
            }}
            className="font-bold text-[#203047] hover:underline cursor-pointer"
          >
            New reader? Create Free Pen-Name →
          </button>
          <span className="flex items-center gap-1 text-emerald-700 font-semibold">
            <span className="material-symbols-outlined text-[14px]">verified</span>
            100% Ad-Free & COPPA Certified
          </span>
        </div>
      </div>
    </div>
  );
}

