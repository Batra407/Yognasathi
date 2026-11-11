"use client";

export default function EligibilityBadge({
  eligibilityStatus,
  eligibilityRulesAvailable = true,
  showExplanation = false,
}) {
  if (eligibilityRulesAvailable === false) {
    return (
      <div className="space-y-1">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200">
          <span>ℹ</span>
          <span>Eligibility criteria pending review</span>
        </span>
        {showExplanation && (
          <p className="text-xs text-slate-500 mt-1">
            Official guidelines are being reviewed for structured eligibility rules. Please check the official government portal for current requirements.
          </p>
        )}
      </div>
    );
  }

  if (eligibilityStatus === "ELIGIBLE") {
    return (
      <div className="space-y-1">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
          <span className="font-bold">✓</span>
          <span>Appears eligible based on your inputs</span>
        </span>
        {showExplanation && (
          <p className="text-xs text-emerald-800 mt-1">
            Your provided details meet the verified criteria on file. Final eligibility is determined by the administering department.
          </p>
        )}
      </div>
    );
  }

  if (eligibilityStatus === "NOT_ELIGIBLE") {
    return (
      <div className="space-y-1">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 font-bold text-xs border border-rose-200">
          <span className="font-bold">✕</span>
          <span>Appears ineligible based on stated criteria</span>
        </span>
        {showExplanation && (
          <p className="text-xs text-rose-800 mt-1">
            Your provided information does not meet one or more verified eligibility rules for this scheme.
          </p>
        )}
      </div>
    );
  }

  // INSUFFICIENT_INFORMATION or default fallback
  return (
    <div className="space-y-1">
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 font-semibold text-xs border border-amber-200">
        <span>⚠</span>
        <span>Additional details needed to determine eligibility</span>
      </span>
      {showExplanation && (
        <p className="text-xs text-amber-800/90 mt-1">
          Provide your age, income, state, or category to evaluate eligibility against verified scheme rules.
        </p>
      )}
    </div>
  );
}
