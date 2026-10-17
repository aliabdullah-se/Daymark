'use client';

import React from 'react';
import { Printer, X, FileText, CheckCircle2 } from 'lucide-react';

interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmPrint: () => void;
  newspaperTitle: string;
}

export default function PrintPreviewModal({
  isOpen,
  onClose,
  onConfirmPrint,
  newspaperTitle,
}: PrintPreviewModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150 no-print">
      <div 
        className="bg-paper-50 border-2 border-ink-900 rounded-lg shadow-2xl max-w-md w-full p-6 text-center"
        role="dialog"
        aria-modal="true"
        aria-labelledby="print-dialog-title"
      >
        <div className="w-12 h-12 bg-amber-100 border border-amber-300 rounded-full flex items-center justify-center mx-auto mb-3">
          <Printer className="w-6 h-6 text-ink-900" />
        </div>

        <h3 id="print-dialog-title" className="text-xl font-headline font-bold text-ink-900 mb-1">
          Print or Save as Broadsheet PDF
        </h3>

        <p className="text-xs font-serif text-ink-600 mb-4 leading-relaxed">
          Your custom morning edition of <strong className="text-ink-900">{newspaperTitle}</strong> has been formatted with authentic print broadsheet styling.
        </p>

        {/* Tip Box */}
        <div className="p-3.5 bg-paper-100 border border-paper-300 rounded-md text-left text-xs font-sans space-y-2 mb-5">
          <div className="flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-green-700 shrink-0 mt-0.5" />
            <p className="text-ink-800">
              In your browser&apos;s print prompt, set <strong>Destination</strong> to <strong>&ldquo;Save as PDF&rdquo;</strong>.
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-green-700 shrink-0 mt-0.5" />
            <p className="text-ink-800">
              For authentic broadsheet formatting, enable <strong>&ldquo;Background graphics&rdquo;</strong> in More settings.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-paper-300 rounded text-xs font-sans text-ink-700 hover:bg-paper-100"
          >
            Cancel
          </button>
          <button
            id="confirm-print-action"
            type="button"
            onClick={() => {
              onConfirmPrint();
              onClose();
            }}
            className="px-5 py-2 bg-ink-900 hover:bg-black text-white rounded text-xs font-sans font-bold shadow flex items-center space-x-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Open Print Dialog</span>
          </button>
        </div>
      </div>
    </div>
  );
}
