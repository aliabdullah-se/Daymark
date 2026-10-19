'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Newspaper, ShieldCheck, ArrowRight, RotateCw, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { getCurrentUser, setCurrentUser, saveStoredUser, saveStoredPreferences, getStoredPreferences, addLearningSignal, DEMO_JUDGE_USER } from '@/lib/storage';

export default function VerifyOtpPage() {
  const [email, setEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [redirectPath, setRedirectPath] = useState('/');
  const [dispatchedCode, setDispatchedCode] = useState<string | null>('742891');

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Read query params from URL
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlEmail = params.get('email');
      const redir = params.get('redirect');
      if (urlEmail) {
        setEmail(urlEmail);
      } else {
        const current = getCurrentUser();
        setEmail(current?.email || DEMO_JUDGE_USER.email);
      }
      if (redir) setRedirectPath(redir);
    }
  }, []);

  const handleDigitChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = val.slice(-1);
    setOtpDigits(newDigits);

    // Auto advance focus
    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const newDigits = [...otpDigits];
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setOtpDigits(newDigits);
    const focusIndex = Math.min(pasted.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleResend = async () => {
    if (!email) {
      setError('Please provide your subscriber email address.');
      return;
    }
    setIsResending(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(data.message || 'Fresh OTP code issued!');
        if (data.demoOtpCode) {
          setDispatchedCode(data.demoOtpCode);
        }
      } else {
        setError(data.message || 'Failed to send OTP.');
      }
    } catch {
      setError('Network error while requesting code.');
    } finally {
      setIsResending(false);
    }
  };

  const handleQuickFillDemo = () => {
    setEmail(DEMO_JUDGE_USER.email);
    setOtpDigits(['7', '4', '2', '8', '9', '1']);
    setDispatchedCode('742891');
    setError(null);
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const fullCode = otpDigits.join('');
    if (fullCode.length < 6) {
      setError('Please enter all 6 digits of your verification code.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: fullCode }),
      });

      const data = await res.json();

      if (data.success && data.user) {
        // Sync with local client storage
        saveStoredUser(data.user);
        setCurrentUser(data.user);

        const currentPrefs = getStoredPreferences();
        saveStoredPreferences({
          ...currentPrefs,
          readerName: data.user.name,
          newspaperTitle: data.user.paperTitle,
          onboarded: true,
        });

        // Set client cookie for immediate Next.js hydration
        document.cookie = `daymark_otp_verified=true; path=/; max-age=604800; SameSite=Lax`;

        addLearningSignal({
          type: 'calibrate',
          articleTitle: 'OTP Identity Verified',
          impactDescription: `Verified subscriber session for ${data.user.email} with cryptographic broadsheet token.`,
        });

        setSuccessMsg('Press credentials verified! Redirecting to Today\'s Paper...');
        setTimeout(() => {
          window.location.href = redirectPath;
        }, 400);
      } else {
        setError(data.message || 'Verification failed. Please check the code.');
        setIsLoading(false);
      }
    } catch {
      setError('Connection error verifying OTP. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] flex flex-col justify-between selection:bg-[var(--accent-primary)]/20 selection:text-[var(--accent-primary)]">
      {/* Top Broadsheet Masthead Banner */}
      <header className="border-b border-[var(--border-subtle)] py-5 bg-[var(--bg-surface)]/80 backdrop-blur-xs">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-3">
            <Newspaper className="w-6 h-6 text-[var(--accent-primary)] group-hover:rotate-[-6deg] transition-transform" />
            <span className="font-headline text-2xl tracking-widest font-black uppercase text-[var(--text-primary)]">
              Daymark
            </span>
          </Link>
          <div className="text-right">
            <span className="text-xs uppercase tracking-widest font-mono text-[var(--text-secondary)]">
              Security Desk • OTP Verification
            </span>
          </div>
        </div>
      </header>

      {/* Main Verification Card */}
      <main className="flex-1 max-w-lg w-full mx-auto px-4 py-12 flex flex-col justify-center">
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs p-8 sm:p-10 relative">
          {/* Broadsheet Corner Stamp */}
          <div className="absolute top-0 right-0 border-l border-b border-[var(--border-subtle)] bg-[var(--bg-page)] px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-[var(--accent-primary)] font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified Edition
          </div>

          <div className="text-center mb-6">
            <h1 className="font-headline text-3xl font-black tracking-tight text-[var(--text-primary)] uppercase mb-2">
              Subscriber Verification
            </h1>
            <p className="text-sm text-[var(--text-secondary)] font-serif leading-relaxed">
              Enter the 6-digit Press Verification OTP code issued to confirm your identity.
            </p>
          </div>

          {/* Quick-fill Demo Helper Box */}
          <div className="mb-6 p-3.5 bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/30 rounded-none text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--accent-primary)] uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                Sample Verification Code
              </div>
              <button
                type="button"
                onClick={handleQuickFillDemo}
                className="text-xs font-mono font-bold bg-[var(--accent-primary)] text-white px-2.5 py-1 hover:opacity-90 transition-opacity cursor-pointer"
              >
                1-Click Fill (742891)
              </button>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-1 font-serif">
              Pre-authorized demo code: <strong className="font-mono text-[var(--accent-primary)]">742891</strong> for{' '}
              <span className="font-mono">{email || 'reader@daymark.internal'}</span>.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <label className="block text-xs uppercase font-mono tracking-wider text-[var(--text-secondary)] mb-1">
                Subscriber Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="subscriber@example.org"
                className="w-full px-3 py-2 text-sm bg-[var(--bg-page)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-hidden font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-mono tracking-wider text-[var(--text-secondary)] mb-3 text-center">
                6-Digit Press OTP Code
              </label>
              <div className="flex justify-between gap-2 sm:gap-3">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    onPaste={handlePaste}
                    className="w-12 h-14 text-center font-mono text-2xl font-black bg-[var(--bg-page)] border-2 border-[var(--border-subtle)] focus:border-[var(--accent-primary)] focus:bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-hidden transition-all"
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || otpDigits.join('').length < 6}
              className="w-full py-3.5 bg-[var(--text-primary)] text-[var(--bg-page)] hover:bg-[var(--accent-primary)] hover:text-white disabled:opacity-50 transition-colors flex items-center justify-center gap-2 uppercase tracking-widest text-xs font-bold cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  Verifying Press Credentials...
                </>
              ) : (
                <>
                  Confirm & Enter Broadsheet
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)] text-xs">
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                className="font-mono text-[var(--accent-primary)] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                {isResending ? 'Sending...' : 'Resend Code'}
              </button>
              <Link href="/login" className="font-serif text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                Back to Sign In
              </Link>
            </div>
          </form>
        </div>
      </main>

      {/* Broadsheet Footer */}
      <footer className="border-t border-[var(--border-subtle)] py-4 text-center text-xs font-serif text-[var(--text-muted)] bg-[var(--bg-surface)]">
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
          DAYMARK Editorial Desk • Cryptographic Press Verification v1.0
        </p>
      </footer>
    </div>
  );
}
