'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'reader' | 'parent' | 'author' | 'educator' | 'admin';
  avatarUrl?: string;
  bio?: string;
}

interface GateState {
  isOpen: boolean;
  targetUrl: string;
  reason: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  setUser: (user: AuthUser | null) => void;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
  requireAuth: (targetUrl: string, reason?: string) => boolean;
  gateState: GateState;
  closeGate: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [gateState, setGateState] = useState<GateState>({
    isOpen: false,
    targetUrl: '',
    reason: '',
  });

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      const data = await res.json();
      if (data.authenticated && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Re-check authentication on mount and on every pathname navigation
  useEffect(() => {
    checkAuth();
  }, [pathname, checkAuth]);

  const logout = async () => {
    try {
      await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' }),
      });
      setUser(null);
      router.push('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  /**
   * Action Gating:
   * Returns true if user is logged in.
   * If not logged in, opens the gentle sign-in gate modal and returns false.
   */
  const requireAuth = (targetUrl: string, reason = 'Sign in to access this feature'): boolean => {
    if (user) {
      router.push(targetUrl);
      return true;
    }
    setGateState({
      isOpen: true,
      targetUrl,
      reason,
    });
    return false;
  };

  const closeGate = () => {
    setGateState({ isOpen: false, targetUrl: '', reason: '' });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        setUser,
        checkAuth,
        logout,
        requireAuth,
        gateState,
        closeGate,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

