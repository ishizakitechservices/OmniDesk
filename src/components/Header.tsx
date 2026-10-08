/**
 * School AI — Top Bar Contract
 * Zone 1: Single text wordmark with school identity
 * Zone 2: Clean unboxed navigation tabs
 * Zone 3: Workspace connection mode, School tenant selector, and User Profile
 */

import React from 'react';
import {
  Building2,
  Calendar,
  FileCheck,
  BookOpen,
  Shield,
  Layers,
  Sparkles,
  CloudOff,
  Cloud,
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'workspace' | 'standards' | 'knowledge' | 'calendar' | 'audit';
  setActiveTab: (tab: 'workspace' | 'standards' | 'knowledge' | 'calendar' | 'audit') => void;
  sandboxMode: boolean;
  setSandboxMode: (enabled: boolean) => void;
  onOpenUiSettings: () => void;
  onOpenProfile: () => void;
  currentUser?: { fullName?: string; email: string };
  currentMembership?: { jobTitle?: string; permissionLevel?: string };
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  sandboxMode,
  setSandboxMode,
  onOpenUiSettings,
  onOpenProfile,
  currentUser,
  currentMembership,
}) => {
  const initials = (currentUser?.fullName || 'Staff Member')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || 'SM';
  return (
    <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 md:px-6 flex items-center justify-between shrink-0 select-none z-20">
      {/* Zone 1: Brand Wordmark & School Tenancy */}
      <div className="flex items-center gap-3">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('workspace');
          }}
          className="flex items-center gap-2 group"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-900 flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:bg-blue-800 transition-colors">
            SA
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white leading-none">
              School AI
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium tracking-normal mt-0.5">
              St. Jude's Academy
            </span>
          </div>
        </a>
      </div>

      {/* Zone 2: Clean Navigation Tabs */}
      <nav className="hidden md:flex items-center gap-1">
        <button
          onClick={() => setActiveTab('workspace')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === 'workspace'
              ? 'text-blue-900 dark:text-sky-400 bg-blue-50 dark:bg-blue-950/60 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Workspace</span>
        </button>

        <button
          onClick={() => setActiveTab('standards')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === 'standards'
              ? 'text-blue-900 dark:text-sky-400 bg-blue-50 dark:bg-blue-950/60 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" />
          <span>Official Standards</span>
        </button>

        <button
          onClick={() => setActiveTab('knowledge')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === 'knowledge'
              ? 'text-blue-900 dark:text-sky-400 bg-blue-50 dark:bg-blue-950/60 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>School Knowledge</span>
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === 'calendar'
              ? 'text-blue-900 dark:text-sky-400 bg-blue-50 dark:bg-blue-950/60 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Calendar & Tasks</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === 'audit'
              ? 'text-blue-900 dark:text-sky-400 bg-blue-50 dark:bg-blue-950/60 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Audit Log</span>
        </button>
      </nav>

      {/* Zone 3: Connection Status, Dynamic UI & User Avatar */}
      <div className="flex items-center gap-2.5">
        {/* Google Workspace Sandbox vs Connected Toggle */}
        <button
          onClick={() => setSandboxMode(!sandboxMode)}
          title={
            sandboxMode
              ? 'Running in Sandbox Mode (Offline Simulation). Click to connect Google Workspace.'
              : 'Connected to Google Workspace. Click to toggle Sandbox.'
          }
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors border ${
            sandboxMode
              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/60'
              : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60'
          }`}
        >
          {sandboxMode ? (
            <>
              <CloudOff className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              <span>Sandbox Mode</span>
            </>
          ) : (
            <>
              <Cloud className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>Google Connected</span>
            </>
          )}
        </button>

        {/* Dynamic UI Settings Trigger */}
        <button
          onClick={onOpenUiSettings}
          title="Customize Workspace Layout & Theme"
          className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Sparkles className="w-4 h-4 text-slate-600 dark:text-slate-300" />
        </button>

        {/* User Identity Avatar */}
        <button
          onClick={onOpenProfile}
          title="Manage Working Context & Staff Identity"
          className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800 hover:opacity-85 transition-opacity text-left"
        >
          <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-sky-300 flex items-center justify-center text-xs font-bold ring-1 ring-blue-300 dark:ring-blue-700">
            {initials}
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-none">
              {currentUser?.fullName || 'Staff Member'}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              {currentMembership?.jobTitle || 'Context not yet set'}
            </span>
          </div>
        </button>
      </div>
    </header>
  );
};
