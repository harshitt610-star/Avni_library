'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';

interface ChildProfileItem {
  _id?: string;
  displayName: string;
  ageBracket: string;
  avatarEmoji: string;
  readingStreak?: number;
  starsEarned?: number;
  dailyTimeLimitMinutes?: number;
  minutesReadToday?: number;
  bedtimeCurfew?: string;
  curfewEnabled?: boolean;
  contentFilter?: 'strict' | 'standard' | 'guided';
}

export default function ParentDashboardPage() {
  const { user } = useAuth();
  const [children, setChildren] = useState<ChildProfileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChildIndex, setSelectedChildIndex] = useState(0);

  // New Child Profile Form
  const [showAddModal, setShowAddModal] = useState(false);
  const [childForm, setChildForm] = useState({
    displayName: '',
    ageBracket: '6-8',
    avatarEmoji: '🚀',
    dailyTimeLimitMinutes: '45',
  });
  const [savingChild, setSavingChild] = useState(false);

  // Screen time & privacy toggles
  const [timeLimit, setTimeLimit] = useState(45);
  const [bedtimeCurfew, setBedtimeCurfew] = useState('20:30');
  const [curfewEnabled, setCurfewEnabled] = useState(true);
  const [contentFilter, setContentFilter] = useState<'strict' | 'standard' | 'guided'>('standard');
  const [savedSettingsAlert, setSavedSettingsAlert] = useState(false);
  const [curfewInlineNotice, setCurfewInlineNotice] = useState<string>('');
  const [childStories, setChildStories] = useState<any[]>([]);

  const fetchChildStories = async () => {
    try {
      const res = await fetch('/api/reader/stories');
      const data = await res.json();
      if (data.stories) setChildStories(data.stories);
    } catch (e) {
      console.error(e);
    }
  };

  const handleGuardianApprove = async (storyId: string) => {
    try {
      const res = await fetch('/api/reader/stories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyId, action: 'guardian_approve' }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Story approved! It has been forwarded to the StoryNest editorial queue.');
        fetchChildStories();
      }
    } catch {
      alert('Error updating approval');
    }
  };

  const handleGuardianRequestChanges = async (storyId: string) => {
    const note = prompt('Please enter friendly suggestions for your child before submitting:');
    if (!note) return;
    try {
      const res = await fetch('/api/reader/stories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyId, action: 'guardian_request_changes', feedback: note }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Suggestions saved.');
        fetchChildStories();
      }
    } catch {
      alert('Error updating approval');
    }
  };

  const fetchChildren = async () => {
    try {
      const res = await fetch('/api/parent/children');
      const data = await res.json();
      if (data.children) setChildren(data.children);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    fetch('/api/parent/children')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          if (data.children) setChildren(data.children);
          setLoading(false);
        }
      })
      .catch((e) => {
        console.error(e);
        if (isMounted) setLoading(false);
      });

    fetchChildStories();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingChild(true);
    try {
      const res = await fetch('/api/parent/children', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(childForm),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setChildForm({
          displayName: '',
          ageBracket: '6-8',
          avatarEmoji: '🚀',
          dailyTimeLimitMinutes: '45',
        });
        fetchChildren();
      } else {
        alert(data.error || 'Failed to add profile');
      }
    } catch {
      alert('Error creating child profile');
    } finally {
      setSavingChild(false);
    }
  };

  useEffect(() => {
    if (children[selectedChildIndex]) {
      const current = children[selectedChildIndex];
      setTimeLimit(current.dailyTimeLimitMinutes || 45);
      setBedtimeCurfew(current.bedtimeCurfew || '20:30');
      setCurfewEnabled(current.curfewEnabled !== false);
      if (current.contentFilter) {
        setContentFilter(current.contentFilter);
      }
    }
  }, [children, selectedChildIndex]);

  // Instant Auto-Save on click + manual save support
  const updateAndPersistControls = async (updates: {
    curfew?: string;
    enabled?: boolean;
    limit?: number;
    filter?: 'strict' | 'standard' | 'guided';
  }) => {
    const current = children[selectedChildIndex];
    if (!current?._id) return;

    const newCurfew = updates.curfew !== undefined ? updates.curfew : bedtimeCurfew;
    const newEnabled = updates.enabled !== undefined ? updates.enabled : curfewEnabled;
    const newLimit = updates.limit !== undefined ? updates.limit : timeLimit;
    const newFilter = updates.filter !== undefined ? updates.filter : contentFilter;

    if (updates.curfew !== undefined) setBedtimeCurfew(newCurfew);
    if (updates.enabled !== undefined) setCurfewEnabled(newEnabled);
    if (updates.limit !== undefined) setTimeLimit(newLimit);
    if (updates.filter !== undefined) setContentFilter(newFilter);

    try {
      const res = await fetch('/api/parent/controls', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childId: current._id,
          dailyTimeLimitMinutes: newLimit,
          bedtimeCurfew: newEnabled ? newCurfew : 'off',
          curfewEnabled: newEnabled,
          contentFilter: newFilter,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCurfewInlineNotice(
          `✓ Saved: Curfew ${newEnabled ? newCurfew : 'Paused'} & ${newLimit}m limit active!`
        );
        setTimeout(() => setCurfewInlineNotice(''), 3500);
        fetchChildren();
      }
    } catch {
      // silent or keep previous
    }
  };

  const handleSaveControls = async () => {
    const current = children[selectedChildIndex];
    if (!current?._id) return;
    try {
      const res = await fetch('/api/parent/controls', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childId: current._id,
          dailyTimeLimitMinutes: timeLimit,
          bedtimeCurfew: curfewEnabled ? bedtimeCurfew : 'off',
          curfewEnabled,
          contentFilter,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSavedSettingsAlert(true);
        setTimeout(() => setSavedSettingsAlert(false), 3500);
        fetchChildren();
      } else {
        alert(data.error || 'Failed to save controls');
      }
    } catch {
      alert('Error updating parental controls');
    }
  };

  const activeChild = children[selectedChildIndex] || {
    displayName: 'Aarav (Grade 3)',
    avatarEmoji: '🚀',
    readingStreak: 5,
    starsEarned: 145,
    minutesReadToday: 22,
    dailyTimeLimitMinutes: 45,
  };

  return (
    <div className="flex flex-col min-h-screen" suppressHydrationWarning>
      <Navbar />

      <main className="flex-1 pt-24 pb-16 bg-[#f4faff]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Guardian Banner */}
          <div className="bg-[#2d6955] text-white rounded-3xl p-6 sm:p-10 mb-8 shadow-tactile-lg flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-white/10 text-3xl flex items-center justify-center border border-white/20">
                🛡️
              </div>
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-[#b1f0d6]">
                  Family Safety &amp; Reading Insights
                </span>
                <h1 className="font-serif-story text-2xl sm:text-3xl font-bold mt-0.5">
                  Parent &amp; Guardian Sanctuary
                </h1>
                <p className="text-xs text-gray-200 mt-1">
                  COPPA-Compliant Family Hub: Screen limits, bilingual vocabulary growth, and authorized child accounts.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-3 rounded-xl bg-white text-[#2d6955] text-xs font-bold hover:bg-gray-100 shadow-sm shrink-0 transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              <span>Add Child Profile</span>
            </button>
          </div>

          {savedSettingsAlert && (
            <div className="mb-6 p-4 rounded-2xl bg-[#b1f0d6] text-[#002117] text-xs font-bold flex items-center gap-2 shadow-tactile-sm">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span>Parental safety controls and screen limits updated successfully!</span>
            </div>
          )}

          {/* Child Profile Selector Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold text-[#44474d] mr-2">Select Child:</span>
              {children.map((ch, idx) => (
                <button
                  key={ch._id || idx}
                  onClick={() => setSelectedChildIndex(idx)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    selectedChildIndex === idx
                      ? 'bg-[#203047] text-white shadow-tactile-sm'
                      : 'bg-white text-[#091b31] border border-[#ddeaf2] hover:bg-[#e9f6fd]'
                  }`}
                >
                  <span>{ch.avatarEmoji || '🌟'}</span>
                  <span>{ch.displayName}</span>
                </button>
              ))}
            </div>

            <Link
              href="/reader"
              className="px-4 py-2.5 rounded-2xl text-xs font-bold bg-[#2d6955] hover:bg-[#204e3f] text-white shadow-tactile-sm transition-all flex items-center gap-2"
              title={`Open Young Reader Desk for ${activeChild.displayName}`}
            >
              <span>🚀</span>
              <span>Launch Reader Mode for {activeChild.displayName.split(' ')[0]}</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 8 Columns: Reading Insights & Activity Metrics */}
            <div className="lg:col-span-8 flex flex-col gap-8">
              {/* Reading Time Metrics Card */}
              <div className="bg-white rounded-3xl border border-[#ddeaf2] p-6 sm:p-8 shadow-tactile-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#ddeaf2] gap-4">
                  <div>
                    <h3 className="font-serif-story text-xl font-bold text-[#091b31]">
                      Reading Activity for {activeChild.displayName}
                    </h3>
                    <p className="text-xs text-[#75777e] mt-0.5">
                      Weekly overview of pages turned, reading comprehension, and audio previews.
                    </p>
                  </div>
                  <div className="flex items-center gap-4 bg-[#f4faff] px-4 py-2 rounded-2xl border border-[#ddeaf2]">
                    <div className="text-center">
                      <span className="font-bold text-sm text-[#2d6955]">
                        {activeChild.minutesReadToday || 22}m
                      </span>
                      <span className="text-[10px] text-gray-500 block">Today</span>
                    </div>
                    <span className="h-6 w-px bg-gray-200 inline-block"></span>
                    <div className="text-center">
                      <span className="font-bold text-sm text-[#091b31]">
                        {activeChild.readingStreak || 5} Days
                      </span>
                      <span className="text-[10px] text-gray-500 block">Streak</span>
                    </div>
                    <span className="h-6 w-px bg-gray-200 inline-block"></span>
                    <div className="text-center">
                      <span className="font-bold text-sm text-[#f4be55]">
                        {activeChild.starsEarned || 145}
                      </span>
                      <span className="text-[10px] text-gray-500 block">Stars</span>
                    </div>
                  </div>
                </div>

                {/* Day-by-Day Reading Bar Chart Mockup */}
                <div className="pt-6">
                  <h4 className="text-xs font-bold text-[#44474d] mb-4">Minutes Read This Week:</h4>
                  <div className="grid grid-cols-7 gap-2 sm:gap-4 text-center">
                    {[
                      { day: 'Mon', mins: 35, pct: 75 },
                      { day: 'Tue', mins: 40, pct: 88 },
                      { day: 'Wed', mins: 25, pct: 55 },
                      { day: 'Thu', mins: 45, pct: 100 },
                      { day: 'Fri', mins: 30, pct: 66 },
                      { day: 'Sat', mins: 50, pct: 100 },
                      { day: 'Sun', mins: 22, pct: 48 },
                    ].map((d) => (
                      <div key={d.day} className="flex flex-col items-center gap-2">
                        <div className="w-full bg-[#e9f6fd] h-28 rounded-xl flex items-end p-1">
                          <div
                            className="w-full bg-[#2d6955] rounded-lg transition-all"
                            style={{ height: `${d.pct}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-bold text-[#091b31]">{d.day}</span>
                        <span className="text-[10px] text-[#75777e]">{d.mins}m</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bilingual Vocabulary Growth Card */}
              <div className="bg-white rounded-3xl border border-[#ddeaf2] p-6 sm:p-8 shadow-tactile-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-serif-story text-xl font-bold text-[#091b31]">
                      Bilingual Vocabulary Acquisition
                    </h3>
                    <p className="text-xs text-[#75777e] mt-0.5">
                      Words encountered in Hindi and English dual reading modes.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#b1f0d6] text-[#002117] text-xs font-bold">
                    +85 Words Learned
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {[
                    { en: 'Constellation', hi: 'तारामंडल (Taara-mandal)' },
                    { en: 'Telescope', hi: 'दूरबीन (Door-been)' },
                    { en: 'Seven Sages', hi: 'सप्तर्षि (Saptarshi)' },
                    { en: 'Monsoon', hi: 'मानसून (Barsaat)' },
                    { en: 'Whisper', hi: 'फुसफुसाहट (Phus-phusaahat)' },
                    { en: 'Banyan Tree', hi: 'बरगद (Bargad)' },
                    { en: 'Courage', hi: 'साहस (Saahas)' },
                    { en: 'Horizon', hi: 'क्षितिज (Kshitij)' },
                  ].map((w, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-[#f4faff] border border-[#ddeaf2] text-xs">
                      <p className="font-bold text-[#091b31]">{w.en}</p>
                      <p className="text-[#2d6955] text-[11px] font-medium mt-0.5">{w.hi}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Child Story Submissions & Guardian Approval Section (Section 3 Requirement) */}
              <div id="child-stories" className="bg-white rounded-3xl border border-[#ddeaf2] p-6 sm:p-8 shadow-tactile-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-serif-story text-xl font-bold text-[#091b31] flex items-center gap-2">
                      <span>✍️</span>
                      <span>Child Creative Stories &amp; Guardian Approval</span>
                    </h3>
                    <p className="text-xs text-[#75777e] mt-0.5">
                      COPPA Parental Consent: Review your children&apos;s story drafts and approve them before they go to StoryNest editors.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#e9f6fd] text-[#203047] text-xs font-bold">
                    {childStories.length} Stored
                  </span>
                </div>

                {childStories.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-[#f8fbfe] border border-[#ddeaf2] text-center text-xs text-gray-500">
                    No story submissions from your children yet. Encourage them to write in their Young Reader Studio!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {childStories.map((st: any) => (
                      <div
                        key={st._id}
                        className="p-4 rounded-2xl border border-[#ddeaf2] bg-[#f8fbfe] flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="flex items-start gap-3">
                          <img
                            src={st.coverUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=200&q=80'}
                            alt={st.title}
                            className="w-12 h-16 object-cover rounded-xl shadow-2xs shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-serif-story font-bold text-sm text-[#091b31]">
                                {st.title}
                              </h4>
                              <span className="text-[10px] text-[#2d6955] font-bold bg-[#b1f0d6] px-2 py-0.5 rounded-full">
                                By {st.authorName}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-1">{st.synopsis || 'Story draft written in Sanctuary.'}</p>
                            <span className="text-[11px] text-gray-400 mt-1 block">
                              Status: <strong>{st.status.replace(/_/g, ' ')}</strong>
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {st.status === 'AWAITING_GUARDIAN_APPROVAL' ? (
                            <>
                              <button
                                onClick={() => handleGuardianApprove(st._id)}
                                className="px-3 py-1.5 rounded-xl bg-[#2d6955] hover:bg-[#204e3f] text-white text-xs font-bold shadow-xs cursor-pointer"
                              >
                                ✅ Approve for Editors
                              </button>
                              <button
                                onClick={() => handleGuardianRequestChanges(st._id)}
                                className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold cursor-pointer"
                              >
                                💡 Suggest Edits
                              </button>
                            </>
                          ) : (
                            <span className="px-3 py-1.5 rounded-xl bg-white border border-[#ddeaf2] text-xs font-bold text-[#091b31]">
                              {st.guardianConsentStatus === 'APPROVED' ? 'Consent Granted ✓' : 'In Progress'}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right 4 Columns: Safety & Screen Limit Controls */}
            <div className="lg:col-span-4 flex flex-col gap-6">
                {/* Screen Time Limit Card */}
              <div className="bg-white rounded-3xl border border-[#ddeaf2] p-6 shadow-tactile-sm flex flex-col gap-5">
                <div>
                  <h3 className="font-serif-story text-base font-bold text-[#091b31] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#2d6955] text-[20px]">timer</span>
                    Daily Reading Time Limit
                  </h3>
                  <p className="text-xs text-[#44474d] leading-relaxed mt-1">
                    Controls how long {activeChild.displayName} can read before receiving a gentle break reminder.
                  </p>

                  <div className="flex gap-2 mt-3">
                    {[30, 45, 60, 90].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => updateAndPersistControls({ limit: mins })}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          timeLimit === mins
                            ? 'bg-[#203047] text-white shadow-xs'
                            : 'bg-[#e9f6fd] text-[#44474d] hover:bg-[#ddeaf2]'
                        }`}
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bedtime Curfew & Sleep Schedule Card (Interactive & Clickable) */}
                <div className="pt-4 border-t border-[#ddeaf2]">
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="font-serif-story text-sm font-bold text-[#091b31] flex items-center gap-1.5">
                      <span>🌙</span>
                      <span>Bedtime Curfew Guard</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        const next = !curfewEnabled;
                        updateAndPersistControls({ enabled: next });
                      }}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                        curfewEnabled
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-gray-100 text-gray-500 border-gray-200'
                      }`}
                    >
                      {curfewEnabled ? 'Active ✓' : 'Paused (Off)'}
                    </button>
                  </div>

                  {curfewInlineNotice && (
                    <div className="mb-2.5 py-1 px-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-[11px] font-bold flex items-center gap-1.5 animate-fadeIn">
                      <span>✨</span>
                      <span>{curfewInlineNotice}</span>
                    </div>
                  )}

                  <p className="text-xs text-[#44474d] leading-relaxed mb-3">
                    Pauses reader screens at bedtime to protect healthy sleep schedules.
                  </p>

                  {/* Preset Bedtime Buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: '8:00 PM', val: '20:00' },
                      { label: '8:30 PM', val: '20:30' },
                      { label: '9:00 PM', val: '21:00' },
                      { label: '9:30 PM', val: '21:30' },
                      { label: '10:00 PM', val: '22:00' },
                      { label: '10:30 PM', val: '22:30' },
                    ].map((p) => {
                      const isSelected = curfewEnabled && bedtimeCurfew === p.val;
                      return (
                        <button
                          key={p.val}
                          type="button"
                          onClick={() => {
                            updateAndPersistControls({ curfew: p.val, enabled: true });
                          }}
                          className={`py-2 px-1 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                            isSelected
                              ? 'bg-[#203047] text-white border-[#203047] shadow-xs'
                              : 'bg-[#f8fbfe] text-[#44474d] border-[#ddeaf2] hover:bg-[#e9f6fd] hover:text-[#091b31]'
                          }`}
                        >
                          {p.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Curfew Time Input */}
                  <div className="mt-3 flex items-center justify-between bg-[#f8fbfe] p-2.5 rounded-xl border border-[#ddeaf2]">
                    <span className="text-xs text-[#44474d] font-medium">Custom Bedtime Hour:</span>
                    <input
                      type="time"
                      value={bedtimeCurfew}
                      onChange={(e) => {
                        updateAndPersistControls({ curfew: e.target.value, enabled: true });
                      }}
                      className="px-2 py-1 bg-white border border-[#ddeaf2] rounded-lg text-xs font-bold text-[#091b31] focus:outline-none focus:ring-1 focus:ring-[#203047]"
                    />
                  </div>
                </div>

                {/* Content Safety Filter */}
                <div className="pt-4 border-t border-[#ddeaf2]">
                  <h4 className="text-xs font-bold text-[#091b31] mb-2 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-[#2d6955]">shield</span>
                    <span>Content Rating Filter</span>
                  </h4>
                  <div className="space-y-2">
                    {[
                      { id: 'standard', title: 'Standard Safe (Ages 3-12)', desc: 'Full curated catalogue with age filters' },
                      { id: 'strict', title: 'Early Reader Only (Ages 3-6)', desc: 'Strictly picture books and lullabies' },
                      { id: 'guided', title: 'Guided Classroom Mode', desc: 'Curated only by registered educator' },
                    ].map((mode) => (
                      <label
                        key={mode.id}
                        className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer text-xs transition-all ${
                          contentFilter === mode.id
                            ? 'bg-[#e9f6fd] border-[#203047]'
                            : 'border-[#ddeaf2] hover:bg-[#f8fbfe]'
                        }`}
                      >
                        <input
                          type="radio"
                          name="contentFilter"
                          value={mode.id}
                          checked={contentFilter === mode.id}
                          onChange={() => setContentFilter(mode.id as any)}
                          className="mt-0.5 text-[#203047]"
                        />
                        <div>
                          <p className="font-bold text-[#091b31]">{mode.title}</p>
                          <p className="text-[11px] text-gray-500">{mode.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSaveControls}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-[#2d6955] hover:bg-[#204e3f] text-white text-xs font-bold shadow-tactile-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  <span>Save Safety Controls &amp; Curfew</span>
                </button>
              </div>

              {/* COPPA Privacy Certification */}
              <div className="bg-[#e9f6fd] rounded-3xl border border-[#ddeaf2] p-5 flex flex-col gap-3 text-xs text-[#091b31]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#2d6955] text-[22px]">verified</span>
                  <span className="font-bold text-sm">COPPA Compliance Guard</span>
                </div>
                <p className="text-[11px] text-[#44474d] leading-relaxed">
                  StoryNest strictly adheres to the Children’s Online Privacy Protection Act. We collect zero
                  behavioral ad trackers, personal geolocation data, or social public profiles for children under 13.
                </p>
                <Link href="/safety" className="text-xs font-bold text-[#203047] hover:underline">
                  Read Full Child Safety Policy →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Add Child Profile Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-tactile-xl border border-[#ddeaf2] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-[#ddeaf2]">
              <h3 className="font-serif-story text-lg font-bold text-[#091b31]">
                Add Child Profile
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddChild} className="mt-4 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-[#44474d] mb-1">
                  Child's Display Name / Nickname
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ananya"
                  value={childForm.displayName}
                  onChange={(e) => setChildForm({ ...childForm, displayName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#f4faff] border border-[#ddeaf2] rounded-xl text-xs focus:ring-2 focus:ring-[#203047]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#44474d] mb-1">
                  Age Bracket
                </label>
                <select
                  value={childForm.ageBracket}
                  onChange={(e) => setChildForm({ ...childForm, ageBracket: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#f4faff] border border-[#ddeaf2] rounded-xl text-xs focus:ring-2 focus:ring-[#203047]"
                >
                  <option value="3-5">Ages 3-5 (Early Picture Books)</option>
                  <option value="6-8">Ages 6-8 (Early Chapter Books)</option>
                  <option value="9-12">Ages 9-12 (Middle Grade Adventures)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#44474d] mb-1">
                  Choose Avatar Emoji
                </label>
                <div className="flex gap-3">
                  {['🚀', '🦄', '🦁', '🌟', '🎨', '📚'].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setChildForm({ ...childForm, avatarEmoji: emoji })}
                      className={`w-10 h-10 rounded-xl text-lg flex items-center justify-center border transition-all ${
                        childForm.avatarEmoji === emoji
                          ? 'border-[#203047] bg-[#e9f6fd] ring-2 ring-[#203047]'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={savingChild}
                  className="flex-1 py-3 rounded-xl bg-[#203047] text-white text-xs font-bold hover:bg-[#091b31] shadow-tactile-sm"
                >
                  {savingChild ? 'Creating Profile...' : 'Save Child Profile'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-3 rounded-xl bg-gray-100 text-gray-700 text-xs font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
