"use client";

import Link from "next/link";

/**
 * SchemeListingCard — citizen-facing card for the /schemes listing page & homepage discovery.
 *
 * Supports both clean light mode and dark Scale AI cinematic mode.
 * Only displays information actually available from the API response.
 * Budget accounting entries (recordType === BUDGET_ACCOUNTING_ENTRY) are guarded.
 */
export default function SchemeListingCard({ scheme, dark = false }) {
  if (!scheme) return null;

  if (scheme.recordType === "BUDGET_ACCOUNTING_ENTRY") {
    return null;
  }

  const isCitizenScheme = scheme.recordType === "CITIZEN_WELFARE_SCHEME";
  const isPending = scheme.recordType === "PENDING_CLASSIFICATION" || !scheme.recordType;

  const hasDescription = scheme.description && scheme.description.trim().length > 0;
  const hasPlainSummary = scheme.plainLanguageSummary && scheme.plainLanguageSummary.trim().length > 0;
  const hasBenefits = scheme.benefits && scheme.benefits.trim().length > 0;
  const hasEligibility = scheme.eligibilityText && scheme.eligibilityText.trim().length > 0;
  const hasTargetBeneficiaries = scheme.targetBeneficiaries && scheme.targetBeneficiaries.trim().length > 0;
  const hasOfficialUrl = scheme.officialUrl && scheme.officialUrl.trim().length > 0;
  const hasState = scheme.state && scheme.state.trim().length > 0;
  const hasSchemeLevel = scheme.schemeLevel && scheme.schemeLevel.trim().length > 0;
  const hasVerification = scheme.verificationStatus && scheme.verificationStatus.trim().length > 0;

  // Verification badge configuration
  let verificationBadge = null;
  if (isCitizenScheme && hasVerification) {
    const status = scheme.verificationStatus.toUpperCase();
    if (status.includes("VERIFIED")) {
      verificationBadge = { label: "Verified Official", color: "emerald" };
    } else if (status.includes("PARTIAL")) {
      verificationBadge = { label: "Partially verified", color: "amber" };
    } else {
      verificationBadge = { label: "Awaiting verification", color: "slate" };
    }
  } else if (isCitizenScheme) {
    verificationBadge = { label: "Verified Official", color: "emerald" };
  } else if (isPending) {
    verificationBadge = { label: "Details pending review", color: "slate" };
  }

  if (dark) {
    return (
      <article className="group flex flex-col h-full bg-[#101010] rounded-2xl border border-[#262626] hover:border-[#F5A623]/60 shadow-xs hover:shadow-[0_0_25px_rgba(245,166,35,0.12)] transition-all duration-300 overflow-hidden">
        {/* Top Accent Indicator */}
        <div
          className={`h-1 ${
            isCitizenScheme ? "bg-gradient-to-r from-[#F5A623] to-[#FFC66B]" : "bg-[#262626]"
          }`}
          aria-hidden="true"
        />

        <div className="flex flex-col flex-1 p-5 sm:p-6 space-y-4">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#F5A623] leading-tight flex-1 truncate">
                {scheme.department?.name || "Ministry / Department"}
              </span>

              {/* Verification badge */}
              {verificationBadge && (
                <span
                  className={`shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border whitespace-nowrap ${
                    verificationBadge.color === "emerald"
                      ? "bg-[#142918] border-[#22C55E]/40 text-[#4ADE80]"
                      : verificationBadge.color === "amber"
                      ? "bg-[#291F12] border-[#F5A623]/40 text-[#F5A623]"
                      : "bg-[#1A1A1A] border-[#262626] text-[#B8B8B8]"
                  }`}
                >
                  {verificationBadge.color === "emerald" && <span className="mr-1">✓</span>}
                  {verificationBadge.label}
                </span>
              )}
            </div>

            <h3 className="text-base sm:text-lg font-bold text-white leading-snug group-hover:text-[#FFC66B] transition-colors">
              {scheme.schemeName}
            </h3>
          </div>

          {/* Description */}
          {hasPlainSummary || hasDescription ? (
            <p className="text-xs text-[#B8B8B8] leading-relaxed line-clamp-3">
              {hasPlainSummary ? scheme.plainLanguageSummary : scheme.description}
            </p>
          ) : (
            <p className="text-xs text-[#737373] italic">
              Scheme description pending official verification.
            </p>
          )}

          {/* Tags row */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {hasState && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-[#151515] border border-[#262626] text-[#F5A623]">
                📍 {scheme.state}
              </span>
            )}
            {hasSchemeLevel && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-[#151515] border border-[#262626] text-[#B8B8B8]">
                {scheme.schemeLevel}
              </span>
            )}
            {!hasState && !hasSchemeLevel && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-[#151515] border border-[#262626] text-[#B8B8B8]">
                Central Government
              </span>
            )}
            {hasEligibility && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-[#142918] border border-[#22C55E]/40 text-[#4ADE80]">
                Rules Verified
              </span>
            )}
          </div>

          {/* Target beneficiaries */}
          {hasTargetBeneficiaries && (
            <div className="text-xs bg-[#151515] px-3 py-2 rounded-xl border border-[#262626]">
              <span className="text-white font-semibold">Target: </span>
              <span className="text-[#B8B8B8]">{scheme.targetBeneficiaries}</span>
            </div>
          )}

          {/* Main benefit */}
          {hasBenefits && (
            <div className="text-xs bg-[#142918]/60 px-3 py-2 rounded-xl border border-[#22C55E]/30">
              <span className="font-bold text-[#4ADE80]">Benefit: </span>
              <span className="line-clamp-2 text-[#D1FAE5]">{scheme.benefits}</span>
            </div>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Action row */}
          <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#262626]">
            {hasOfficialUrl ? (
              <a
                href={scheme.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-[#F5A623] hover:text-[#FFC66B] font-mono underline underline-offset-2 transition-colors truncate max-w-[140px]"
                aria-label={`Official website for ${scheme.schemeName}`}
              >
                Official site ↗
              </a>
            ) : (
              <span className="text-[11px] text-[#737373] italic">Official link pending</span>
            )}

            <Link
              href={`/schemes/${scheme.id}`}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#151515] hover:bg-[#202020] border border-[#262626] hover:border-[#F5A623] text-white text-xs font-semibold transition-all shrink-0 cursor-pointer"
              aria-label={`View full details for ${scheme.schemeName}`}
            >
              <span>View Details</span>
              <svg className="w-3.5 h-3.5 text-[#F5A623]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex flex-col h-full bg-[#FFFFFF] rounded-2xl border border-[#E5EAF1] hover:border-[#93C5FD] shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Top Accent Indicator */}
      <div
        className={`h-1 ${
          isCitizenScheme
            ? "bg-[#2563EB]"
            : "bg-slate-300"
        }`}
        aria-hidden="true"
      />

      <div className="flex flex-col flex-1 p-5 sm:p-6 space-y-4">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#2563EB] leading-tight flex-1 truncate">
              {scheme.department?.name || "Ministry / Department"}
            </span>

            {/* Verification badge */}
            {verificationBadge && (
              <span
                className={`shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap ${
                  verificationBadge.color === "emerald"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : verificationBadge.color === "amber"
                    ? "bg-amber-50 border-amber-200 text-amber-700"
                    : "bg-slate-100 border-slate-200 text-slate-600"
                }`}
              >
                {verificationBadge.color === "emerald" && <span className="mr-1">✓</span>}
                {verificationBadge.label}
              </span>
            )}
          </div>

          <h3 className="text-base sm:text-lg font-bold text-[#14233B] leading-snug group-hover:text-[#2563EB] transition-colors">
            {scheme.schemeName}
          </h3>
        </div>

        {/* Description */}
        {hasPlainSummary || hasDescription ? (
          <p className="text-xs text-[#68758A] leading-relaxed line-clamp-3">
            {hasPlainSummary ? scheme.plainLanguageSummary : scheme.description}
          </p>
        ) : (
          <p className="text-xs text-[#94A3B8] italic">
            Scheme description pending official verification.
          </p>
        )}

        {/* Tags row */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {hasState && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 border border-blue-200 text-[#2563EB]">
              📍 {scheme.state}
            </span>
          )}
          {hasSchemeLevel && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 border border-slate-200 text-slate-700">
              {scheme.schemeLevel}
            </span>
          )}
          {!hasState && !hasSchemeLevel && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 border border-slate-200 text-slate-700">
              Central Government
            </span>
          )}
          {hasEligibility && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 border border-emerald-200 text-emerald-700">
              Rules Verified
            </span>
          )}
        </div>

        {/* Target beneficiaries */}
        {hasTargetBeneficiaries && (
          <div className="text-xs text-[#17243A] bg-[#F8FAFC] px-3 py-2 rounded-xl border border-[#E5EAF1]">
            <span className="text-[#14233B] font-semibold">Target Beneficiaries: </span>
            <span className="text-[#68758A]">{scheme.targetBeneficiaries}</span>
          </div>
        )}

        {/* Main benefit */}
        {hasBenefits && (
          <div className="text-xs text-emerald-800 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
            <span className="font-bold text-emerald-900">Benefit: </span>
            <span className="line-clamp-2">{scheme.benefits}</span>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Action row */}
        <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#E5EAF1]">
          {hasOfficialUrl ? (
            <a
              href={scheme.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-[#2563EB] hover:text-[#1D4ED8] font-medium underline underline-offset-2 transition-colors truncate max-w-[140px]"
              aria-label={`Official website for ${scheme.schemeName}`}
            >
              Official site ↗
            </a>
          ) : (
            <span className="text-[11px] text-[#94A3B8] italic">Official link pending</span>
          )}

          <Link
            href={`/schemes/${scheme.id}`}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 shrink-0 shadow-xs"
            aria-label={`View full details for ${scheme.schemeName}`}
          >
            <span>View Details</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}
