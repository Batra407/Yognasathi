"use client";

import { useState } from "react";

/**
 * TranscriptionPanel
 * 
 * Displays live speech capture or editable text transcription with clear & submit controls.
 */
export default function TranscriptionPanel({
  transcript,
  isListening,
  onClear,
  onSubmit,
  onChange,
  isLoading = false,
  placeholder = "Spoken text will appear here in real time…",
}) {
  const [isEditing, setIsEditing] = useState(false);

  const wordCount = transcript ? transcript.trim().split(/\s+/).filter(Boolean).length : 0;

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFFFF] border border-[#E5EAF1] shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              isListening ? "bg-[#2563EB] animate-ping" : "bg-emerald-500"
            }`}
          />
          <span className="text-xs font-bold uppercase tracking-wider text-[#68758A]">
            {isListening ? "Live Speech Capture" : "Transcription Input"}
          </span>
          {wordCount > 0 && (
            <span className="text-[11px] font-semibold text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded-full">
              {wordCount} {wordCount === 1 ? "word" : "words"}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold">
          {transcript && !isEditing && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="text-[#2563EB] hover:text-[#1D4ED8] hover:underline"
            >
              Edit text
            </button>
          )}
          {isEditing && (
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-emerald-700 hover:underline"
            >
              Done editing
            </button>
          )}
          {transcript && (
            <button
              type="button"
              onClick={onClear}
              className="text-rose-600 hover:text-rose-800 hover:underline"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="relative">
        <textarea
          rows={3}
          value={transcript}
          onChange={(e) => onChange && onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E5EAF1] text-[#17243A] placeholder-[#94A3B8] text-sm focus:bg-white focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors resize-none leading-relaxed"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <span className="text-[11px] text-[#68758A]">
          {isListening ? "Speak continuously. The assistant captures your words." : "Review or edit before submitting."}
        </span>

        <button
          type="button"
          onClick={() => onSubmit && onSubmit(transcript)}
          disabled={isLoading || !transcript.trim()}
          className="px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-40 text-white font-bold text-xs sm:text-sm shadow-xs transition flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span>Processing...</span>
          ) : (
            <>
              <span>Find Matching Schemes</span>
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

