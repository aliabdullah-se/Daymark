'use client';

import React from 'react';
import { Printer, CheckCircle2 } from 'lucide-react';

export interface MagazineOption {
  id: string;
  name: string;
  sectionCode?: string;
  count: number;
}

interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmPrint: () => void;
  newspaperTitle?: string;
  editionName?: string;
  editionDate?: string;
  articleCount?: number;
  availableMagazines?: MagazineOption[];
  onSelectMagazine?: (id: string) => void;
  activeMagazineId?: string;
}

export default function PrintPreviewModal({
  isOpen,
  onClose,
  onConfirmPrint,
  newspaperTitle = 'DAYMARK',
  editionName = 'Daily Broadsheet Edition',
  editionDate,
  articleCount = 0,
  availableMagazines,
  onSelectMagazine,
  activeMagazineId,
}: PrintPreviewModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 no-print">
      <div 
        className="bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-xl shadow-2xl max-w-lg w-full p-6 text-center transition-colors duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="print-dialog-title"
      >
        <div className="w-12 h-12 bg-[var(--accent-subtle)] border border-[var(--accent-border)] rounded-full flex items-center justify-center mx-auto mb-3">
          <Printer className="w-6 h-6 text-[var(--accent-primary)]" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent-subtle)] border border-[var(--accent-border)] text-[11px] font-mono uppercase tracking-wider text-[var(--accent-text)] font-semibold mb-2">
          <span>{editionName}</span>
          {articleCount > 0 && <span>• {articleCount} stories</span>}
        </div>

        <h3 id="print-dialog-title" className="text-xl font-headline font-bold text-[var(--text-primary)] mb-1">
          Print / PDF Magazine Edition
        </h3>

        <p className="text-xs font-serif italic text-[var(--text-secondary)] mb-4 leading-relaxed">
          Exporting <strong className="text-[var(--text-primary)] font-sans not-italic font-bold">{editionName}</strong> from <strong className="text-[var(--text-primary)] font-sans not-italic font-bold">{newspaperTitle}</strong>. Only the masthead, date, and stories belonging to this specific magazine edition will be printed.
        </p>

        {/* Magazine Quick Selector if multiple available */}
        {availableMagazines && availableMagazines.length > 0 && onSelectMagazine && (
          <div className="mb-4 text-left p-3 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]">
            <span className="block text-[10px] font-sans font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">
              Select any favourite magazine to export:
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
              {availableMagazines.map((mag) => {
                const isActive = activeMagazineId === mag.id;
                return (
                  <button
                    key={mag.id}
                    type="button"
                    onClick={() => onSelectMagazine(mag.id)}
                    className={`px-2.5 py-1 text-xs font-sans rounded-md border transition-all cursor-pointer flex items-center space-x-1.5 ${
                      isActive
                        ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)] font-bold shadow-xs'
                        : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[var(--accent-primary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <span>{mag.sectionCode ? `${mag.sectionCode}: ` : ''}{mag.name}</span>
                    <span className="opacity-70 text-[10px]">({mag.count})</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tip Box */}
        <div className="p-3 bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-md text-left text-xs font-sans space-y-1.5 mb-5">
          <div className="flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-[var(--accent-primary)] shrink-0 mt-0.5" />
            <p className="text-[var(--text-secondary)] text-[11px]">
              In your browser&apos;s print prompt, choose Destination: <strong className="text-[var(--text-primary)]">&ldquo;Save as PDF&rdquo;</strong>.
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-[var(--accent-primary)] shrink-0 mt-0.5" />
            <p className="text-[var(--text-secondary)] text-[11px]">
              Sidebar, navigation bars, and website buttons are automatically stripped from the final export.
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-[var(--accent-primary)] shrink-0 mt-0.5" />
            <p className="text-[var(--text-secondary)] text-[11px]">
              Pure-white paper styling is preserved regardless of your active Dark or Midnight theme.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-[var(--border-subtle)] rounded text-xs font-sans text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] cursor-pointer"
          >
            Cancel
          </button>
          <button
            id="confirm-print-action"
            type="button"
            onClick={onConfirmPrint}
            className="px-5 py-2 bg-[var(--accent-primary)] hover:opacity-90 text-white rounded text-xs font-sans font-bold shadow-xs flex items-center space-x-1.5 transition-opacity cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Open Print Dialog</span>
          </button>
        </div>
      </div>
    </div>
  );
}
