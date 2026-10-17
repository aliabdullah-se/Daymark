'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Newspaper, UserPlus, ArrowRight, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getStoredUsers, saveStoredUser, setCurrentUser, getStoredPreferences, saveStoredPreferences, addLearningSignal } from '@/lib/storage';
import { UserAccount } from '@/types/news';

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [paperTitle, setPaperTitle] = useState('THE MORNING CHRONICLE');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanTitle = paperTitle.trim() || 'DAYMARK';

    if (!cleanName) {
      setError('Please provide your full name for the newspaper masthead.');
      return;
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid subscriber email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    const existingUsers = getStoredUsers();
    if (existingUsers.some((u) => u.email.toLowerCase() === cleanEmail)) {
      setError('A subscriber with this email already exists. Please sign in instead.');
      setIsLoading(false);
      return;
    }

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

    // Seed default preferences for the new subscriber
    const currentPrefs = getStoredPreferences();
    saveStoredPreferences({
      ...currentPrefs,
      readerName: cleanName,
      newspaperTitle: cleanTitle.toUpperCase(),
      onboarded: false, // will go to onboarding next
    });

    // Record initial learning signal
    addLearningSignal({
      type: 'calibrate',
      articleTitle: `Subscription Initialized: ${cleanTitle.toUpperCase()}`,
      impactDescription: `New broadsheet created for ${cleanName}. Redirecting to intellectual focus calibration.`,
    });

    // Redirect to Onboarding
    router.push('/onboarding');
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
            href="/login"
            className="text-xs font-sans font-medium text-forest-700 hover:text-forest-900 transition-colors"
          >
            Already Subscribed? Sign In →
          </Link>
        </div>
      </header>

      {/* Main Form Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-lg bg-white border border-ivory-300 rounded shadow-xs p-6 sm:p-8 relative">
          {/* Masthead Banner */}
          <div className="text-center mb-6 border-b border-ivory-200 pb-5">
            <div className="inline-flex items-center space-x-1 text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-forest-700 mb-1.5">
              <UserPlus className="w-3.5 h-3.5" />
              <span>Subscription Desk</span>
            </div>
            <h1 className="font-headline text-3xl sm:text-4xl font-bold text-charcoal-900">
              Subscribe to Your Morning Paper
            </h1>
            <p className="font-serif italic text-xs sm:text-sm text-charcoal-600 mt-1 max-w-md mx-auto">
              Curate real, verified news delivered daily in an elegant, quiet broadsheet designed for deep thinkers.
            </p>
          </div>

          {/* Benefits Strip */}
          <div className="grid grid-cols-3 gap-2 mb-6 bg-ivory-50 border border-ivory-200 rounded p-3 text-center text-[11px] font-sans text-charcoal-700">
            <div>
              <span className="font-bold block text-forest-800">PKR 0 Cost</span>
              <span className="text-charcoal-500 font-serif italic">100% Free Forever</span>
            </div>
            <div className="border-x border-ivory-200">
              <span className="font-bold block text-forest-800">Zero AI Jargon</span>
              <span className="text-charcoal-500 font-serif italic">Real Verified Wire</span>
            </div>
            <div>
              <span className="font-bold block text-forest-800">Local Privacy</span>
              <span className="text-charcoal-500 font-serif italic">In-Browser Storage</span>
            </div>
          </div>

          {/* Error Alert */}
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
                Your Full Name
              </label>
              <input
                id="signup-name"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Eleanor Vance"
                className="w-full px-3 py-2 text-sm bg-ivory-50 border border-ivory-300 rounded text-charcoal-900 focus:outline-hidden focus:border-forest-600 focus:ring-1 focus:ring-forest-600 font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-sans font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
                Subscriber Email Address
              </label>
              <input
                id="signup-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="reader@example.com"
                className="w-full px-3 py-2 text-sm bg-ivory-50 border border-ivory-300 rounded text-charcoal-900 focus:outline-hidden focus:border-forest-600 focus:ring-1 focus:ring-forest-600 font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-sans font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
                Create Password
              </label>
              <input
                id="signup-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-3 py-2 text-sm bg-ivory-50 border border-ivory-300 rounded text-charcoal-900 focus:outline-hidden focus:border-forest-600 focus:ring-1 focus:ring-forest-600 font-sans"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-sans font-semibold text-charcoal-700 uppercase tracking-wider">
                  Custom Newspaper Title
                </label>
                <span className="text-[11px] text-forest-700 font-serif italic">
                  Shown in your masthead
                </span>
              </div>
              <input
                id="signup-papertitle"
                type="text"
                value={paperTitle}
                onChange={(e) => setPaperTitle(e.target.value)}
                placeholder="e.g. THE MORNING CHRONICLE"
                className="w-full px-3 py-2 text-sm bg-ivory-50 border border-ivory-300 rounded text-charcoal-900 focus:outline-hidden focus:border-forest-600 focus:ring-1 focus:ring-forest-600 font-sans uppercase tracking-wider font-semibold"
              />
            </div>

            <button
              id="btn-signup-submit"
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-forest-700 hover:bg-forest-800 text-white font-sans text-xs font-semibold rounded tracking-wide transition-all shadow-xs flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 mt-4"
            >
              <span>{isLoading ? 'Setting Up Your Press...' : 'Continue to Personalize Focus Areas'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Footer note */}
          <div className="mt-6 pt-4 border-t border-ivory-200 text-center">
            <p className="text-xs text-charcoal-500 font-serif">
              Already have an account?{' '}
              <Link href="/login" className="text-forest-700 font-sans font-semibold hover:underline">
                Sign in to your press room
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
