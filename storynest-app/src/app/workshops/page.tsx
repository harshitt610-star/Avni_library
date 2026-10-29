'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface WorkshopItem {
  _id: string;
  title: string;
  description: string;
  category?: string;
  ageBracket?: string;
  mentorName?: string;
  mentorTitle?: string;
  instructorName?: string;
  instructorAvatar?: string;
  instructorRole?: string;
  date?: string;
  time?: string;
  durationMinutes?: number;
  maxSeats?: number;
  maxCapacity?: number;
  bookedSeats?: number;
  tags?: string[];
  meetingUrl?: string;
  scheduledAt?: string;
}

export default function WorkshopsPage() {
  const [workshops, setWorkshops] = useState<WorkshopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkshop, setSelectedWorkshop] = useState<WorkshopItem | null>(null);
  const [regForm, setRegForm] = useState({
    attendeeName: '',
    attendeeAge: '8',
    parentEmail: '',
  });
  const [regSuccess, setRegSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/workshops')
      .then((res) => res.json())
      .then((data) => {
        if (data.workshops) setWorkshops(data.workshops);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkshop?._id) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/workshops/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workshopId: selectedWorkshop._id,
          ...regForm,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setRegSuccess(true);
      } else {
        alert(data.error || 'Failed to register');
      }
    } catch {
      alert('Network error registering for workshop');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 pt-24 pb-16 bg-[#f4faff]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Banner */}
          <div className="bg-[#e9f6fd] border border-[#ddeaf2] rounded-3xl p-6 sm:p-10 mb-10 shadow-tactile-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2d6955]">
              Live Creator Studio
            </span>
            <h1 className="font-serif-story text-3xl sm:text-4xl font-bold text-[#091b31] mt-1">
              Interactive Live Workshops for Young Storytellers &amp; Illustrators
            </h1>
            <p className="text-sm text-[#44474d] max-w-2xl mt-2 leading-relaxed">
              Step into intimate, safe virtual classrooms led by published children’s authors, astrophysicists,
              and watercolor illustrators. Ask questions in real-time, share your sketches, and ignite lifelong creativity.
            </p>
          </div>

          {/* Workshop Cards Grid */}
          {loading ? (
            <div className="py-20 text-center">
              <div className="inline-block w-8 h-8 border-4 border-[#203047] border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-sm text-[#44474d]">Loading scheduled live sessions...</p>
            </div>
          ) : workshops.length === 0 ? (
            <p className="text-center py-10 text-gray-500">No workshops scheduled right now.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {workshops.map((ws) => (
                <div
                  key={ws._id}
                  className="bg-white border border-[#ddeaf2] rounded-3xl p-6 sm:p-8 shadow-tactile-sm hover:shadow-tactile-md transition-all flex flex-col justify-between gap-6"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-[#b1f0d6] text-[#002117] text-xs font-bold">
                        {ws.category}
                      </span>
                      <span className="text-xs font-semibold text-[#44474d]">
                        Ages {ws.ageBracket}
                      </span>
                    </div>

                    <h2 className="font-serif-story text-2xl font-bold text-[#091b31] leading-snug">
                      {ws.title}
                    </h2>

                    <div className="flex items-center gap-3 bg-[#f4faff] border border-[#ddeaf2] rounded-2xl p-3">
                      <img
                        src={ws.instructorAvatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80'}
                        alt={ws.instructorName}
                        className="w-12 h-12 rounded-full object-cover shrink-0"
                      />
                      <div>
                        <h4 className="font-bold text-sm text-[#091b31]">{ws.instructorName}</h4>
                        <p className="text-xs text-[#75777e]">{ws.instructorRole}</p>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-[#44474d] leading-relaxed">
                      {ws.description}
                    </p>

                    <div className="bg-[#e9f6fd] rounded-2xl p-4 flex flex-col gap-2 text-xs">
                      <div className="flex items-center gap-2 text-[#091b31]">
                        <span className="material-symbols-outlined text-[18px] text-[#2d6955]">calendar_today</span>
                        <span className="font-semibold">{ws.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#091b31]">
                        <span className="material-symbols-outlined text-[18px] text-[#2d6955]">schedule</span>
                        <span>{ws.time} ({ws.durationMinutes} minutes)</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#091b31]">
                        <span className="material-symbols-outlined text-[18px] text-[#f4be55]">group</span>
                        <span>
                          {ws.bookedSeats ?? 0} of {ws.maxSeats ?? 20} seats reserved ({((ws.maxSeats ?? 20) - (ws.bookedSeats ?? 0))} remaining)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-4 border-t border-[#ddeaf2]">
                    <button
                      onClick={() => {
                        setSelectedWorkshop(ws);
                        setRegSuccess(false);
                      }}
                      className="flex-1 py-3 rounded-xl bg-[#203047] text-white text-xs font-semibold hover:bg-[#091b31] shadow-tactile-sm transition-all"
                    >
                      Reserve Free Child Seat
                    </button>
                    <Link
                      href={`/workshops/${ws._id}/room`}
                      className="px-4 py-3 rounded-xl bg-[#e9f6fd] text-[#203047] text-xs font-semibold hover:bg-[#ddeaf2] transition-colors"
                    >
                      Preview Room
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Registration Modal */}
      {selectedWorkshop && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-tactile-xl border border-[#ddeaf2] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-[#ddeaf2]">
              <h3 className="font-serif-story text-lg font-bold text-[#091b31]">
                Workshop Seat Reservation
              </h3>
              <button
                onClick={() => setSelectedWorkshop(null)}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500"
              >
                ✕
              </button>
            </div>

            {regSuccess ? (
              <div className="py-8 text-center flex flex-col items-center gap-3">
                <span className="text-5xl">🎉 🎟️</span>
                <h4 className="font-serif-story text-xl font-bold text-[#091b31]">
                  Seat Confirmed!
                </h4>
                <p className="text-xs text-[#44474d] max-w-sm">
                  We have reserved a seat for {regForm.attendeeName} in &ldquo;{selectedWorkshop.title}&rdquo;. A calendar confirmation has been sent to {regForm.parentEmail}.
                </p>
                <div className="mt-4 flex gap-3">
                  <Link
                    href={`/workshops/${selectedWorkshop._id}/room`}
                    className="px-5 py-2.5 rounded-xl bg-[#203047] text-white text-xs font-bold shadow-tactile-sm"
                  >
                    Enter Live Workshop Room
                  </Link>
                  <button
                    onClick={() => setSelectedWorkshop(null)}
                    className="px-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-xs font-semibold"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="mt-4 flex flex-col gap-4">
                <p className="text-xs text-[#44474d]">
                  Reserving for: <strong className="text-[#091b31]">{selectedWorkshop.title}</strong>
                </p>

                <div>
                  <label className="block text-xs font-bold text-[#44474d] mb-1">
                    Child Attendee Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aarav Sharma"
                    value={regForm.attendeeName}
                    onChange={(e) => setRegForm({ ...regForm, attendeeName: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#f4faff] border border-[#ddeaf2] rounded-xl text-xs focus:ring-2 focus:ring-[#203047]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#44474d] mb-1">
                    Child Age
                  </label>
                  <select
                    value={regForm.attendeeAge}
                    onChange={(e) => setRegForm({ ...regForm, attendeeAge: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#f4faff] border border-[#ddeaf2] rounded-xl text-xs focus:ring-2 focus:ring-[#203047]"
                  >
                    {[5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((age) => (
                      <option key={age} value={age}>
                        {age} years old
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#44474d] mb-1">
                    Parent / Guardian Contact Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="parent@example.com"
                    value={regForm.parentEmail}
                    onChange={(e) => setRegForm({ ...regForm, parentEmail: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#f4faff] border border-[#ddeaf2] rounded-xl text-xs focus:ring-2 focus:ring-[#203047]"
                  />
                </div>

                <div className="bg-[#e9f6fd] p-3 rounded-xl flex items-center gap-2 text-[11px] text-[#2d6955]">
                  <span className="material-symbols-outlined text-[16px]">lock</span>
                  <span>COPPA Protected: Children’s information is never shared or made public.</span>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3 rounded-xl bg-[#203047] text-white text-xs font-bold hover:bg-[#091b31] shadow-tactile-sm"
                  >
                    {submitting ? 'Confirming...' : 'Confirm Seat'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedWorkshop(null)}
                    className="px-4 py-3 rounded-xl bg-gray-100 text-gray-700 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
