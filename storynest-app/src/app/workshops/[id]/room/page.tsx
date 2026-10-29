'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
interface ChatMessage {
  sender: string;
  text: string;
  time: string;
  isSystem?: boolean;
  isInstructor?: boolean;
}

interface WorkshopSession {
  _id: string;
  title: string;
  instructorName?: string;
  description?: string;
}

export default function WorkshopRoomPage() {
  const { user, loading: authLoading } = useAuth();
  const params = useParams();
  const id = params?.id as string;
  const [workshop, setWorkshop] = useState<WorkshopSession | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'notes' | 'resources'>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: 'Moderator StoryNest', text: 'Welcome young creators! Audio and video are instructor-led. Post your questions in the safe chat below.', time: '11:00 AM', isSystem: true },
    { sender: 'Aarav (Grade 3)', text: 'Can alien trees have silver leaves that absorb starlight?', time: '11:05 AM' },
    { sender: 'Dr. Meera Sharma', text: 'Yes Aarav! On planets with red dwarf stars, plants might actually appear black or deep silver to capture infrared rays!', time: '11:06 AM', isInstructor: true },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [handRaised, setHandRaised] = useState(false);
  const [myNotes, setMyNotes] = useState('My story idea: A planet with 2 moons that pulls tides of purple sand...');

  useEffect(() => {
    fetch('/api/workshops')
      .then((res) => res.json())
      .then((data) => {
        if (data.workshops) {
          const found = data.workshops.find((w: WorkshopSession) => w._id === id) || data.workshops[0];
          setWorkshop(found);
        }
      });
  }, [id]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setMessages([
      ...messages,
      {
        sender: 'You (Student)',
        text: chatInput,
        time: 'Just now',
      },
    ]);
    setChatInput('');
  };

  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-[#091b31] flex items-center justify-center p-4 text-white">
        <div className="max-w-md w-full bg-[#1b2b40] rounded-3xl p-8 border border-white/10 shadow-2xl text-center">
          <span className="text-4xl mb-3 block">🎪</span>
          <h2 className="font-serif-title text-2xl font-bold text-white">
            Classroom Sign-In Required
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 mb-6">
            Live author masterclasses are protected student environments. Please sign in to enter the workshop room and participate in the live discussion.
          </p>
          <Link
            href={`/login?role=reader&redirect=/workshops/${id}/room`}
            className="w-full py-3 px-4 rounded-xl bg-[#ffdea7] text-[#261800] hover:bg-[#f4be55] font-bold text-sm block transition-all shadow-sm"
          >
            Sign In to Join Classroom →
          </Link>
          <div className="mt-4">
            <Link href="/workshops" className="text-xs text-sky-400 hover:underline">
              ← Return to Workshop Catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#091b31] text-white flex flex-col">
      {/* Top Studio Bar */}
      <header className="h-16 bg-[#203047] border-b border-white/10 px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/workshops"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-gray-200 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Leave Room</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="font-serif-story font-bold text-sm truncate max-w-xs sm:max-w-md">
              {workshop ? workshop.title : 'Live Workshop Room'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setHandRaised(!handRaised)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              handRaised
                ? 'bg-[#ffdea7] text-[#261800] ring-2 ring-[#f4be55]'
                : 'bg-white/10 hover:bg-white/20 text-gray-200'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">front_hand</span>
            <span>{handRaised ? 'Hand Raised ✋' : 'Raise Hand'}</span>
          </button>
          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 text-xs text-[#b1f0d6]">
            <span className="material-symbols-outlined text-[16px]">verified_user</span>
            <span>COPPA Safe Room</span>
          </div>
        </div>
      </header>

      {/* Main Studio Viewport */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left: Video Stage */}
        <div className="flex-1 p-4 sm:p-6 flex flex-col gap-4 overflow-y-auto">
          {/* Main Presenter Video Window */}
          <div className="relative aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex items-center justify-center group">
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80"
              alt="Live Presenter Feed"
              className="w-full h-full object-cover opacity-90"
            />
            {/* Live Indicator Overlay */}
            <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>LIVE • {workshop ? workshop.instructorName : 'Instructor'}</span>
            </div>
            {/* Presentation Title Overlay */}
            <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-black/70 backdrop-blur-md flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-300">Live Stage Session:</p>
                <h3 className="font-serif-story font-bold text-sm text-white">
                  {workshop ? workshop.title : 'Building Alien Worlds & Cosmic Lore'}
                </h3>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-300">
                <span className="material-symbols-outlined text-[18px] text-[#f4be55]">mic</span>
                <span>Active Speaker</span>
              </div>
            </div>
          </div>

          {/* Quick Learning Prompts */}
          <div className="bg-[#203047] rounded-2xl p-4 border border-white/10 flex flex-col gap-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#b1f0d6]">
              Session Exercise Prompt
            </h4>
            <p className="text-xs text-gray-200">
              &ldquo;Choose one physical rule that is different on your planet (e.g. gravity is half of Earth&rsquo;s, or rain is warm lavender mist). How does your main character travel to school?&rdquo;
            </p>
          </div>
        </div>

        {/* Right: Live Interactive Sidebar */}
        <div className="w-full lg:w-96 bg-[#162233] border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col h-[400px] lg:h-auto">
          {/* Tab Selector */}
          <div className="flex border-b border-white/10 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-3 text-center transition-colors ${
                activeTab === 'chat' ? 'bg-[#203047] text-[#ffdea7] border-b-2 border-[#ffdea7]' : 'text-gray-400 hover:text-white'
              }`}
            >
              Moderated Q&amp;A
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`flex-1 py-3 text-center transition-colors ${
                activeTab === 'notes' ? 'bg-[#203047] text-[#ffdea7] border-b-2 border-[#ffdea7]' : 'text-gray-400 hover:text-white'
              }`}
            >
              My Sketchpad
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={`flex-1 py-3 text-center transition-colors ${
                activeTab === 'resources' ? 'bg-[#203047] text-[#ffdea7] border-b-2 border-[#ffdea7]' : 'text-gray-400 hover:text-white'
              }`}
            >
              Worksheets
            </button>
          </div>

          {/* Tab Contents */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col justify-between overflow-hidden p-4">
              <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1 text-xs">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl ${
                      m.isSystem
                        ? 'bg-white/5 border border-white/10 text-gray-300 italic'
                        : m.isInstructor
                        ? 'bg-[#2d6955]/30 border border-[#2d6955] text-white'
                        : 'bg-[#203047] text-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-[#ffdea7]">{m.sender}</span>
                      <span className="text-[10px] text-gray-400">{m.time}</span>
                    </div>
                    <p className="leading-relaxed">{m.text}</p>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="mt-3 flex gap-2">
                <input
                  type="text"
                  placeholder="Ask the instructor a question..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 px-3 py-2 bg-[#203047] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#ffdea7]"
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-[#2d6955] text-white rounded-xl text-xs font-bold hover:opacity-95"
                >
                  Send
                </button>
              </form>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="flex-1 p-4 flex flex-col gap-2">
              <span className="text-xs text-gray-400">Personal notepad (auto-saved):</span>
              <textarea
                value={myNotes}
                onChange={(e) => setMyNotes(e.target.value)}
                rows={12}
                className="w-full flex-1 p-3 bg-[#203047] border border-white/10 rounded-xl text-xs text-white focus:outline-none font-mono"
              />
            </div>
          )}

          {activeTab === 'resources' && (
            <div className="flex-1 p-4 flex flex-col gap-3 overflow-y-auto text-xs">
              <h5 className="font-bold text-sm text-[#ffdea7]">Workshop Downloads</h5>
              <div className="p-3 bg-[#203047] rounded-xl border border-white/10 flex items-center justify-between">
                <div>
                  <p className="font-bold">Alien Planetary Worksheet.pdf</p>
                  <p className="text-[11px] text-gray-400">Grid template &amp; sensory checklist</p>
                </div>
                <button
                  onClick={() => alert('Downloaded template to device!')}
                  className="px-2.5 py-1 bg-white/10 rounded-lg text-xs hover:bg-white/20"
                >
                  Download
                </button>
              </div>
              <div className="p-3 bg-[#203047] rounded-xl border border-white/10 flex items-center justify-between">
                <div>
                  <p className="font-bold">Character Arc Sketch Sheet.pdf</p>
                  <p className="text-[11px] text-gray-400">Hero desire vs fear chart</p>
                </div>
                <button
                  onClick={() => alert('Downloaded template to device!')}
                  className="px-2.5 py-1 bg-white/10 rounded-lg text-xs hover:bg-white/20"
                >
                  Download
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
