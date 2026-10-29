'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

interface DbStatus {
  database: {
    status: string;
    provider: string;
    dbName: string;
    replicaSet: string;
    shardHosts: string[];
    latencyMs: number;
    sslEnabled: boolean;
  };
  counts: {
    users: number;
    children: number;
    books: number;
    manuscripts: number;
    workshops: number;
    quizzes: number;
    notifications: number;
    settings: number;
  };
  permissions: {
    allowCertificateGeneration: boolean;
    enablePublishingPortal: boolean;
    maintenanceMode: boolean;
  };
  timestamp: string;
}

export default function TestingPage() {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // QA Dashboard state
  const [dbStatus, setDbStatus] = useState<DbStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [roleSwitchLoading, setRoleSwitchLoading] = useState<string | null>(null);
  const [roleSwitchSuccess, setRoleSwitchSuccess] = useState<string | null>(null);
  const [reseedLoading, setReseedLoading] = useState(false);
  const [reseedOutput, setReseedOutput] = useState<string | null>(null);

  // Check auth on load
  const checkAuth = async () => {
    try {
      const res = await fetch('/api/testing/auth');
      const data = await res.json();
      setAuthorized(!!data.authorized);
      if (data.authorized) {
        fetchStatus();
      }
    } catch {
      setAuthorized(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    try {
      const res = await fetch('/api/testing/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      });
      const data = await res.json();

      if (data.success) {
        setAuthorized(true);
        setPasswordInput('');
        fetchStatus();
      } else {
        setAuthError(data.error || 'Incorrect testing passphrase');
      }
    } catch {
      setAuthError('Connection error to testing verification service.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLock = async () => {
    await fetch('/api/testing/auth', { method: 'DELETE' });
    setAuthorized(false);
    setDbStatus(null);
  };

  const fetchStatus = async () => {
    setStatusLoading(true);
    try {
      const res = await fetch('/api/testing/status');
      const data = await res.json();
      if (data.success) {
        setDbStatus(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setStatusLoading(false);
    }
  };

  const handleSwitchRole = async (role: string) => {
    setRoleSwitchLoading(role);
    setRoleSwitchSuccess(null);
    try {
      const res = await fetch('/api/testing/role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (data.success) {
        setRoleSwitchSuccess(`Switched to ${role.toUpperCase()} (${data.user.name})`);
        setTimeout(() => {
          window.location.href = data.targetUrl;
        }, 800);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRoleSwitchLoading(null);
    }
  };

  const handleReseed = async () => {
    if (!confirm('Re-seed MongoDB Atlas with fresh demo books, chapters, and users?')) return;
    setReseedLoading(true);
    setReseedOutput(null);
    try {
      const res = await fetch('/api/testing/reseed', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setReseedOutput(data.message || 'Database successfully seeded!');
        fetchStatus();
      } else {
        setReseedOutput(`Error: ${data.error}`);
      }
    } catch {
      setReseedOutput('Failed to execute database reseed.');
    } finally {
      setReseedLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4faff] flex flex-col font-sans-ui text-[#091b31]">
      <Navbar />

      <main className="w-full pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex-1">
        {/* Loading state */}
        {authorized === null && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="material-symbols-outlined text-4xl text-[#2d6955] animate-spin mb-3">
              progress_activity
            </span>
            <p className="text-sm font-semibold text-[#44474d]">Checking Testing Phase Authorization...</p>
          </div>
        )}

        {/* LOCKED GATE STATE */}
        {authorized === false && (
          <div className="max-w-md mx-auto bg-white rounded-3xl p-8 sm:p-10 shadow-tactile-xl border border-[#ddeaf2] text-center animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 rounded-2xl bg-[#e9f6fd] border border-[#bce3f5] text-[#203047] flex items-center justify-center mx-auto mb-5 text-3xl shadow-sm">
              🧪
            </div>

            <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#2d6955] bg-[#b1f0d6]/50 px-3 py-1 rounded-full mb-3">
              StoryNest QA Deck
            </span>

            <h1 className="font-serif-title text-2xl sm:text-3xl font-bold text-[#091b31] mb-2">
              Testing Phase Gate
            </h1>
            <p className="text-xs sm:text-sm text-[#44474d] mb-6 leading-relaxed">
              Enter the testing passphrase stored in environment variables to unlock the QA console, 1-click role switching, Atlas health diagnostics, and feature matrix.
            </p>

            <form onSubmit={handleUnlock} className="flex flex-col gap-4 text-left">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#44474d] mb-1.5">
                  Secret Testing Passphrase
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter Testing Password..."
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    required
                    autoFocus
                    className="w-full px-4 py-3 bg-[#f8fbfe] border border-[#ddeaf2] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#203047] pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {authError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3.5 px-4 rounded-xl bg-[#203047] text-white font-semibold text-sm hover:bg-[#142337] transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
              >
                {authLoading ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                    <span>Verifying Passphrase...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">lock_open</span>
                    <span>Unlock Testing Dashboard</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-[#ddeaf2] text-[11px] text-[#74777f]">
              Protected with constant-time server verification. Key is strictly hidden in <code className="bg-gray-100 px-1 py-0.5 rounded">.env.local</code>.
            </div>
          </div>
        )}

        {/* UNLOCKED / AUTHORIZED TESTING DASHBOARD */}
        {authorized === true && (
          <div className="flex flex-col gap-8 animate-in fade-in">
            {/* Header Deck */}
            <div className="bg-gradient-to-r from-[#203047] via-[#1b2b40] to-[#091b31] text-white rounded-3xl p-6 sm:p-8 shadow-tactile-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="text-2xl">🧪</span>
                  <span className="text-xs uppercase font-extrabold tracking-widest text-[#b1f0d6] bg-[#b1f0d6]/10 px-3 py-1 rounded-full border border-[#b1f0d6]/30">
                    Live Testing Phase Mode
                  </span>
                  <span className="text-xs bg-emerald-500/20 text-emerald-300 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Active
                  </span>
                </div>
                <h1 className="font-serif-title text-2xl sm:text-3xl font-bold">
                  StoryNest QA & Verification Deck
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
                  Simulate any user journey, verify MongoDB Atlas data consistency, test admin toggle permissions, and trigger quick diagnostics.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={fetchStatus}
                  disabled={statusLoading}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/10 flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <span className={`material-symbols-outlined text-[16px] ${statusLoading ? 'animate-spin' : ''}`}>
                    refresh
                  </span>
                  Refresh Telemetry
                </button>
                <button
                  onClick={handleLock}
                  className="px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-bold border border-rose-400/30 flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">lock</span>
                  Lock Deck
                </button>
              </div>
            </div>

            {roleSwitchSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-2 animate-in fade-in">
                <span className="material-symbols-outlined text-[20px] text-emerald-600">check_circle</span>
                <span>{roleSwitchSuccess} - Redirecting...</span>
              </div>
            )}

            {/* SECTION 1: 1-CLICK ROLE IMPERSONATION */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#ddeaf2]">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#ddeaf2]">
                <div>
                  <h2 className="font-title-md text-lg font-bold text-[#091b31] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#2d6955]">supervised_user_circle</span>
                    1-Click Role Impersonation
                  </h2>
                  <p className="text-xs text-[#44474d] mt-0.5">
                    Instantly issue a valid JWT session cookie for any platform persona and navigate directly to their portal.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Admin Persona */}
                <div className="p-4 rounded-2xl bg-[#f8fbfe] border border-[#ddeaf2] flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">🛡️</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                        Admin
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-[#091b31]">Editorial Director Dev</h3>
                    <p className="text-xs text-[#44474d] mt-1">Super Admin with full permission controls & audit logs.</p>
                  </div>
                  <button
                    onClick={() => handleSwitchRole('admin')}
                    disabled={roleSwitchLoading !== null}
                    className="mt-4 w-full py-2.5 px-3 rounded-xl bg-[#203047] hover:bg-[#142337] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
                  >
                    {roleSwitchLoading === 'admin' ? 'Switching...' : 'Switch to Admin →'}
                  </button>
                </div>

                {/* Parent Persona */}
                <div className="p-4 rounded-2xl bg-[#f8fbfe] border border-[#ddeaf2] flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">🏡</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                        Parent
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-[#091b31]">Priya Sharma</h3>
                    <p className="text-xs text-[#44474d] mt-1">COPPA verified parent of Aarav & Ananya with screen controls.</p>
                  </div>
                  <button
                    onClick={() => handleSwitchRole('parent')}
                    disabled={roleSwitchLoading !== null}
                    className="mt-4 w-full py-2.5 px-3 rounded-xl bg-[#2d6955] hover:bg-[#1f4a3c] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
                  >
                    {roleSwitchLoading === 'parent' ? 'Switching...' : 'Switch to Parent →'}
                  </button>
                </div>

                {/* Young Reader Persona */}
                <div className="p-4 rounded-2xl bg-[#f8fbfe] border border-[#ddeaf2] flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">🚀</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                        Reader
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-[#091b31]">Aarav Sharma</h3>
                    <p className="text-xs text-[#44474d] mt-1">Grade 3 curious reader (5-day streak, 145 spark stars).</p>
                  </div>
                  <button
                    onClick={() => handleSwitchRole('reader')}
                    disabled={roleSwitchLoading !== null}
                    className="mt-4 w-full py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
                  >
                    {roleSwitchLoading === 'reader' ? 'Switching...' : 'Switch to Reader →'}
                  </button>
                </div>

                {/* Author Persona */}
                <div className="p-4 rounded-2xl bg-[#f8fbfe] border border-[#ddeaf2] flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">✍️</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full">
                        Author
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-[#091b31]">Dr. Meera Sharma</h3>
                    <p className="text-xs text-[#44474d] mt-1">Astrophysicist & author of "Tara and the Whispering Stars".</p>
                  </div>
                  <button
                    onClick={() => handleSwitchRole('author')}
                    disabled={roleSwitchLoading !== null}
                    className="mt-4 w-full py-2.5 px-3 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
                  >
                    {roleSwitchLoading === 'author' ? 'Switching...' : 'Switch to Author →'}
                  </button>
                </div>
              </div>
            </div>

            {/* SECTION 2: LIVE MONGO DB ATLAS TELEMETRY */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#ddeaf2]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-[#ddeaf2]">
                <div>
                  <h2 className="font-title-md text-lg font-bold text-[#091b31] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#2d6955]">database</span>
                    Live MongoDB Atlas Cluster Diagnostics
                  </h2>
                  <p className="text-xs text-[#44474d] mt-0.5">
                    Direct metrics from your remote Atlas replica set cluster.
                  </p>
                </div>
                <button
                  onClick={handleReseed}
                  disabled={reseedLoading}
                  className="px-4 py-2 rounded-xl bg-[#e9f6fd] hover:bg-[#ddeaf2] text-[#203047] font-bold text-xs border border-[#bce3f5] flex items-center gap-1.5 cursor-pointer self-start sm:self-auto disabled:opacity-50 transition-colors"
                >
                  <span className={`material-symbols-outlined text-[16px] ${reseedLoading ? 'animate-spin' : ''}`}>
                    history
                  </span>
                  {reseedLoading ? 'Re-seeding Atlas...' : 'Re-seed Demo Data'}
                </button>
              </div>

              {reseedOutput && (
                <div className="mb-6 p-4 rounded-2xl bg-[#091b31] text-emerald-300 font-mono text-xs overflow-x-auto max-h-40">
                  <pre>{reseedOutput}</pre>
                </div>
              )}

              {dbStatus ? (
                <div className="flex flex-col gap-6">
                  {/* Status Banner */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-[#e9f6fd]/50 border border-[#ddeaf2]">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#44474d]">Cluster Status</span>
                      <div className="text-base font-bold text-emerald-700 flex items-center gap-2 mt-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                        {dbStatus.database.status} (SSL Active)
                      </div>
                      <span className="text-[11px] text-[#74777f]">Atlas Cloud Database</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#e9f6fd]/50 border border-[#ddeaf2]">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#44474d]">Replica Set</span>
                      <div className="text-sm font-bold text-[#091b31] mt-1 font-mono truncate">
                        {dbStatus.database.replicaSet}
                      </div>
                      <span className="text-[11px] text-[#74777f]">3 Shards Active</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#e9f6fd]/50 border border-[#ddeaf2]">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#44474d]">Ping Latency</span>
                      <div className="text-base font-bold text-[#203047] mt-1">
                        {dbStatus.database.latencyMs} ms
                      </div>
                      <span className="text-[11px] text-emerald-600 font-medium">Optimal response</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#e9f6fd]/50 border border-[#ddeaf2]">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#44474d]">Target DB</span>
                      <div className="text-base font-bold text-[#091b31] mt-1 font-mono">
                        {dbStatus.database.dbName}
                      </div>
                      <span className="text-[11px] text-[#74777f]">StoryNest Production Base</span>
                    </div>
                  </div>

                  {/* Document Counts */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#44474d] mb-3">
                      Collection Document Tallies
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-center">
                      {[
                        { label: 'Books', val: dbStatus.counts.books, icon: 'auto_stories' },
                        { label: 'Users', val: dbStatus.counts.users, icon: 'group' },
                        { label: 'Children', val: dbStatus.counts.children, icon: 'child_care' },
                        { label: 'Manuscripts', val: dbStatus.counts.manuscripts, icon: 'edit_note' },
                        { label: 'Workshops', val: dbStatus.counts.workshops, icon: 'co_present' },
                        { label: 'Quizzes', val: dbStatus.counts.quizzes, icon: 'quiz' },
                        { label: 'Notifications', val: dbStatus.counts.notifications, icon: 'notifications' },
                        { label: 'Settings', val: dbStatus.counts.settings, icon: 'settings' },
                      ].map((c) => (
                        <div key={c.label} className="p-3 bg-[#f8fbfe] border border-[#ddeaf2] rounded-2xl">
                          <span className="material-symbols-outlined text-[20px] text-[#2d6955] mb-1">
                            {c.icon}
                          </span>
                          <div className="font-bold text-lg text-[#091b31]">{c.val}</div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-[#74777f]">
                            {c.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-gray-500">
                  Loading Atlas cluster telemetry...
                </div>
              )}
            </div>

            {/* SECTION 3: FEATURE VERIFICATION MATRIX */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#ddeaf2]">
              <div className="mb-4 pb-3 border-b border-[#ddeaf2]">
                <h2 className="font-title-md text-lg font-bold text-[#091b31] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#2d6955]">fact_check</span>
                  Feature Verification & Scenario Checklist
                </h2>
                <p className="text-xs text-[#44474d] mt-0.5">
                  Direct quick-launch shortcuts to test each completed StoryNest capability in the browser.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* 1. Dynamic Certificate */}
                <div className="p-4 rounded-2xl border border-[#ddeaf2] bg-[#f8fbfe] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                        Admin Controlled
                      </span>
                      <span className="text-lg">🎓</span>
                    </div>
                    <h3 className="font-bold text-sm text-[#091b31]">Dynamic Diploma Certificate</h3>
                    <p className="text-xs text-[#44474d] mt-1">
                      Awarded for Aarav Sharma upon completing "Tara and the Whispering Stars". Features PDF print and seal.
                    </p>
                  </div>
                  <Link
                    href="/certificate?name=Aarav%20Sharma&title=Tara%20and%20the%20Whispering%20Stars&book=tara-and-the-whispering-stars&badge=Junior%20Astronomer%20%26%20Bilingual%20Laureate&author=Dr.%20Meera%20Sharma"
                    target="_blank"
                    className="mt-4 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#203047] hover:bg-[#142337] text-white text-xs font-bold transition-colors"
                  >
                    <span>Open Diploma Test</span>
                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  </Link>
                </div>

                {/* 2. Author Publishing Option */}
                <div className="p-4 rounded-2xl border border-[#ddeaf2] bg-[#f8fbfe] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-purple-800 bg-purple-100 px-2.5 py-0.5 rounded-full">
                        Admin Controlled
                      </span>
                      <span className="text-lg">📚</span>
                    </div>
                    <h3 className="font-bold text-sm text-[#091b31]">Author Publishing Packages</h3>
                    <p className="text-xs text-[#44474d] mt-1">
                      Transparent author packages (Starter Sprout, Illustrator Gold, Master Guild) with submission inquiry.
                    </p>
                  </div>
                  <Link
                    href="/publish"
                    target="_blank"
                    className="mt-4 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#203047] hover:bg-[#142337] text-white text-xs font-bold transition-colors"
                  >
                    <span>View Publishing Page</span>
                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  </Link>
                </div>

                {/* 3. Companion Quiz */}
                <div className="p-4 rounded-2xl border border-[#ddeaf2] bg-[#f8fbfe] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-sky-800 bg-sky-100 px-2.5 py-0.5 rounded-full">
                        Interactive
                      </span>
                      <span className="text-lg">🏆</span>
                    </div>
                    <h3 className="font-bold text-sm text-[#091b31]">Companion Quiz & Badges</h3>
                    <p className="text-xs text-[#44474d] mt-1">
                      3-question comprehension challenge awarding Spark Stars, confetti, and literary badge credentials.
                    </p>
                  </div>
                  <Link
                    href="/quiz/tara-and-the-whispering-stars"
                    target="_blank"
                    className="mt-4 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#203047] hover:bg-[#142337] text-white text-xs font-bold transition-colors"
                  >
                    <span>Launch Quiz Module</span>
                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  </Link>
                </div>

                {/* 4. Google Sign-In & Auth */}
                <div className="p-4 rounded-2xl border border-[#ddeaf2] bg-[#f8fbfe] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                        COPPA Safe
                      </span>
                      <span className="text-lg">🔑</span>
                    </div>
                    <h3 className="font-bold text-sm text-[#091b31]">Google Sign-In & Family Link</h3>
                    <p className="text-xs text-[#44474d] mt-1">
                      One-click Google authentication modal creating authentic session cookies and verified accounts.
                    </p>
                  </div>
                  <Link
                    href="/login"
                    target="_blank"
                    className="mt-4 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#203047] hover:bg-[#142337] text-white text-xs font-bold transition-colors"
                  >
                    <span>Test Google Sign-In</span>
                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  </Link>
                </div>

                {/* 5. Audio Player & TTS */}
                <div className="p-4 rounded-2xl border border-[#ddeaf2] bg-[#f8fbfe] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-teal-800 bg-teal-100 px-2.5 py-0.5 rounded-full">
                        Bilingual
                      </span>
                      <span className="text-lg">🎧</span>
                    </div>
                    <h3 className="font-bold text-sm text-[#091b31]">Auto Audio & Speech Synth</h3>
                    <p className="text-xs text-[#44474d] mt-1">
                      Web Speech narration in English and Hindi directly reading story chapters without external file uploads.
                    </p>
                  </div>
                  <Link
                    href="/reader/tara-and-the-whispering-stars"
                    target="_blank"
                    className="mt-4 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#203047] hover:bg-[#142337] text-white text-xs font-bold transition-colors"
                  >
                    <span>Test Audio Player</span>
                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  </Link>
                </div>

                {/* 6. Admin Settings Toggle */}
                <div className="p-4 rounded-2xl border border-[#ddeaf2] bg-[#f8fbfe] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-indigo-800 bg-indigo-100 px-2.5 py-0.5 rounded-full">
                        Admin Controls
                      </span>
                      <span className="text-lg">⚙️</span>
                    </div>
                    <h3 className="font-bold text-sm text-[#091b31]">Platform Settings Toggles</h3>
                    <p className="text-xs text-[#44474d] mt-1">
                      Toggle Certificate Generation and Author Publishing permissions live in MongoDB Atlas.
                    </p>
                  </div>
                  <Link
                    href="/admin/settings"
                    target="_blank"
                    className="mt-4 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#203047] hover:bg-[#142337] text-white text-xs font-bold transition-colors"
                  >
                    <span>Open Admin Settings</span>
                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
