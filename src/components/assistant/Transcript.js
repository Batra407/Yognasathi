"use client";

import { useState } from "react";

export default function Transcript({
  transcript,
  onConfirm,
  onClear,
  onRetry,
  isLoading = false
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(transcript);

  if (!transcript && !isEditing) return null;

  const currentText = isEditing ? editedText : transcript;

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          Speech Transcript
        </span>

        <div className="flex items-center gap-3 text-xs font-semibold">
          {!isEditing ? (
            <button
              type="button"
              onClick={() => {
                setEditedText(transcript);
                setIsEditing(true);
              }}
              className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Edit</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-slate-500 hover:underline"
            >
              Done Editing
            </button>
          )}

          <button
            type="button"
            onClick={onClear}
            className="text-rose-500 hover:text-rose-600 hover:underline"
          >
            Clear
          </button>
        </div>
      </div>

      {!isEditing ? (
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm font-medium leading-relaxed">
          &quot;{transcript}&quot;
        </div>
      ) : (
        <textarea
          rows={3}
          value={editedText}
          onChange={(e) => setEditedText(e.target.value)}
          className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-emerald-500 text-slate-900 dark:text-white text-sm focus:outline-none"
          placeholder="Modify captured speech text..."
        />
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <button
          type="button"
          onClick={onRetry}
          className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Speak Again</span>
        </button>

        <button
          type="button"
          onClick={() => onConfirm(currentText)}
          disabled={isLoading || !currentText.trim()}
          className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-1.5"
        >
          {isLoading ? (
            <span>Processing...</span>
          ) : (
            <>
              <span>Find Schemes</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
