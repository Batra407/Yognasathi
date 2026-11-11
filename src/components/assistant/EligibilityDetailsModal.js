"use client";

import { useEffect } from "react";
import EligibilityBadge from "./EligibilityBadge";
import SourceBadge from "./SourceBadge";

export default function EligibilityDetailsModal({ scheme, isOpen, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !scheme) return null;

  const relevanceRank = scheme.relevanceScore !== undefined
    ? Number(scheme.relevanceScore).toFixed(2)
    : "0.50";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="scheme-details-title"
    >
      <div className="relative w-full max-w-3xl bg-[#12141e] rounded-3xl shadow-2xl border border-white/15 overflow-hidden my-8 max-h-[90vh] flex flex-col text-slate-100">
        
        {/* Header */}
        <div className="px-6 py-5 bg-[#171a26] border-b border-white/10 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                {scheme.department}
              </span>
              {scheme.state && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {scheme.state}
                </span>
              )}
            </div>
            <h3 id="scheme-details-title" className="text-lg sm:text-xl font-bold text-white mt-1">
              {scheme.schemeName}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close scheme details"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Status & Relevance Summary */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-wrap items-center justify-between gap-4">
            <EligibilityBadge
              eligibilityStatus={scheme.eligibilityStatus}
              eligibilityRulesAvailable={scheme.eligibilityRulesAvailable}
              showExplanation
            />

            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-xl bg-white/10 text-amber-300 font-mono text-xs font-bold border border-white/10">
                Relevance Index: {relevanceRank}
              </span>
              <SourceBadge officialSource={scheme.officialSource} rulesAvailable={scheme.eligibilityRulesAvailable} />
            </div>
          </div>

          {/* Description */}
          {scheme.description && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Scheme Overview
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed bg-black/30 p-4 rounded-2xl border border-white/5">
                {scheme.description}
              </p>
            </div>
          )}

          {/* Benefits */}
          {scheme.benefits && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Verified Citizen Benefits
              </h4>
              <p className="text-sm text-emerald-200 leading-relaxed bg-emerald-950/25 p-4 rounded-2xl border border-emerald-500/20">
                {scheme.benefits}
              </p>
            </div>
          )}

          {/* Matched Criteria */}
          {scheme.matchedCriteria && scheme.matchedCriteria.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <span>✓</span> Matched Criteria ({scheme.matchedCriteria.length})
              </h4>
              <ul className="space-y-1.5 text-xs">
                {scheme.matchedCriteria.map((criterion, idx) => (
                  <li key={idx} className="flex items-start gap-2 p-3 rounded-xl bg-emerald-950/30 text-emerald-200 border border-emerald-500/20">
                    <span className="font-bold">✓</span>
                    <span>{criterion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Missing Information Needed */}
          {scheme.missingInformation && scheme.missingInformation.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <span>⚠</span> Unverified Criteria ({scheme.missingInformation.length})
              </h4>
              <div className="p-3.5 rounded-xl bg-amber-950/30 text-amber-200 border border-amber-500/20 text-xs">
                <span className="font-semibold">More citizen information required: </span>
                <span className="capitalize">{scheme.missingInformation.join(", ")}</span>
              </div>
            </div>
          )}

          {/* Application Process */}
          {scheme.applicationProcess && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Application Guidance
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed bg-black/30 p-3.5 rounded-xl border border-white/5">
                {scheme.applicationProcess}
              </p>
            </div>
          )}

          {/* Official Source Link */}
          {scheme.officialUrl && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-amber-300 block">Verified Official Portal</span>
                <span className="text-[11px] text-slate-400 truncate block max-w-md">
                  {scheme.officialUrl}
                </span>
              </div>
              <a
                href={scheme.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shrink-0 flex items-center gap-1.5"
              >
                <span>Visit Portal</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#171a26] border-t border-white/10 flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
