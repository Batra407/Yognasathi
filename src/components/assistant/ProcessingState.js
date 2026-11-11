"use client";

import { useEffect, useState } from "react";

const STEPS = [
  "Understanding your request...",
  "Extracting relevant information...",
  "Finding government schemes...",
  "Checking verified eligibility..."
];

export default function ProcessingState({ isProcessing }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (!isProcessing) return;

    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 450);

    return () => {
      clearInterval(interval);
      setCurrentStepIndex(0);
    };
  }, [isProcessing]);

  if (!isProcessing) return null;

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-5">
      <div className="relative inline-flex items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
          <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-lg font-bold text-slate-900 dark:text-white">
          {STEPS[currentStepIndex]}
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Analyzing 637 real government schemes and verified eligibility rules
        </p>
      </div>

      <div className="max-w-md mx-auto space-y-2 pt-2">
        {STEPS.map((step, idx) => (
          <div key={idx} className="flex items-center gap-3 text-xs">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 transition-colors ${
              idx < currentStepIndex
                ? "bg-emerald-500 text-slate-950"
                : idx === currentStepIndex
                ? "bg-emerald-600 text-white animate-pulse"
                : "bg-slate-200 dark:bg-slate-800 text-slate-400"
            }`}>
              {idx < currentStepIndex ? "✓" : idx + 1}
            </div>
            <span className={`font-medium transition-colors ${
              idx <= currentStepIndex ? "text-slate-800 dark:text-slate-200" : "text-slate-400 dark:text-slate-600"
            }`}>
              {step}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
