'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthRoleTabs, { AuthRole } from '@/components/auth/AuthRoleTabs';
import ReaderAuthCard from '@/components/auth/ReaderAuthCard';
import ParentAuthCard from '@/components/auth/ParentAuthCard';
import AuthorAuthCard from '@/components/auth/AuthorAuthCard';
import AdminAuthCard from '@/components/auth/AdminAuthCard';
import GoogleAuthModal from '@/components/auth/GoogleAuthModal';
import ChildRegisterModal from '@/components/auth/ChildRegisterModal';
import { useAuth } from '@/context/AuthContext';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser, checkAuth } = useAuth();

  const redirectUrl = searchParams.get('redirect') || '';
  const initialRoleParam = searchParams.get('role') as AuthRole | null;
  const initialTab = searchParams.get('tab');
  const errorParam = searchParams.get('error');

  // Determine initial role
  const computeInitialRole = (): AuthRole => {
    if (initialRoleParam && ['reader', 'parent', 'author', 'admin'].includes(initialRoleParam)) {
      return initialRoleParam;
    }
    return 'reader';
  };

  const [activeRole, setActiveRole] = useState<AuthRole>(computeInitialRole);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(
    errorParam === 'admin_access_required'
      ? '🔒 Editorial Staff / Super Admin credentials required.'
      : ''
  );
  const [successMsg, setSuccessMsg] = useState('');

  const pathname = usePathname();

  // Modals state
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(
    initialTab === 'register' || initialTab === 'signup' || (pathname ? pathname.includes('/register') : false)
  );

  // Core Login Handler
  const handleLogin = async (identifier: string, secret: string) => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          email: identifier,
          password: secret,
        }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        await checkAuth();
        setSuccessMsg(`Welcome back, ${data.user.name}!`);
        setTimeout(() => {
          let dest = redirectUrl;
          if (!dest) {
            if (data.user.role === 'admin') dest = '/admin';
            else if (data.user.role === 'author') dest = '/author';
            else if (data.user.role === 'parent') dest = '/parent';
            else dest = '/reader';
          }
          window.location.href = dest;
        }, 400);
      } else {
        setErrorMsg(data.error || 'Invalid credentials. Please verify your details.');
      }
    } catch {
      setErrorMsg('Error connecting to the StoryNest authentication service.');
    } finally {
      setLoading(false);
    }
  };

  // Google Sign-In Handler
  const handleGoogleAuth = async (email: string, name: string) => {
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'google_signin',
          email,
          name,
        }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        setGoogleModalOpen(false);
        setUser(data.user);
        await checkAuth();
        setSuccessMsg(`Authenticated via Google as ${data.user.name}!`);
        setTimeout(() => {
          const dest = redirectUrl || data.redirectTo || '/parent';
          window.location.href = dest;
        }, 400);
      } else {
        setErrorMsg(data.error || 'Failed to authenticate with Google.');
      }
    } catch {
      setErrorMsg('Error connecting to Google authentication service.');
    } finally {
      setLoading(false);
    }
  };

  // Registration Success Handler
  const handleRegisterSuccess = async (_email: string, penName: string) => {
    setRegisterModalOpen(false);
    await checkAuth();
    setSuccessMsg(`Pen-name "${penName}" created successfully! Entering Sanctuary...`);
    setTimeout(() => {
      window.location.href = redirectUrl || '/reader';
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#f4faff] flex flex-col font-sans-ui text-[#091b31]">
      <Navbar />

      <main className="w-full pt-28 pb-20 px-4 sm:px-6 max-w-4xl mx-auto flex-1 flex flex-col items-center justify-center">
        {/* Welcome Header */}
        <div className="text-center max-w-xl mx-auto mb-8 animate-in fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e9f6fd] border border-[#bce3f5] text-[#203047] text-xs font-bold mb-3 shadow-2xs">
            <span>✨</span>
            <span>Where Young Minds Read, Create & Grow</span>
          </div>

          <h1 className="font-serif-title text-3xl sm:text-4xl font-bold text-[#091b31] tracking-tight">
            Welcome to StoryNest
          </h1>
          <p className="text-xs sm:text-sm text-[#44474d] mt-2 leading-relaxed">
            Choose your portal below to enter your personalized literary sanctuary.
          </p>
        </div>

        {/* Global Success Banner */}
        {successMsg && (
          <div className="w-full max-w-2xl mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center gap-2.5 animate-in fade-in">
            <span className="material-symbols-outlined text-[20px] text-emerald-600">check_circle</span>
            <span>{successMsg}</span>
          </div>
        )}

        {/* Persona Deck Container */}
        <div className="w-full max-w-2xl flex flex-col gap-6 animate-in fade-in zoom-in-95">
          {/* Top Persona Switcher */}
          <AuthRoleTabs
            activeRole={activeRole}
            onSelectRole={(r) => {
              setActiveRole(r);
              setErrorMsg('');
            }}
          />

          {/* Active Persona Card */}
          {activeRole === 'reader' && (
            <ReaderAuthCard
              onLogin={handleLogin}
              onOpenRegister={() => setRegisterModalOpen(true)}
              loading={loading}
              error={errorMsg}
            />
          )}

          {activeRole === 'parent' && (
            <ParentAuthCard
              onLogin={handleLogin}
              onOpenGoogleModal={() => setGoogleModalOpen(true)}
              loading={loading}
              error={errorMsg}
            />
          )}

          {activeRole === 'author' && (
            <AuthorAuthCard
              onLogin={handleLogin}
              loading={loading}
              error={errorMsg}
            />
          )}

          {activeRole === 'admin' && (
            <AdminAuthCard
              onLogin={handleLogin}
              loading={loading}
              error={errorMsg}
            />
          )}
        </div>

        {/* Sub-footer Security Promise */}
        <div className="mt-10 text-center max-w-md mx-auto text-xs text-[#74777f] flex items-center justify-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-emerald-600">verified_user</span>
            COPPA Safe & Encrypted
          </span>
          <span>•</span>
          <a href="/safety" className="hover:underline text-[#203047]">
            Privacy Charter
          </a>
          <span>•</span>
          <a href="/testing" className="hover:underline text-[#203047] flex items-center gap-1">
            <span>🧪</span> QA Deck
          </a>
        </div>

        {/* Google OAuth Modal */}
        <GoogleAuthModal
          isOpen={googleModalOpen}
          onClose={() => setGoogleModalOpen(false)}
          onSuccess={handleGoogleAuth}
          loading={loading}
        />

        {/* Child Registration Stepper Modal */}
        <ChildRegisterModal
          isOpen={registerModalOpen}
          onClose={() => setRegisterModalOpen(false)}
          onSuccess={handleRegisterSuccess}
        />
      </main>

      <Footer />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f4faff] flex items-center justify-center text-[#091b31]">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined animate-spin text-[32px] text-[#2d6955]">
              progress_activity
            </span>
            <span className="font-title-md font-bold">Opening StoryNest Gateway...</span>
          </div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
