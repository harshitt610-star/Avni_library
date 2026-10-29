'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ContactPage() {
  const [settings, setSettings] = useState<any>(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) setSettings(data.settings);
      })
      .catch(() => {});
  }, []);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('Manuscript Publishing Inquiry');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, topic, message }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSent(true);
      } else {
        setErrorMessage(data.error || 'Failed to submit inquiry.');
      }
    } catch {
      setErrorMessage('Network error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 pt-24 pb-16 bg-[#f4faff]">
        <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2d6955]">
              Editorial Desk &amp; Inquiries
            </span>
            <h1 className="font-serif-story text-3xl sm:text-4xl font-bold text-[#091b31] mt-1">
              Contact StoryNest
            </h1>
            <p className="text-xs sm:text-sm text-[#44474d] mt-2">
              Have questions about bilingual children’s publishing, classroom licensing, or workshop partnerships?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-5 rounded-2xl border border-[#ddeaf2] shadow-sm text-center">
              <span className="text-2xl block mb-1">✉️</span>
              <div className="text-[11px] font-bold uppercase text-gray-400">Editorial Inquiries</div>
              <div className="text-xs font-bold text-[#203047] mt-1 font-mono">
                {settings?.contactEmail || 'editorial@storynest.com'}
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-[#ddeaf2] shadow-sm text-center">
              <span className="text-2xl block mb-1">📞</span>
              <div className="text-[11px] font-bold uppercase text-gray-400">Direct Desk</div>
              <div className="text-xs font-bold text-[#203047] mt-1 font-mono">
                {settings?.contactPhone || '+91 (0141) 278-9000'}
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-[#ddeaf2] shadow-sm text-center">
              <span className="text-2xl block mb-1">🏛️</span>
              <div className="text-[11px] font-bold uppercase text-gray-400">Publishing Guild</div>
              <div className="text-xs font-bold text-[#203047] mt-1">
                Jaipur &amp; New Delhi, India
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-[#ddeaf2] p-6 sm:p-10 shadow-tactile-sm">
            {sent ? (
              <div className="p-8 text-center bg-[#2F6B57]/10 rounded-2xl">
                <span className="text-4xl block mb-2">📬</span>
                <h3 className="font-serif-story font-bold text-xl text-[#2F6B57]">
                  Thank you! Message Received
                </h3>
                <p className="text-xs text-gray-600 mt-2">
                  Our editorial review desk will respond within 24-48 business hours.
                </p>
                <button
                  onClick={() => {
                    setSent(false);
                    setName('');
                    setEmail('');
                    setMessage('');
                  }}
                  className="mt-4 px-4 py-2 bg-[#203047] text-white text-xs font-bold rounded-xl"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {errorMessage && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
                    {errorMessage}
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#44474d] mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Vikram Singhania"
                      className="w-full px-4 py-2.5 bg-[#f4faff] border border-[#ddeaf2] rounded-xl text-xs focus:ring-2 focus:ring-[#203047]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#44474d] mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-4 py-2.5 bg-[#f4faff] border border-[#ddeaf2] rounded-xl text-xs focus:ring-2 focus:ring-[#203047]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#44474d] mb-1">Topic</label>
                  <select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#f4faff] border border-[#ddeaf2] rounded-xl text-xs focus:ring-2 focus:ring-[#203047]"
                  >
                    <option>Manuscript Publishing Inquiry</option>
                    <option>School &amp; Classroom Subscription</option>
                    <option>Workshop Hosting</option>
                    <option>COPPA &amp; Family Privacy Feedback</option>
                    <option>General Support</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#44474d] mb-1">Your Message</label>
                  <textarea
                    rows={5}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="How can our editorial board assist you?..."
                    className="w-full p-4 bg-[#f4faff] border border-[#ddeaf2] rounded-xl text-xs focus:ring-2 focus:ring-[#203047]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="py-3.5 rounded-xl bg-[#203047] text-white text-xs font-bold hover:bg-[#091b31] shadow-tactile-sm transition-all disabled:opacity-50"
                >
                  {submitting ? 'Sending Inquiry...' : 'Send Message to Editorial Team'}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
