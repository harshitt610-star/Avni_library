'use client';

import React, { useState } from 'react';

interface AdminAuthCardProps {
  onLogin: (email: string, secret: string) => Promise<void>;
  loading: boolean;
  error?: string;
}

export default function AdminAuthCard({
  onLogin,
  loading,
  error,
}: AdminAuthCardProps) {
  const [email, setEmail] = useState('admin@storynest.com');
  const [password, setPassword] = useState('admin123');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#ddeaf2] flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🛡️</span>
            <div>
              <h2 className="font-serif-title text-xl font-bold text-[#091b31]">
                Admin Operations
              </h2>
              <p className="text-xs text-[#44474d]">
                Editorial Director & Platform Operations Command Center.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-purple-800 bg-purple-100 px-3 py-1 rounded-full shrink-0">
            Super Admin
          </span>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">gpp_maybe</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#44474d] mb-1.5">
              Admin Email
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@storynest.com"
                className="w-full px-4 py-3 bg-[#f8fbfe] border border-[#ddeaf2] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#203047] pl-10"
              />
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
                admin_panel_settings
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#44474d] mb-1.5">
              Operations Passphrase
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter admin passphrase..."
                className="w-full px-4 py-3 bg-[#f8fbfe] border border-[#ddeaf2] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#203047] pl-10"
              />
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
                password
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-[#203047] hover:bg-[#142337] text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                <span>Authenticating Admin...</span>
              </>
            ) : (
              <>
                <span>Access Command Center</span>
                <span className="material-symbols-outlined text-[18px]">verified_user</span>
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
            setEmail('admin@storynest.com');
            setPassword('admin123');
          }}
          className="text-purple-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>🔑</span> 1-Click Director Dev Credentials
        </button>

        <span className="text-[11px] text-[#74777f]">
          Protected with JWT RBAC & Audit Trails
        </span>
      </div>
    </div>
  );
}

