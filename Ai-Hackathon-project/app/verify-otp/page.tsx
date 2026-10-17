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
        setSuccessMsg(data.message || 'Fresh OTP code dispatched!');
        if (data.demoOtpCode) {
          setDispatchedCode(data.demoOtpCode);
        }
      } else {
        setError(data.message || 'Failed to dispatch OTP.');
      }
    } catch {
      setError('Network error while requesting code.');
    } finally {
      setIsResending(false);
    }
  };

  const handleQuickFillJudge = () => {
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
    <div className="min-h-screen bg-[#F7F5EF] text-[#20211F] flex flex-col justify-between selection:bg-[#496653] selection:text-white">
      {/* Top Broadsheet Masthead Banner */}
      <header className="border-b border-[#20211F]/20 py-5 bg-[#F7F5EF]">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-3">
            <Newspaper className="w-6 h-6 text-[#496653] group-hover:rotate-[-6deg] transition-transform" />
            <span className="font-serif text-2xl tracking-widest font-black uppercase text-[#20211F]">
              Daymark
            </span>
          </Link>
          <div className="text-right">
            <span className="text-xs uppercase tracking-widest font-mono text-[#20211F]/70">
              Security Desk • OTP Verification
            </span>
          </div>
        </div>
      </header>

      {/* Main Verification Card */}
      <main className="flex-1 max-w-lg w-full mx-auto px-4 py-12 flex flex-col justify-center">
        <div className="bg-white border border-[#20211F]/20 shadow-[0_4px_24px_rgba(32,33,31,0.06)] p-8 sm:p-10 relative">
          {/* Broadsheet Corner Stamp */}
          <div className="absolute top-0 right-0 border-l border-b border-[#20211F]/20 bg-[#F7F5EF] px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-[#496653] font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified Dispatch
          </div>

          <div className="text-center mb-6">
            <h1 className="font-serif text-3xl font-black tracking-tight text-[#20211F] uppercase mb-2">
              Subscriber Verification
            </h1>
            <p className="text-sm text-[#20211F]/75 font-serif leading-relaxed">
              Enter the 6-digit Press Verification OTP code dispatched to confirm your identity.
            </p>
          </div>

          {/* Quick-fill Demo Box for Hackathon Judges */}
          <div className="mb-6 p-3.5 bg-[#496653]/10 border border-[#496653]/30 rounded-none text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#496653] uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                Hackathon Judge Quick-Fill
              </div>
              <button
                type="button"
                onClick={handleQuickFillJudge}
                className="text-xs font-mono font-bold bg-[#496653] text-white px-2.5 py-1 hover:bg-[#3d5545] transition-colors"
              >
                1-Click Fill (742891)
              </button>
            </div>
            <p className="text-xs text-[#20211F]/75 mt-1 font-serif">
              Pre-authorized demo code: <strong className="font-mono text-[#496653]">742891</strong> for{' '}
              <span className="font-mono">{email || 'judge@nascon2026.org'}</span>.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <label className="block text-xs uppercase font-mono tracking-wider text-[#20211F]/70 mb-1">
                Subscriber Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="subscriber@example.org"
                className="w-full px-3 py-2 text-sm bg-[#F7F5EF]/60 border border-[#20211F]/30 focus:border-[#496653] focus:outline-none font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-mono tracking-wider text-[#20211F]/70 mb-3 text-center">
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
                    className="w-12 h-14 text-center font-mono text-2xl font-black bg-[#F7F5EF] border-2 border-[#20211F]/30 focus:border-[#496653] focus:bg-white focus:outline-none transition-all"
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || otpDigits.join('').length < 6}
              className="w-full py-3.5 bg-[#20211F] text-white hover:bg-[#496653] disabled:opacity-50 transition-colors flex items-center justify-center gap-2 uppercase tracking-widest text-xs font-bold"
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

            <div className="flex items-center justify-between pt-2 border-t border-[#20211F]/10 text-xs">
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                className="font-mono text-[#496653] hover:underline flex items-center gap-1"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                {isResending ? 'Dispatching...' : 'Resend Code'}
              </button>
              <Link href="/login" className="font-serif text-[#20211F]/60 hover:text-[#20211F]">
                Back to Sign In
              </Link>
            </div>
          </form>
        </div>
      </main>

      {/* Broadsheet Footer */}
      <footer className="border-t border-[#20211F]/20 py-4 text-center text-xs font-serif text-[#20211F]/60">
        Daymark Editorial Dispatch System • Cryptographic Press Verification v1.0
      </footer>
    </div>
  );
}
