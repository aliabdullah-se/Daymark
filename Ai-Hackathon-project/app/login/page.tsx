'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Newspaper, KeyRound, ArrowRight, ShieldCheck, Sparkles, User, AlertCircle } from 'lucide-react';
import { getStoredUsers, setCurrentUser, saveStoredPreferences, getStoredPreferences, DEMO_JUDGE_USER, addLearningSignal } from '@/lib/storage';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Pre-seed demo user into storage on render if not present
  useEffect(() => {
    getStoredUsers();
  }, []);

  const handleDemoJudgeLogin = () => {
    setIsLoading(true);
    setError(null);
    try {
      setCurrentUser(DEMO_JUDGE_USER);
      
      // Ensure preferences match judge profile
      const currentPrefs = getStoredPreferences();
      saveStoredPreferences({
        ...currentPrefs,
        readerName: DEMO_JUDGE_USER.name,
        newspaperTitle: DEMO_JUDGE_USER.paperTitle,
        onboarded: true,
      });

      addLearningSignal({
        type: 'calibrate',
        articleTitle: 'Judge Demo Session Activated',
        impactDescription: 'Loaded official NaSCon evaluation profile with verified live feeds.',
      });

      router.push('/');
    } catch (err: any) {
      setError('Unable to activate judge session');
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
    const user = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      setError('No subscriber found with this email. Please check your spelling or subscribe below.');
      setIsLoading(false);
      return;
    }

    if (user.password && user.password !== password) {
      setError('Incorrect password. Please try again or use the Instant Judge Login.');
      setIsLoading(false);
      return;
    }

    setCurrentUser(user);

    // Sync preferences with user account
    const currentPrefs = getStoredPreferences();
    saveStoredPreferences({
      ...currentPrefs,
      readerName: user.name,
      newspaperTitle: user.paperTitle || currentPrefs.newspaperTitle,
    });

    addLearningSignal({
      type: 'calibrate',
      articleTitle: `Subscriber Session: ${user.name}`,
      impactDescription: 'Authenticated reader account; calibrated personal reading queue.',
    });

    router.push('/');
  };

  return (
    <div className="min-h-screen bg-ivory-100 flex flex-col justify-between text-charcoal-900 font-sans selection:bg-forest-100 selection:text-forest-900">
      {/* Editorial Top Border */}
      <div className="h-1.5 bg-forest-700 w-full" />

      {/* Header */}
      <header className="border-b border-ivory-300 bg-ivory-50/70">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 group">
            <Newspaper className="w-5 h-5 text-forest-700 transition-transform group-hover:scale-105" />
            <span className="font-headline text-2xl font-bold tracking-tight text-charcoal-900">
              DAYMARK
            </span>
          </Link>
          <span className="text-xs font-serif italic text-charcoal-500 hidden sm:inline">
            The Digital Morning Broadsheet
          </span>
          <Link
            href="/signup"
            className="text-xs font-sans font-medium text-forest-700 hover:text-forest-900 transition-colors"
          >
            New Subscriber? Subscribe →
          </Link>
        </div>
      </header>

      {/* Main Content Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md bg-white border border-ivory-300 rounded shadow-xs p-6 sm:p-8 relative">
          {/* Masthead Tag */}
          <div className="text-center mb-6 border-b border-ivory-200 pb-5">
            <div className="inline-flex items-center space-x-1 text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-forest-700 mb-1.5">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Subscriber Access</span>
            </div>
            <h1 className="font-headline text-3xl font-bold text-charcoal-900">
              Sign In to the Press Room
            </h1>
            <p className="font-serif italic text-xs text-charcoal-600 mt-1">
              Enter your credentials to load your tailored morning broadsheet.
            </p>
          </div>

          {/* 1-CLICK INSTANT JUDGE DEMO ACCESS BUTTON */}
          <div className="mb-6 bg-forest-50/70 border border-forest-200 rounded p-4 text-center">
            <div className="flex items-center justify-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-forest-800 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-forest-600" />
              <span>NaSCon &apos;26 Hackathon Judges</span>
            </div>
            <p className="text-xs font-serif text-charcoal-600 mb-3">
              Skip typing credentials. Access a pre-calibrated morning paper with 1 click.
            </p>
            <button
              id="btn-judge-demo-login"
              type="button"
              onClick={handleDemoJudgeLogin}
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-forest-700 hover:bg-forest-800 text-white font-sans text-xs font-semibold rounded tracking-wide transition-all shadow-xs flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4 text-forest-200" />
              <span>Instant Demo Login (Judge Access)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="relative flex py-2 items-center mb-6">
            <div className="flex-grow border-t border-ivory-300" />
            <span className="flex-shrink mx-3 text-[10px] font-sans uppercase tracking-widest text-charcoal-400">
              Or sign in with email
            </span>
            <div className="flex-grow border-t border-ivory-300" />
          </div>

          {/* Inline Error Alert */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-sans font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
                Subscriber Email
              </label>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="reader@example.com"
                className="w-full px-3 py-2 text-sm bg-ivory-50 border border-ivory-300 rounded text-charcoal-900 focus:outline-hidden focus:border-forest-600 focus:ring-1 focus:ring-forest-600 font-sans"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-sans font-semibold text-charcoal-700 uppercase tracking-wider">
                  Password
                </label>
                <span className="text-[11px] text-charcoal-400 font-serif italic">
                  Min. 6 characters
                </span>
              </div>
              <input
                id="login-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 text-sm bg-ivory-50 border border-ivory-300 rounded text-charcoal-900 focus:outline-hidden focus:border-forest-600 focus:ring-1 focus:ring-forest-600 font-sans"
              />
            </div>

            <button
              id="btn-login-submit"
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-charcoal-900 hover:bg-black text-ivory-50 font-sans text-xs font-semibold rounded tracking-wide transition-all shadow-xs flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              <span>{isLoading ? 'Authorizing...' : 'Sign In to Press Room'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Footer note */}
          <div className="mt-6 pt-4 border-t border-ivory-200 text-center">
            <p className="text-xs text-charcoal-500 font-serif">
              New to Daymark?{' '}
              <Link href="/signup" className="text-forest-700 font-sans font-semibold hover:underline">
                Subscribe to your daily broadsheet
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Editorial Colophon */}
      <footer className="border-t border-ivory-300 py-4 bg-ivory-50 text-center text-[11px] font-sans text-charcoal-500">
        <p>Daymark — Verified News Wire • 100% Client-Side Persistence • NaSCon &apos;26</p>
      </footer>
    </div>
  );
}
