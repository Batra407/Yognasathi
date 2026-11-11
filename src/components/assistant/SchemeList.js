"use client";

import SchemeCard from "./SchemeCard";

export default function SchemeList({ results = [] }) {
  const count = results.length;

  if (count === 0) {
    return (
      <div className="p-8 sm:p-12 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center font-bold text-xl">
          🔍
        </div>
        <div className="space-y-1.5 max-w-md mx-auto">
          <h4 className="text-base font-bold text-slate-900 dark:text-white">
            No matching schemes found in Dataset A
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            We couldn&apos;t find a closely matching scheme based on your current input.
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 max-w-lg mx-auto text-left space-y-1">
          <span className="font-bold text-slate-800 dark:text-slate-200 block">Suggestions:</span>
          <p>• Try describing your occupation (e.g., farmer, student, worker)</p>
          <p>• State your location (e.g., Punjab, Maharashtra, Delhi)</p>
          <p>• Mention your age and annual income</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <h4 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Recommended Schemes</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
              {count} {count === 1 ? "scheme" : "schemes"} found
            </span>
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {count} {count === 1 ? "scheme" : "schemes"} may be relevant to you based on your query
          </p>
        </div>
      </div>

      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
        {results.map((scheme, idx) => (
          <SchemeCard key={scheme.schemeId || idx} scheme={scheme} />
        ))}
      </div>
    </div>
  );
}
