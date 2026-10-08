/**
 * School AI — Hardened Action Confirmation Modal
 * Strict human-in-the-loop security gate for consequential operations (email dispatch, deletions).
 * Binds user approval to the exact payload hash and challenge token.
 */

import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, AlertOctagon, X, Lock } from 'lucide-react';
import { ConfirmationChallengeRequest } from '../types/index.ts';

interface ConfirmationCardProps {
  challenge: ConfirmationChallengeRequest | null;
  onConfirmSuccess: () => void;
  onCancel: () => void;
}

export const ConfirmationCard: React.FC<ConfirmationCardProps> = ({
  challenge,
  onConfirmSuccess,
  onCancel,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!challenge) return null;

  const handleApproveAndSend = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/confirm-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeToken: challenge.challengeToken,
          challengeTokenHash: challenge.challengeTokenHash,
          userId: 1,
          schoolId: 1,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Confirmation failed.');
      }

      onConfirmSuccess();
    } catch (err: any) {
      console.error('Confirmation error:', err);
      setErrorMessage(err.message || 'Verification failure.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 select-none">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header Alert Banner */}
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Institutional Safety Gate
              </h3>
              <p className="text-[11px] text-amber-700 dark:text-amber-300 font-medium">
                Consequential External Operation Requires Manual Human Confirmation
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Bound Payload Details */}
        <div className="p-6 space-y-4 text-xs">
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl p-4 space-y-2.5">
            <div className="flex items-start justify-between gap-4">
              <span className="font-semibold text-slate-500 w-24">Action Type:</span>
              <span className="font-mono text-slate-900 dark:text-slate-100 uppercase font-semibold">
                {challenge.actionType}
              </span>
            </div>

            {challenge.payloadBindings.recipients && (
              <div className="flex items-start justify-between gap-4">
                <span className="font-semibold text-slate-500 w-24">Recipients:</span>
                <span className="font-mono text-slate-900 dark:text-slate-100 font-medium text-right">
                  {challenge.payloadBindings.recipients.join(', ')}
                </span>
              </div>
            )}

            {challenge.payloadBindings.subject && (
              <div className="flex items-start justify-between gap-4">
                <span className="font-semibold text-slate-500 w-24">Subject:</span>
                <span className="font-medium text-slate-900 dark:text-slate-100 text-right">
                  {challenge.payloadBindings.subject}
                </span>
              </div>
            )}

            {challenge.payloadBindings.bodySummary && (
              <div className="flex items-start justify-between gap-4 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                <span className="font-semibold text-slate-500 w-24">Content Digest:</span>
                <span className="text-slate-600 dark:text-slate-300 text-right italic line-clamp-2">
                  "{challenge.payloadBindings.bodySummary}..."
                </span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[10px] text-slate-400 font-mono">
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-400" />
                Payload Digest: {challenge.payloadDigest.substring(0, 16)}...
              </span>
              <span>Expires in 15 mins</span>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <p className="text-[11px] text-slate-500 leading-relaxed">
            By confirming, you authorize School AI to dispatch this communication externally to recipients on behalf of St. Jude's Academy. This action will be permanently recorded in the institutional audit log.
          </p>
        </div>

        {/* Modal Actions */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            Cancel / Abort
          </button>
          <button
            onClick={handleApproveAndSend}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Verifying Challenge...' : 'Approve & Send Now'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
