"use client";

import Link from "next/link";

export default function SchemeRecommendationCard({
  scheme,
  score = 0,
  matchReasons = [],
  eligibilityEvaluation = null,
  rank = 1
}) {
  if (!scheme) return null;

  const scorePercentage = Math.min(100, Math.round(Number(score || 0) * 100));
  const isBudget = scheme.recordType === "BUDGET_ACCOUNTING_ENTRY";
  const isVerified = scheme.sourceMapping?.status === "VERIFIED" || scheme.recordType === "CITIZEN_WELFARE_SCHEME";

  const eligibilityStatus = eligibilityEvaluation?.eligible;
  const statusLabel = eligibilityStatus === true 
    ? "Eligible" 
    : eligibilityStatus === false 
      ? "Not Eligible" 
      : "Check Criteria";

  const statusClass = eligibilityStatus === true
    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
    : eligibilityStatus === false
      ? "bg-red-50 text-red-800 border-red-200"
      : "bg-blue-50 text-blue-800 border-blue-200";

  return (
    <article className="card-interactive flex flex-col p-5 bg-white border border-[#E5EAF1] rounded-2xl shadow-sm hover:shadow-md transition-all">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200">
            #{rank}
          </span>
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${statusClass}`}>
            {statusLabel}
          </span>
          {scorePercentage > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
              {scorePercentage}% Relevance
            </span>
          )}
        </div>

        {/* Source Badge */}
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider ${
          isVerified
            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
            : "bg-slate-100 text-slate-600"
        }`}>
          {isVerified ? "Official Verified" : "Union Budget Record"}
        </span>
      </div>

      {/* Scheme Title */}
      <h4 className="text-base font-bold text-[#14233B] hover:text-blue-600 transition-colors line-clamp-2 mb-1.5">
        <Link href={`/schemes/${scheme.id}`}>
          {scheme.schemeName}
        </Link>
      </h4>

      {/* Department */}
      <p className="text-xs text-[#68758A] mb-3">
        {scheme.department?.name || "Central Government Ministry"}
      </p>

      {/* Match Reasons */}
      {matchReasons && matchReasons.length > 0 && (
        <div className="mb-3 p-2.5 rounded-xl bg-[#F7F9FC] border border-[#E5EAF1] text-xs">
          <p className="font-semibold text-[#14233B] text-[11px] mb-1 uppercase tracking-wider">
            Why this matched your profile:
          </p>
          <ul className="space-y-0.5 text-slate-600">
            {matchReasons.slice(0, 3).map((reason, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-blue-600 font-bold">•</span>
                <span className="line-clamp-1">{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Benefits summary or eligibility snippet */}
      {(scheme.benefitsSummary || scheme.eligibilityText) && (
        <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
          {scheme.benefitsSummary || scheme.eligibilityText}
        </p>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Card Actions */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
        {scheme.be20262027Crores ? (
          <div className="text-left">
            <span className="text-[10px] text-slate-400 block uppercase">Outlay</span>
            <span className="text-xs font-bold text-slate-700">₹{Number(scheme.be20262027Crores).toLocaleString('en-IN')} Cr</span>
          </div>
        ) : (
          <span className="text-[11px] text-slate-500 font-medium">Direct Benefit</span>
        )}

        <div className="flex items-center gap-2">
          {scheme.sourceUrl && (
            <a
              href={scheme.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"
              title="Official Portal"
              aria-label="Official Portal Link"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
          <Link
            href={`/schemes/${scheme.id}`}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors"
          >
            <span>View Scheme</span>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}

