/**
 * School AI — Temporal Domain Modal
 * Separates Calendar Events (Appointments), Tasks (Action Items), and Reminders (Alerts).
 */

import React, { useState } from 'react';
import { X, Calendar, CheckSquare, Bell, Clock, Plus, Check } from 'lucide-react';
import { CalendarEvent, Task, Reminder } from '../types/index.ts';

interface CalendarTasksModalProps {
  events: CalendarEvent[];
  tasks: Task[];
  reminders: Reminder[];
  onClose: () => void;
}

export const CalendarTasksModal: React.FC<CalendarTasksModalProps> = ({
  events,
  tasks,
  reminders,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'events' | 'tasks' | 'reminders'>('events');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4 select-none">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header with Segmented Tabs */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-blue-900 dark:text-sky-400" />
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setActiveTab('events')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  activeTab === 'events'
                    ? 'bg-white dark:bg-slate-700 text-blue-950 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Calendar Events ({events.length})
              </button>
              <button
                onClick={() => setActiveTab('tasks')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  activeTab === 'tasks'
                    ? 'bg-white dark:bg-slate-700 text-blue-950 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Actionable Tasks ({tasks.length})
              </button>
              <button
                onClick={() => setActiveTab('reminders')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  activeTab === 'reminders'
                    ? 'bg-white dark:bg-slate-700 text-blue-950 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Reminders ({reminders.length})
              </button>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Pane */}
        <div className="flex-1 p-6 overflow-y-auto space-y-3 text-xs">
          {/* TAB 1: CALENDAR EVENTS */}
          {activeTab === 'events' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-slate-500 font-medium">
                <span>Scheduled Appointments & School Meetings</span>
                <span className="font-mono text-[11px]">Sync: Local School AI Store</span>
              </div>
              {events.map((evt) => (
                <div
                  key={evt.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {evt.title}
                    </h4>
                    {evt.description && <p className="text-slate-500">{evt.description}</p>}
                    <div className="flex items-center gap-3 text-slate-500 font-mono text-[11px] pt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-blue-700" />
                        {new Date(evt.startTime).toLocaleDateString('en-GB', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                        })}{' '}
                        · {new Date(evt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} –{' '}
                        {new Date(evt.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {evt.location && <span>Location: {evt.location}</span>}
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded">
                    Confirmed
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: TASKS */}
          {activeTab === 'tasks' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-slate-500 font-medium">
                <span>Actionable Administrative Items</span>
              </div>
              {tasks.map((tsk) => (
                <div
                  key={tsk.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded border border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-400 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs">{tsk.title}</h4>
                      {tsk.description && <p className="text-slate-500 text-[11px] mt-0.5">{tsk.description}</p>}
                      {tsk.dueDate && (
                        <span className="text-[10px] font-mono text-slate-400 mt-1 block">
                          Due: {new Date(tsk.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                  </div>
                  <span
                    className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded font-bold ${
                      tsk.priority === 'urgent' || tsk.priority === 'high'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {tsk.priority}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: REMINDERS */}
          {activeTab === 'reminders' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-slate-500 font-medium">
                <span>Active Triggers & Notification Alerts</span>
              </div>
              {reminders.map((rem) => (
                <div
                  key={rem.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <Bell className="w-4 h-4 text-amber-600" />
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs">{rem.title}</h4>
                      <span className="text-[10px] font-mono text-slate-400">
                        Trigger: {new Date(rem.triggerTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono bg-blue-50 text-blue-800 px-2 py-0.5 rounded uppercase font-semibold">
                    {rem.deliveryStatus}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
