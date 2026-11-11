"use client";

import { useState } from "react";
import Link from "next/link";
import EligibilityBadge from "./EligibilityBadge";
import SourceBadge from "./SourceBadge";
import EligibilityDetailsModal from "./EligibilityDetailsModal";

export default function SchemeCard({ scheme }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!scheme) return null;

  // Safety guard: budget accounting entries must never appear as welfare recommendations.
  if (scheme.recordType === "BUDGET_ACCOUNTING_ENTRY") {
    return null;
  }

  const isCitizenScheme = scheme.recordType === "CITIZEN_WELFARE_SCHEME";
  const isPending = scheme.recordType === "PENDING_CLASSIFICATION" || !scheme.recordType;

  // Relevance score as a display value — labeled as "Rank" not "Match %"
  const relevanceDisplay = scheme.relevanceScore !== undefined
    ? Number(scheme.relevanceScore).toFixed(2)
    : "—";

  const hasDescription = scheme.description && scheme.description.trim().length > 0;
  const hasPlainSummary = scheme.plainLanguageSummary && scheme.plainLanguageSummary.trim().length > 0;
  const hasBenefits = scheme.benefits && scheme.benefits.trim().length > 0;
  const hasTargetBeneficiaries = scheme.targetBeneficiaries && scheme.targetBeneficiaries.trim().length > 0;
  const hasState = scheme.state && scheme.state.trim().length > 0;
  const hasMatchReasons = scheme.matchReasons && scheme.matchReasons.length > 0;
  const hasMatchedTerms = scheme.matchedTerms && scheme.matchedTerms.length > 0;

  // Compact jurisdiction label
  const jurisdictionLabel = hasState
    ? `${scheme.state} State`
    : isCitizenScheme
    ? "Central Government"
    : "Union Budget Scheme";

  return (
    <>
      <article className="p-5 sm:p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5EAF1] hover:border-[#93C5FD] shadow-xs hover:shadow-md transition-all duration-200 space-y-4 group flex flex-col justify-between h-full">

        <div className="space-y-4">
          {/* Top Header Row */}
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1.5 flex-grow min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#2563EB] truncate">
                  {scheme.department || "Government Department"}
                </span>

                {/* Jurisdiction badge */}
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    hasState
                      ? "bg-blue-50 text-[#2563EB] border-blue-200"
                      : isCitizenScheme
                      ? "bg-slate-100 text-slate-700 border-slate-200"
                      : "bg-slate-50 text-slate-500 border-slate-200"
                  }`}
                >
                  {jurisdictionLabel}
                </span>

                {/* Verification status for citizen schemes */}
                {isCitizenScheme && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    ✓ Verified
                  </span>
                )}
              </div>

              <h4 className="text-base sm:text-lg font-bold text-[#14233B] group-hover:text-[#2563EB] transition-colors leading-snug">
                {scheme.schemeName}
              </h4>
            </div>

            {/* Relevance Rank */}
            <div className="flex flex-col items-end shrink-0">
              <span className="px-2.5 py-1 rounded-lg bg-[#EFF6FF] text-[#2563EB] font-mono font-bold text-xs border border-[#BFDBFE]">
                {relevanceDisplay}
              </span>
              <span className="text-[10px] text-[#68758A] mt-0.5">Relevance</span>
            </div>
          </div>

          {/* Why this scheme matches the request */}
          <div className="text-xs text-[#17243A] bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E5EAF1] space-y-1.5">
            <div className="font-semibold text-[#2563EB] flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-[#2563EB] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Why this scheme matches:</span>
            </div>
            <p className="text-[#68758A] pl-5 leading-relaxed">
              {hasMatchReasons ? (
                scheme.matchReasons.slice(0, 3).join("; ") + "."
              ) : hasMatchedTerms ? (
                <>
                  Matched keywords:{" "}
                  <span className="text-[#17243A] font-semibold">
                    {scheme.matchedTerms.slice(0, 5).join(", ")}
                  </span>
                  {hasState ? `. Applies in ${scheme.state}.` : "."}
                </>
              ) : (
                "Matched scheme criteria in your circumstances."
              )}
            </p>
          </div>

          {/* Plain language summary or description */}
          {(hasPlainSummary || hasDescription) && (
            <p className="text-xs text-[#68758A] leading-relaxed line-clamp-3">
              {hasPlainSummary ? scheme.plainLanguageSummary : scheme.description}
            </p>
          )}

          {/* Eligibility Status Evaluation */}
          <div className="pt-0.5">
            <EligibilityBadge
              eligibilityStatus={scheme.eligibilityStatus}
              eligibilityRulesAvailable={scheme.eligibilityRulesAvailable}
              showExplanation
            />
          </div>

          {/* Who can benefit */}
          {hasTargetBeneficiaries && (
            <div className="text-xs text-[#17243A] bg-[#F1F5F9] px-3 py-2 rounded-lg border border-[#E2E8F0]">
              <span className="font-semibold text-[#14233B]">Target Group: </span>
              <span className="text-[#68758A]">{scheme.targetBeneficiaries}</span>
            </div>
          )}

          {/* Verified Benefits */}
          {hasBenefits && (
            <div className="text-xs text-emerald-800 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
              <span className="font-bold text-emerald-900">Verified Benefit: </span>
              <span>{scheme.benefits}</span>
            </div>
          )}
        </div>

        {/* Footer Meta & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E5EAF1] text-xs">
          <div className="flex items-center gap-3">
            <SourceBadge
              officialSource={scheme.officialSource}
              rulesAvailable={scheme.eligibilityRulesAvailable}
            />

            {scheme.lastVerifiedAt && (
              <span className="text-[11px] text-[#68758A]">
                Verified: {new Date(scheme.lastVerifiedAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {scheme.officialUrl && (
              <a
                href={scheme.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#17243A] border border-[#E5EAF1] text-xs font-semibold transition-all inline-flex items-center gap-1.5"
                aria-label={`Open official government portal for ${scheme.schemeName}`}
              >
                <span>Official Portal</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}

            <Link
              href={`/schemes/${scheme.schemeId}`}
              className="px-4 py-1.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
              aria-label={`View full scheme details for ${scheme.schemeName}`}
            >
              <span>View Details</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </article>

      {/* Details Modal */}
      <EligibilityDetailsModal
        scheme={scheme}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
