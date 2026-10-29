'use client';

import React, { useState } from 'react';

const funAdjectives = ['Curious', 'Brave', 'Cosmic', 'Starlight', 'Velvet', 'Nimble', 'Solar', 'Clever', 'Wonder'];
const funAnimals = ['Otter', 'Falcon', 'Koala', 'Fox', 'Dolphin', 'Dragon', 'Phoenix', 'Sparrow', 'Badger'];

interface ChildRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string, penName: string, role: string) => void;
}

export default function ChildRegisterModal({
  isOpen,
  onClose,
  onSuccess,
}: ChildRegisterModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [penName, setPenName] = useState('CuriousOtter24');
  const [birthYear, setBirthYear] = useState('2016');
  const [guardianEmail, setGuardianEmail] = useState('parent.guard@familymail.org');
  const [school, setSchool] = useState('');
  const [secret, setSecret] = useState('StoryMagic2025!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleGenerateRandom = () => {
    const adj = funAdjectives[Math.floor(Math.random() * funAdjectives.length)];
    const animal = funAnimals[Math.floor(Math.random() * funAnimals.length)];
    const num = Math.floor(Math.random() * 90) + 10;
    setPenName(`${adj}${animal}${num}`);
  };

  const calculateAgeBracket = (yearStr: string) => {
    const year = parseInt(yearStr, 10) || 2016;
    const age = 2025 - year;
    if (age <= 8) return { key: '6-8', label: 'Early Reader (Ages 6-8)' };
    if (age <= 12) return { key: '9-12', label: 'Middle Grade (Ages 9-12)' };
    return { key: '13+', label: 'Young Adult (Ages 13+)' };
  };

  const currentTier = calculateAgeBracket(birthYear);

  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          role: 'reader',
          name: penName,
          email: guardianEmail,
          password: secret,
          ageBracket: currentTier.key,
          schoolName: school,
          isCoppaConsent: true,
        }),
      });

      const data = await res.json();
      if (data.success) {
        onSuccess(guardianEmail, penName, 'reader');
      } else {
        setError(data.error || 'Failed to complete registration');
      }
    } catch {
      setError('Connection error during registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#ddeaf2] p-6 sm:p-8 animate-in fade-in zoom-in-95 relative text-left">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center cursor-pointer transition-colors"
          aria-label="Close dialog"
        >
          ✕
        </button>

        {/* Stepper Progress */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🌱</span>
            <span className="font-bold text-xs uppercase tracking-wider text-[#2d6955] bg-[#b1f0d6]/50 px-2.5 py-0.5 rounded-full">
              New Reader Gateway
            </span>
          </div>
          <h3 className="font-serif-title text-xl sm:text-2xl font-bold text-[#091b31]">
            Create Young Reader Pen-Name
          </h3>
          <p className="text-xs text-[#44474d] mt-1">
            Child-safe profile creation with full guardian privacy consent.
          </p>

          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className={`h-1.5 rounded-full ${step >= 1 ? 'bg-[#203047]' : 'bg-gray-200'}`}></div>
            <div className={`h-1.5 rounded-full ${step >= 2 ? 'bg-[#203047]' : 'bg-gray-200'}`}></div>
            <div className={`h-1.5 rounded-full ${step >= 3 ? 'bg-[#203047]' : 'bg-gray-200'}`}></div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: Pen Name & Age */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#44474d]">
                  Pick a Fun Pen-Name
                </label>
                <button
                  type="button"
                  onClick={handleGenerateRandom}
                  className="text-xs font-bold text-[#2d6955] hover:text-[#1e483a] flex items-center gap-1 cursor-pointer"
                >
                  <span>🎲</span> Generate Idea
                </button>
              </div>
              <input
                type="text"
                value={penName}
                onChange={(e) => setPenName(e.target.value)}
                placeholder="e.g. StarlightFalcon42"
                className="w-full px-4 py-3 bg-[#f8fbfe] border border-[#ddeaf2] rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#203047]"
              />
              <p className="text-[11px] text-[#74777f] mt-1">
                For privacy, we never use your real full name in public book showcases.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#44474d] mb-1.5">
                  Birth Year
                </label>
                <select
                  value={birthYear}
                  onChange={(e) => setBirthYear(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#f8fbfe] border border-[#ddeaf2] rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#203047]"
                >
                  {Array.from({ length: 15 }, (_, i) => 2020 - i).map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#44474d] mb-1.5">
                  Reading Mode
                </label>
                <div className="p-2.5 bg-[#e9f6fd] border border-[#bce3f5] rounded-xl text-xs font-bold text-[#091b31] truncate">
                  {currentTier.label}
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full py-3 px-4 rounded-xl bg-[#203047] hover:bg-[#142337] text-white font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <span>Continue to Guardian Safety</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Guardian Email */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 leading-relaxed">
              <span className="font-bold">COPPA Guardian Guarantee:</span> We send a copy of all reading milestones, weekly reports, and bedtime limits to the parent email.
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#44474d] mb-1.5">
                Parent / Guardian Email
              </label>
              <input
                type="email"
                value={guardianEmail}
                onChange={(e) => setGuardianEmail(e.target.value)}
                placeholder="parent@example.com"
                required
                className="w-full px-4 py-3 bg-[#f8fbfe] border border-[#ddeaf2] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#203047]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#44474d] mb-1.5">
                School or Learning Club <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                placeholder="e.g. Jaipur Oakridge Academy"
                className="w-full px-4 py-3 bg-[#f8fbfe] border border-[#ddeaf2] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#203047]"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex-1 py-3 px-4 rounded-xl bg-[#203047] hover:bg-[#142337] text-white font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <span>Continue to Passphrase</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Passphrase & Confirmation */}
        {step === 3 && (
          <form onSubmit={handleSubmitRegistration} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#44474d] mb-1.5">
                Secret Passphrase
              </label>
              <input
                type="password"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                required
                placeholder="Create secret passphrase..."
                className="w-full px-4 py-3 bg-[#f8fbfe] border border-[#ddeaf2] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#203047]"
              />
              <p className="text-[11px] text-[#74777f] mt-1">
                Make it something fun you and your guardian will remember!
              </p>
            </div>

            <div className="p-3 bg-[#f8fbfe] border border-[#ddeaf2] rounded-2xl text-xs space-y-1">
              <div><span className="text-gray-500 font-medium">Pen-Name:</span> <span className="font-bold text-[#091b31]">{penName}</span></div>
              <div><span className="text-gray-500 font-medium">Mode:</span> <span className="font-bold text-[#091b31]">{currentTier.label}</span></div>
              <div><span className="text-gray-500 font-medium">Guardian:</span> <span className="font-bold text-[#091b31]">{guardianEmail}</span></div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-4 rounded-xl bg-[#2d6955] hover:bg-[#204e3f] text-white font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                    <span>Creating Pen-Name...</span>
                  </>
                ) : (
                  <>
                    <span>Complete & Start Reading</span>
                    <span className="material-symbols-outlined text-[18px]">auto_stories</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

