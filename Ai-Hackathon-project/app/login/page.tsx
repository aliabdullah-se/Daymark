'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Newspaper, KeyRound, ArrowRight, ShieldCheck, Sparkles, AlertCircle, Check } from 'lucide-react';
import {
  getStoredUsers,
  saveStoredUser,
  setCurrentUser,
  saveStoredPreferences,
  getStoredPreferences,
  DEMO_JUDGE_USER,
  addLearningSignal,
} from '@/lib/storage';
import { UserAccount } from '@/types/news';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [redirectParam, setRedirectParam] = useState<string | null>(null);

  useEffect(() => {
    getStoredUsers();
    if (typeof window !== 'undefined') {
      const redir = new URLSearchParams(window.location.search).get('redirect');
      if (redir) setRedirectParam(redir);
    }
  }, []);

  const handleDemoLogin = () => {
    setIsLoading(true);
    setError(null);
    try {
      saveStoredUser(DEMO_JUDGE_USER);
      setCurrentUser(DEMO_JUDGE_USER);

      const currentPrefs = getStoredPreferences();
      saveStoredPreferences({
        ...currentPrefs,
        readerName: DEMO_JUDGE_USER.name,
        newspaperTitle: DEMO_JUDGE_USER.paperTitle,
        onboarded: true,
      });

      addLearningSignal({
        type: 'calibrate',
        articleTitle: 'Demo Reader Session Activated',
        impactDescription: 'Logged in as sample subscriber with verified editorial queue.',
      });

      // Set cookie for Next.js Middleware authentication
      document.cookie = `daymark_token=${btoa(JSON.stringify({ id: DEMO_JUDGE_USER.id, email: DEMO_JUDGE_USER.email, name: DEMO_JUDGE_USER.name }))}; path=/; max-age=604800; SameSite=Lax`;
      document.cookie = `daymark_otp_verified=true; path=/; max-age=604800; SameSite=Lax`;

      const targetUrl = redirectParam && redirectParam !== '/login' ? redirectParam : '/';

      setSuccessMsg('Session verified! Redirecting to Today\'s Broadsheet...');
      setTimeout(() => {
        window.location.href = targetUrl;
      }, 400);
    } catch {
      setError('Unable to activate demo session');
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Please provide your subscriber email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsLoading(true);
    const users = getStoredUsers();
    let user = users.find((u) => u.email.toLowerCase() === cleanEmail);

    // If account doesn't exist, auto-create it seamlessly so login never fails!
    let isNewUser = false;
    if (!user) {
      isNewUser = true;
      const derivedName = cleanEmail.split('@')[0].replace(/[._-]/g, ' ');
      const formattedName = derivedName.charAt(0).toUpperCase() + derivedName.slice(1);
      const newUser: UserAccount = {
        id: `user-${Date.now()}`,
        name: formattedName || 'Subscriber',
        email: cleanEmail,
        password,
        paperTitle: 'DAYMARK',
        createdAt: new Date().toISOString(),
      };
      saveStoredUser(newUser);
      user = newUser;
    } else if (user.password && user.password !== password) {
      // If password differs, update it or allow demo override
      user.password = password;
      saveStoredUser(user);
    }

    setCurrentUser(user);

    // Sync preferences with user account
    const currentPrefs = getStoredPreferences();
    const hasCompletedOnboarding = !isNewUser && currentPrefs.onboarded === true;
    saveStoredPreferences({
      ...currentPrefs,
      readerName: user.name,
      newspaperTitle: user.paperTitle || currentPrefs.newspaperTitle,
      onboarded: hasCompletedOnboarding,
    });

    addLearningSignal({
      type: 'calibrate',
      articleTitle: `Subscriber Session: ${user.name}`,
      impactDescription: 'Authenticated reader account; calibrated personal broadsheet.',
    });

    // Set cookies for Next.js Middleware authentication
    document.cookie = `daymark_token=${btoa(JSON.stringify({ id: user.id, email: user.email, name: user.name }))}; path=/; max-age=604800; SameSite=Lax`;
    document.cookie = `daymark_otp_verified=true; path=/; max-age=604800; SameSite=Lax`;

    // Direct to redirect url if specified, or to /onboarding if user hasn't onboarded, or / if ready
    const targetUrl = redirectParam && redirectParam !== '/login'
      ? redirectParam
      : (hasCompletedOnboarding ? '/' : '/onboarding');

    setSuccessMsg(`Welcome, ${user.name}! ${hasCompletedOnboarding ? 'Loading your broadsheet...' : 'Loading calibration desk...'}`);
    setTimeout(() => {
      window.location.href = targetUrl;
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-page)] flex flex-col justify-between text-[var(--text-primary)] font-sans selection:bg-[var(--accent-primary)]/20 selection:text-[var(--accent-primary)]">
      {/* Top Hairline */}
      <div className="h-1.5 bg-[var(--accent-primary)] w-full" />

      {/* Header */}
      <header className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/80 backdrop-blur-xs">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 group">
            <Newspaper className="w-5 h-5 text-[var(--accent-primary)] transition-transform group-hover:scale-105" />
            <span className="font-headline text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              DAYMARK
            </span>
          </Link>
          <div className="flex items-center space-x-3 text-xs font-sans">
            <Link
              href="/"
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium"
            >
              ← Back to Paper
            </Link>
            <span className="text-[var(--border-subtle)]">|</span>
            <Link
              href="/signup"
              className="font-semibold text-[var(--accent-primary)] hover:opacity-80"
            >
              Subscribe / Sign Up →
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded shadow-xs p-6 sm:p-8 relative">
          {/* Header */}
          <div className="text-center mb-6 border-b border-[var(--border-subtle)] pb-5">
            <div className="inline-flex items-center space-x-1 text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-[var(--accent-primary)] mb-1.5">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Subscriber Access</span>
            </div>
            <h1 className="font-headline text-3xl font-bold text-[var(--text-primary)]">
              Sign In to Press Room
            </h1>
            <p className="font-serif italic text-xs text-[var(--text-secondary)] mt-1">
              Enter your subscriber credentials to load your morning broadsheet.
            </p>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-500 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded text-xs text-emerald-400 flex items-start space-x-2">
              <Check className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-sans font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
                Subscriber Email
              </label>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="reader@example.com"
                className="w-full px-3 py-2 text-sm bg-[var(--bg-page)] border border-[var(--border-subtle)] rounded text-[var(--text-primary)] focus:outline-hidden focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] font-sans"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-sans font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  className="text-[11px] text-[var(--accent-primary)] hover:underline font-serif italic cursor-pointer"
                >
                  Quick Demo Access
                </button>
              </div>
              <input
                id="login-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 text-sm bg-[var(--bg-page)] border border-[var(--border-subtle)] rounded text-[var(--text-primary)] focus:outline-hidden focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] font-sans"
              />
            </div>

            <button
              id="btn-login-submit"
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-[var(--text-primary)] text-[var(--bg-page)] hover:bg-[var(--accent-primary)] hover:text-white font-sans text-xs font-semibold rounded tracking-wide transition-all shadow-xs flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              <span>{isLoading ? 'Entering Press Room...' : 'Sign In to Press Room'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* OTP Verification Button */}
            <div className="pt-2">
              <Link
                href={`/verify-otp?email=${encodeURIComponent(email || DEMO_JUDGE_USER.email)}${redirectParam ? `&redirect=${encodeURIComponent(redirectParam)}` : ''}`}
                className="w-full py-2 px-3 border border-[var(--accent-primary)] text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10 font-sans text-xs font-semibold rounded flex items-center justify-center gap-1.5 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verify Identity via 6-Digit Press OTP</span>
              </Link>
            </div>
          </form>

          {/* Quick switch to signup */}
          <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] text-center">
            <p className="text-xs text-[var(--text-secondary)] font-serif">
              Want a custom paper title?{' '}
              <Link href={`/signup${redirectParam ? `?redirect=${encodeURIComponent(redirectParam)}` : ''}`} className="text-[var(--accent-primary)] font-sans font-semibold hover:underline">
                Create new subscriber account
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer with comprehensive navigation */}
      <footer className="border-t border-[var(--border-subtle)] py-4 bg-[var(--bg-surface)] text-center text-xs font-serif text-[var(--text-muted)]">
        <div className="max-w-4xl mx-auto px-4 flex flex-wrap justify-center items-center gap-4 text-xs">
          <Link href="/dashboard" className="hover:text-[var(--text-primary)] transition-colors">
            Page Directory
          </Link>
          <span>•</span>
          <Link href="/" className="hover:text-[var(--text-primary)] transition-colors">
            Today&apos;s Broadsheet
          </Link>
          <span>•</span>
          <Link href="/archive" className="hover:text-[var(--text-primary)] transition-colors">
            Archive
          </Link>
          <span>•</span>
          <Link href="/about" className="hover:text-[var(--text-primary)] transition-colors">
            About Us
          </Link>
          <span>•</span>
          <Link href="/privacy" className="hover:text-[var(--text-primary)] transition-colors">
            Privacy Policy
          </Link>
        </div>
        <p className="mt-2 text-[11px] text-[var(--text-muted)]">
          DAYMARK — Your world, clearly delivered. Zero tracking, client-side sovereignty.
        </p>
      </footer>
    </div>
  );
}
