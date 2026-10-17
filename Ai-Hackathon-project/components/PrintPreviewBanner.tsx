'use client';

import React from 'react';
import { Printer, CheckCircle2 } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-xs animate-in fade-in duration-150 no-print">
      <div 
        className="bg-ivory-100 border border-ivory-300 rounded-lg shadow-2xl max-w-md w-full p-6 text-center"
        role="dialog"
        aria-modal="true"
        aria-labelledby="print-dialog-title"
      >
        <div className="w-12 h-12 bg-forest-50 border border-forest-200 rounded-full flex items-center justify-center mx-auto mb-3">
          <Printer className="w-6 h-6 text-forest-700" />
        </div>

        <h3 id="print-dialog-title" className="text-xl font-headline font-bold text-charcoal-900 mb-1">
          Export as Broadsheet PDF
        </h3>

        <p className="text-xs font-serif italic text-charcoal-600 mb-4 leading-relaxed">
          Your personalized edition of <strong className="text-charcoal-900 font-sans not-italic font-bold">{newspaperTitle}</strong> is formatted for clean broadsheet print and digital archiving.
        </p>

        {/* Tip Box */}
        <div className="p-3.5 bg-ivory-200/50 border border-ivory-300 rounded-md text-left text-xs font-sans space-y-2 mb-5">
          <div className="flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-forest-600 shrink-0 mt-0.5" />
            <p className="text-charcoal-800">
              In the browser prompt, select Destination: <strong>&ldquo;Save as PDF&rdquo;</strong>.
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-forest-600 shrink-0 mt-0.5" />
            <p className="text-charcoal-800">
              In More Settings, enable <strong>&ldquo;Background graphics&rdquo;</strong> for authentic paper tone.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-ivory-300 rounded text-xs font-sans text-charcoal-600 hover:bg-ivory-200"
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
            className="px-5 py-2 bg-forest-600 hover:bg-forest-700 text-white rounded text-xs font-sans font-medium shadow-xs flex items-center space-x-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Open Print Dialog</span>
          </button>
        </div>
      </div>
    </div>
  );
}
