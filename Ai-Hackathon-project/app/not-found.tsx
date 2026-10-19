'use client';

import React from 'react';
import Link from 'next/link';
import { Newspaper, LayoutGrid, ArrowLeft, Compass, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#07111F] text-[#F1F5FA] flex flex-col items-center justify-center p-6 font-serif">
      <div className="max-w-md w-full bg-[#0D1B2C] border border-[#20344B] rounded-xl p-8 shadow-2xl text-center">
        {/* Masthead Icon */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#526BFF]/15 text-[#526BFF] border border-[#526BFF]/30 mb-6">
          <Newspaper className="w-7 h-7" />
        </div>

        <div className="text-xs font-sans uppercase tracking-[0.25em] text-[#526BFF] font-bold mb-2">
          DAYMARK Broadsheet Archive
        </div>

        <h1 className="font-serif text-4xl sm:text-5xl font-medium tracking-tight text-[#F1F5FA] mb-4">
          404 Unfiled
        </h1>

        <p className="font-serif text-sm text-[#A4B3C7] leading-relaxed mb-8">
          The requested edition or section does not exist in our morning editorial wire or may have been archived.
        </p>

        {/* Working Destination Links */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 font-sans text-xs">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-lg bg-[#526BFF] hover:bg-[#3B54E6] text-white font-semibold transition-all shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Morning Wire</span>
          </Link>

          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-lg bg-[#12243A] hover:bg-[#20344B] text-[#F1F5FA] border border-[#20344B] font-semibold transition-colors"
          >
            <LayoutGrid className="w-4 h-4 text-[#4DB8E8]" />
            <span>Page Directory</span>
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-[#20344B] text-[11px] font-sans text-[#A4B3C7]">
          <span>DAYMARK Personalized Morning Newspaper • NaSCon&apos;26</span>
        </div>
      </div>
    </div>
  );
}
