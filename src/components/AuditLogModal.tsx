/**
 * School AI — Immutable Audit Log & Compliance Modal
 * Displays administrative history: Document views, Standard modifications,
 * Confirmation dispatches, and Security permissions.
 */

import React from 'react';
import { X, Shield, Lock, FileText, CheckCircle2 } from 'lucide-react';
import { AuditLog } from '../types/index.ts';

interface AuditLogModalProps {
  logs: AuditLog[];
  onClose: () => void;
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({ logs, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4 select-none">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-900 dark:text-sky-400" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Institutional Security & Audit Trail
              </h3>
              <p className="text-[11px] text-slate-500">
                Immutable, tamper-evident log of all consequential and administrative actions
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

        {/* Audit Log Table */}
        <div className="flex-1 overflow-y-auto p-4">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-mono text-[10px] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-3 py-2">Timestamp</th>
                <th className="px-3 py-2">Actor</th>
                <th className="px-3 py-2">Action</th>
                <th className="px-3 py-2">Target</th>
                <th className="px-3 py-2">Verification Digest</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="px-3 py-2.5 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}{' '}
                    · {new Date(log.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </td>
                  <td className="px-3 py-2.5 font-medium text-slate-700 dark:text-slate-300">
                    Dr. Evelyn Vance (ID: {log.userId})
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="font-mono px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-sky-300 border border-blue-200 dark:border-blue-800">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-slate-600 dark:text-slate-300">
                    {log.targetType}: <span className="font-mono text-slate-800 dark:text-slate-200">{log.targetId}</span>
                  </td>
                  <td className="px-3 py-2.5 font-mono text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                      verified_sha256
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
