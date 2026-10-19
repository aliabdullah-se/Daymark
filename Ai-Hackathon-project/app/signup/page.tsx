'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Newspaper, UserPlus, ArrowRight, Sparkles, AlertCircle, Check } from 'lucide-react';
import {
  getStoredUsers,
  saveStoredUser,
  setCurrentUser,
  getStoredPreferences,
  saveStoredPreferences,
  addLearningSignal,
} from '@/lib/storage';
import { UserAccount } from '@/types/news';

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [paperTitle, setPaperTitle] = useState('DAYMARK');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [redirectParam, setRedirectParam] = useState<string | null>(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const redir = new URLSearchParams(window.location.search).get('redirect');
      if (redir) setRedirectParam(redir);
    }
  }, []);

  const handleQuickFill = () => {
    setFullName('Sarah Lin');
    setEmail('sarah.lin@example.com');
    setPassword('subscriber123');
    setPaperTitle('DAYMARK');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = fullName.trim() || 'Subscriber';
    const cleanEmail = email.trim().toLowerCase();
    const cleanTitle = paperTitle.trim() || 'DAYMARK';

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid subscriber email address.');
      return;
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }

    setIsLoading(true);

    const newUser: UserAccount = {
      id: `user-${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      password,
      paperTitle: cleanTitle.toUpperCase(),
      createdAt: new Date().toISOString(),
    };

    // Save user and set active session
    saveStoredUser(newUser);
    setCurrentUser(newUser);

    // Sync preferences for new subscriber
    const currentPrefs = getStoredPreferences();
    saveStoredPreferences({
      ...currentPrefs,
      readerName: cleanName,
      newspaperTitle: cleanTitle.toUpperCase(),
      onboarded: false,
    });

    addLearningSignal({
      type: 'calibrate',
      articleTitle: `Subscription Initialized: ${cleanTitle.toUpperCase()}`,
      impactDescription: `New broadsheet created for ${cleanName}. Proceeding to desk calibration.`,
    });

    // Set authentication cookies for Next.js Middleware validation
    document.cookie = `daymark_token=${btoa(JSON.stringify({ id: newUser.id, email: newUser.email, name: newUser.name }))}; path=/; max-age=604800; SameSite=Lax`;
    document.cookie = `daymark_otp_verified=true; path=/; max-age=604800; SameSite=Lax`;

    setSuccessMsg(`Account created for ${cleanName}! Loading calibration desk...`);
    setTimeout(() => {
      window.location.href = '/onboarding';
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
              href={`/login${redirectParam ? `?redirect=${encodeURIComponent(redirectParam)}` : ''}`}
              className="font-semibold text-[var(--accent-primary)] hover:opacity-80"
            >
              Already Subscribed? Sign In →
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded shadow-xs p-6 sm:p-8 relative">
          {/* Header */}
          <div className="text-center mb-6 border-b border-[var(--border-subtle)] pb-5">
            <div className="inline-flex items-center space-x-1 text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-[var(--accent-primary)] mb-1.5">
              <UserPlus className="w-3.5 h-3.5" />
              <span>Subscription Desk</span>
            </div>
            <h1 className="font-headline text-3xl sm:text-4xl font-bold text-[var(--text-primary)]">
              Subscribe to Your Morning Paper
            </h1>
            <p className="font-serif italic text-xs sm:text-sm text-[var(--text-secondary)] mt-1 max-w-md mx-auto">
              Curate real, verified news delivered daily in an elegant, quiet broadsheet.
            </p>
          </div>

          {/* Quick Demo Fill button */}
          <div className="mb-5 flex justify-end">
            <button
              type="button"
              onClick={handleQuickFill}
              className="text-xs text-[var(--accent-primary)] hover:opacity-80 underline font-medium flex items-center space-x-1 cursor-pointer"
            >
              <Sparkles className="w-3 h-3" />
              <span>Auto-fill Sample Subscriber Data</span>
            </button>
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
                Your Full Name
              </label>
              <input
                id="signup-name"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Sarah Lin"
                className="w-full px-3 py-2 text-sm bg-[var(--bg-page)] border border-[var(--border-subtle)] rounded text-[var(--text-primary)] focus:outline-hidden focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-sans font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
                Subscriber Email Address
              </label>
              <input
                id="signup-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="reader@example.com"
                className="w-full px-3 py-2 text-sm bg-[var(--bg-page)] border border-[var(--border-subtle)] rounded text-[var(--text-primary)] focus:outline-hidden focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-sans font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                id="signup-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                className="w-full px-3 py-2 text-sm bg-[var(--bg-page)] border border-[var(--border-subtle)] rounded text-[var(--text-primary)] focus:outline-hidden focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] font-sans"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-sans font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                  Custom Newspaper Title
                </label>
                <span className="text-[11px] text-[var(--accent-primary)] font-serif italic">
                  Shown in your masthead
                </span>
              </div>
              <input
                id="signup-papertitle"
                type="text"
                value={paperTitle}
                onChange={(e) => setPaperTitle(e.target.value)}
                placeholder="e.g. DAYMARK"
                className="w-full px-3 py-2 text-sm bg-[var(--bg-page)] border border-[var(--border-subtle)] rounded text-[var(--text-primary)] focus:outline-hidden focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] font-sans uppercase tracking-wider font-semibold"
              />
            </div>

            <button
              id="btn-signup-submit"
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-[var(--accent-primary)] hover:opacity-90 text-white font-sans text-xs font-semibold rounded tracking-wide transition-all shadow-xs flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 mt-4"
            >
              <span>{isLoading ? 'Setting Up Your Press...' : 'Subscribe & Calibrate Focus Desks →'}</span>
            </button>
          </form>

          {/* Footer note */}
          <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] text-center">
            <p className="text-xs text-[var(--text-secondary)] font-serif">
              Already have an account?{' '}
              <Link href={`/login${redirectParam ? `?redirect=${encodeURIComponent(redirectParam)}` : ''}`} className="text-[var(--accent-primary)] font-sans font-semibold hover:underline">
                Sign in to your press room
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
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
          Daymark — Verified News Wire • 100% Client-Side LocalStorage Auth
        </p>
      </footer>
    </div>
  );
}
