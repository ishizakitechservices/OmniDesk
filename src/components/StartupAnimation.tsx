/**
 * School AI — Original Startup & Loading Visual Identity
 * Combines flowing academic wave lines, orbital concentric rings, and soft luminous particles.
 * Shows authentic system telemetry milestones.
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Sparkles } from 'lucide-react';

interface StartupAnimationProps {
  onComplete: () => void;
  quickMode?: boolean;
}

const STAGES = [
  'Starting School AI workspace...',
  'Connecting secure multi-tenant database...',
  'Syncing school standards & institutional memory...',
  'Applying administrator workspace preferences...',
  'Workspace Ready',
];

export const StartupAnimation: React.FC<StartupAnimationProps> = ({ onComplete, quickMode = false }) => {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);

  useEffect(() => {
    const stageDuration = quickMode ? 350 : 600;
    const interval = setInterval(() => {
      setCurrentStageIndex((prev) => {
        if (prev < STAGES.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setTimeout(onComplete, quickMode ? 200 : 500);
          return prev;
        }
      });
    }, stageDuration);

    return () => clearInterval(interval);
  }, [onComplete, quickMode]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 text-white overflow-hidden select-none">
      {/* Background soft ambient glow */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-blue-600/15 blur-3xl -z-10 pointer-events-none" />
      <div className="absolute w-[300px] h-[300px] rounded-full bg-indigo-500/10 blur-2xl -z-10 pointer-events-none" />

      {/* Central Visual Identity: Flowing Wave + Orbital Concentric Rings */}
      <div className="relative w-48 h-48 flex items-center justify-center mb-8">
        {/* Outer Orbital Ring 1 */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 18, ease: 'linear' }}
          className="absolute inset-0 rounded-full border border-blue-500/20 border-dashed"
        />

        {/* Middle Orbital Ring 2 */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 12, ease: 'linear' }}
          className="absolute inset-4 rounded-full border border-indigo-400/30"
        />

        {/* Inner Luminous Ring 3 */}
        <motion.div
          animate={{ scale: [0.95, 1.05, 0.95], opacity: [0.4, 0.8, 0.4] }}
          transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
          className="absolute inset-8 rounded-full border border-sky-400/40 bg-blue-950/30"
        />

        {/* Flowing Organic Wave SVG */}
        <svg viewBox="0 0 100 100" className="w-24 h-24 text-sky-400 z-10 drop-shadow-[0_0_12px_rgba(56,189,248,0.5)]">
          <motion.path
            d="M 20 50 Q 35 30 50 50 T 80 50"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            animate={{
              d: [
                'M 20 50 Q 35 30 50 50 T 80 50',
                'M 20 50 Q 35 70 50 50 T 80 50',
                'M 20 50 Q 35 30 50 50 T 80 50',
              ],
            }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          />
          {/* Subtle Convergent Particle */}
          <motion.circle
            cx="50"
            cy="50"
            r="4.5"
            fill="#38BDF8"
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          />
        </svg>
      </div>

      {/* Brand Wordmark */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-1.5 text-center mb-6"
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold tracking-tight text-white font-sans">School AI</span>
          <span className="text-xs font-medium text-sky-400/90 bg-sky-950/60 border border-sky-800/40 px-2 py-0.5 rounded">
            V0.1
          </span>
        </div>
        <p className="text-xs text-slate-400 tracking-wide">
          St. Jude's Academy · Unified Administrative Intelligence
        </p>
      </motion.div>

      {/* Authentic Telemetry Milestones */}
      <div className="h-8 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStageIndex}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2 text-xs font-mono text-slate-300"
          >
            {currentStageIndex === STAGES.length - 1 ? (
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-sky-400 shrink-0 animate-pulse" />
            )}
            <span>{STAGES[currentStageIndex]}</span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Subtle Step Bar & Quick Skip */}
      <div className="flex flex-col items-center gap-3 mt-4">
        <div className="flex items-center gap-1.5">
          {STAGES.map((_, idx) => (
            <div
              key={idx}
              className={`h-1 rounded-full transition-all duration-300 ${
                idx <= currentStageIndex ? 'w-6 bg-sky-400' : 'w-2 bg-slate-700'
              }`}
            />
          ))}
        </div>

        <button
          onClick={onComplete}
          className="text-[11px] font-mono text-slate-400 hover:text-white transition-colors underline decoration-slate-600 underline-offset-4 mt-2"
        >
          Skip intro →
        </button>
      </div>
    </div>
  );
};
