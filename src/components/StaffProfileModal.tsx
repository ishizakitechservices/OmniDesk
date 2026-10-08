/**
 * School AI — Staff Profile & Voluntary Working Context Modal
 * Implements Target Users Principle #2:
 * "The product is for school staff. Do NOT assume the user's job title during signup.
 * A new user simply has an account. The system may learn the user's working context through:
 * - conversational onboarding
 * - information voluntarily provided by the user
 * - authorized school administrator assignment"
 */

import React, { useState } from 'react';
import { X, User, Briefcase, Building2, Check, ShieldCheck, Sparkles } from 'lucide-react';
import { User as UserType, SchoolMembership, Department } from '../types/index.ts';

interface StaffProfileModalProps {
  user: UserType;
  membership?: SchoolMembership;
  departments: Department[];
  onSave: (updates: { fullName: string; jobTitle?: string; departmentId?: number }) => void;
  onClose: () => void;
}

const PRESET_PERSONAS = [
  {
    name: 'Dr. Evelyn Vance',
    title: 'Head of Administration',
    departmentId: 1,
    desc: 'Executive oversight, official school policies, and board reporting',
  },
  {
    name: 'Marcus Davies',
    title: 'Bursar & Finance Officer',
    departmentId: 2,
    desc: 'School budgets, departmental expenditure ledgers, and procurement',
  },
  {
    name: 'Mrs. Sarah Higgins',
    title: 'Year 4 Lead Teacher',
    departmentId: 3,
    desc: 'Curriculum delivery, parent communications, and student welfare',
  },
  {
    name: 'Clara Oswald',
    title: 'School Registrar',
    departmentId: 4,
    desc: 'Student admissions, pupil attendance tracking, and term records',
  },
  {
    name: 'Dr. Arthur Bell',
    title: 'Head of Science Department',
    departmentId: 3,
    desc: 'Laboratory safety audits, STEM curricula, and equipment requisitions',
  },
  {
    name: 'New Staff Member',
    title: '',
    departmentId: undefined,
    desc: 'Blank context (identity learned conversationally in chat)',
  },
];

export const StaffProfileModal: React.FC<StaffProfileModalProps> = ({
  user,
  membership,
  departments,
  onSave,
  onClose,
}) => {
  const [fullName, setFullName] = useState(user.fullName || '');
  const [jobTitle, setJobTitle] = useState(membership?.jobTitle || '');
  const [departmentId, setDepartmentId] = useState<number | undefined>(membership?.departmentId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      fullName: fullName.trim() || 'Staff Member',
      jobTitle: jobTitle.trim() || undefined,
      departmentId,
    });
    onClose();
  };

  const handleApplyPreset = (preset: typeof PRESET_PERSONAS[0]) => {
    setFullName(preset.name);
    setJobTitle(preset.title);
    setDepartmentId(preset.departmentId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4 select-none">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-blue-900 dark:text-sky-300 flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Staff Profile & Working Context
              </h3>
              <p className="text-[11px] text-slate-500">
                School AI never presumes role titles; working context is voluntary or learned conversationally
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {/* Quick Staff Presets */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Fast Context Switcher (School Staff Use Cases)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_PERSONAS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    fullName === p.name && (jobTitle || '') === (p.title || '')
                      ? 'border-blue-900 dark:border-sky-400 bg-blue-50/70 dark:bg-blue-950/60 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{p.name}</div>
                  <div className="text-[10px] text-blue-900 dark:text-sky-400 font-medium">
                    {p.title || 'Neutral Staff Account'}
                  </div>
                  <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{p.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Manual Context Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 border-t border-slate-200 dark:border-slate-800 pt-4">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                Your Full Name / Honorific
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Dr. Evelyn Vance or Staff Member"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-1 focus:ring-blue-900 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                  Job Title / Working Role
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Bursar, Registrar, Teacher (optional)"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-1 focus:ring-blue-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                  Department Assignment
                </label>
                <select
                  value={departmentId || ''}
                  onChange={(e) => setDepartmentId(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-1 focus:ring-blue-900 outline-none"
                >
                  <option value="">Unassigned / Whole School</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-blue-900 dark:text-sky-400 shrink-0 mt-0.5" />
              <div className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                <strong>Conversational Onboarding Active:</strong> You can also simply say in chat:
                <br />
                <em>"I am Marcus, the school bursar"</em> or <em>"I teach Year 6 Science"</em>.
                School AI will quietly update your working context and adapt all generated documents and workflows.
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-semibold shadow-sm transition-colors"
              >
                Save Working Context
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
