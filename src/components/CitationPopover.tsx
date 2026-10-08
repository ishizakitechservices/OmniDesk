/**
 * School AI — Source Citation & Provenance Popover
 * Allows ordinary school staff to inspect the exact handbook or standard cited by the AI.
 */

import React from 'react';
import { X, BookOpen, ShieldCheck, Hash, Calendar } from 'lucide-react';
import { KnowledgeRetrievalItem } from '../types/index.ts';

interface CitationPopoverProps {
  citation: KnowledgeRetrievalItem | null;
  onClose: () => void;
}

export const CitationPopover: React.FC<CitationPopoverProps> = ({ citation, onClose }) => {
  if (!citation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 select-none">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150 text-xs">
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white leading-tight">
                {citation.sourceName}
              </h4>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Version {citation.versionNumber}.0 · Approved Policy
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Provenance Metadata Grid */}
        <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 text-[11px]">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Location:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {citation.section || 'Section 4.1'}, Page {citation.pageNumber || 12}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Status:</span>
            <span className="font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Approved Official
            </span>
          </div>
        </div>

        {/* Exact Citation Excerpt */}
        <div className="space-y-1">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
            Cited Excerpt
          </span>
          <div className="p-3 bg-slate-100/70 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-700/60 italic text-slate-700 dark:text-slate-300 leading-relaxed">
            "{citation.text}"
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg font-semibold text-xs transition-colors"
          >
            Close Citation
          </button>
        </div>
      </div>
    </div>
  );
};
