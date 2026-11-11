"use client";

import { useState } from "react";
import { evaluateEligibility } from "@/lib/government/eligibility-engine";

/**
 * SchemeEligibilityChecker
 * 
 * Interactive, deterministic eligibility screening component directly on the scheme details page.
 * Evaluates user responses against verified government rules in PostgreSQL.
 * Premium White + Navy + Blue design.
 */
export default function SchemeEligibilityChecker({ scheme, rules = [] }) {
  const verifiedRules = (rules || []).filter((r) => r && r.isVerified);

  // Derive relevant fields across all rules for this scheme
  const hasAge = verifiedRules.some((r) => r.ageMin !== null || r.ageMax !== null);
  const minAge = verifiedRules.reduce((min, r) => (r.ageMin !== null ? Math.min(min, r.ageMin) : min), Infinity);
  const maxAge = verifiedRules.reduce((max, r) => (r.ageMax !== null ? Math.max(max, r.ageMax) : max), -Infinity);

  const hasGender = verifiedRules.some((r) => r.gender && r.gender.trim() !== "" && r.gender.toLowerCase() !== "all");
  const requiredGender = verifiedRules.find((r) => r.gender && r.gender.toLowerCase() !== "all")?.gender || null;

  const hasState = verifiedRules.some((r) => r.state && r.state.trim() !== "");
  const requiredState = scheme?.state || verifiedRules.find((r) => r.state)?.state || null;

  const hasIncome = verifiedRules.some((r) => r.annualIncomeMax !== null);
  const maxIncome = verifiedRules.find((r) => r.annualIncomeMax !== null)?.annualIncomeMax || null;

  const hasOccupation = verifiedRules.some((r) => r.occupation && r.occupation.trim() !== "");
  const requiredOccupation = verifiedRules.find((r) => r.occupation)?.occupation || null;

  const hasDisability = verifiedRules.some((r) => r.disabilityStatus && r.disabilityStatus.trim() !== "");
  const hasCategory = verifiedRules.some((r) => r.category && r.category.trim() !== "");

  const specialConditions = verifiedRules
    .map((r) => r.specialConditions)
    .filter(Boolean);

  // Form State
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [state, setState] = useState(requiredState || "");
  const [annualIncome, setAnnualIncome] = useState("");
  const [occupation, setOccupation] = useState("");
  const [isDisability, setIsDisability] = useState("no");
  const [casteCategory, setCasteCategory] = useState("General");
  const [agreedToConditions, setAgreedToConditions] = useState(false);

  // Result state
  const [evaluation, setEvaluation] = useState(null);
  const [hasEvaluated, setHasEvaluated] = useState(false);

  if (verifiedRules.length === 0) {
    return (
      <div className="p-5 bg-[#F8FAFC] rounded-2xl border border-[#E5EAF1] text-[#68758A] space-y-2">
        <div className="flex items-center gap-2 text-[#2563EB] font-semibold text-xs sm:text-sm">
          <span>ℹ</span>
          <span>Official Criteria Under Verification</span>
        </div>
        <p className="text-xs text-[#68758A] leading-relaxed">
          Structured eligibility rules are currently being verified against official gazetted notifications for this scheme. Please refer to the eligibility criteria text below or consult the official government portal.
        </p>
      </div>
    );
  }

  const handleEvaluate = (e) => {
    e.preventDefault();

    const profile = {};
    if (age !== "" && !isNaN(parseInt(age, 10))) {
      profile.age = parseInt(age, 10);
    }
    if (gender) {
      profile.gender = gender.toLowerCase();
    }
    if (state) {
      profile.state = state;
    }
    if (annualIncome !== "" && !isNaN(parseFloat(annualIncome))) {
      profile.annualIncome = parseFloat(annualIncome);
    }
    if (occupation) {
      profile.occupation = occupation.toLowerCase();
    }
    if (hasDisability) {
      profile.disabilityStatus = isDisability === "yes" ? "Disabled" : "None";
    }
    if (casteCategory) {
      profile.category = casteCategory;
    }

    try {
      const result = evaluateEligibility(profile, verifiedRules, scheme.id);
      setEvaluation(result);
      setHasEvaluated(true);
    } catch (err) {
      console.warn("Eligibility evaluation notice:", err);
    }
  };

  const handleReset = () => {
    setAge("");
    setGender("");
    setState(requiredState || "");
    setAnnualIncome("");
    setOccupation("");
    setIsDisability("no");
    setCasteCategory("General");
    setAgreedToConditions(false);
    setEvaluation(null);
    setHasEvaluated(false);
  };

  const isEligible = evaluation?.eligibilityStatus === "ELIGIBLE";
  const isNotEligible = evaluation?.eligibilityStatus === "NOT_ELIGIBLE";

  const applicationUrl = scheme.officialApplicationUrl || scheme.officialUrl;

  return (
    <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5EAF1] p-5 sm:p-6 space-y-6 shadow-xs">
      <div className="border-b border-[#E5EAF1] pb-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB] flex items-center justify-center font-bold text-sm">
              ✓
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#14233B]">
                Check Your Eligibility Online
              </h3>
              <p className="text-xs text-[#68758A]">
                Answer scheme-specific questions to check against verified government rules.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            Verified Rules Engine
          </span>
        </div>
      </div>

      {/* Interactive Form */}
      <form onSubmit={handleEvaluate} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Age Input */}
          {hasAge && (
            <div className="space-y-1.5">
              <label htmlFor="eval-age" className="block text-xs font-semibold text-[#17243A]">
                Your Age (in years)
                {minAge !== Infinity && (
                  <span className="text-[#2563EB] ml-1 font-normal">
                    (Min: {minAge}{maxAge !== -Infinity ? `, Max: ${maxAge}` : "+"})
                  </span>
                )}
              </label>
              <input
                id="eval-age"
                type="number"
                min="1"
                max="120"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Enter your age (e.g. 35)"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E5EAF1] text-[#17243A] text-sm focus:bg-white focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition"
              />
            </div>
          )}

          {/* Gender Input */}
          {hasGender && (
            <div className="space-y-1.5">
              <label htmlFor="eval-gender" className="block text-xs font-semibold text-[#17243A]">
                Gender
                {requiredGender && (
                  <span className="text-[#2563EB] ml-1 font-normal capitalize">
                    (Target: {requiredGender})
                  </span>
                )}
              </label>
              <select
                id="eval-gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E5EAF1] text-[#17243A] text-sm focus:bg-white focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          )}

          {/* State Residence */}
          {hasState && (
            <div className="space-y-1.5">
              <label htmlFor="eval-state" className="block text-xs font-semibold text-[#17243A]">
                State of Residence
                {requiredState && (
                  <span className="text-[#2563EB] ml-1 font-normal">
                    (Must be {requiredState})
                  </span>
                )}
              </label>
              <select
                id="eval-state"
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E5EAF1] text-[#17243A] text-sm focus:bg-white focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition"
              >
                <option value="">Select state</option>
                <option value="Punjab">Punjab</option>
                <option value="Haryana">Haryana</option>
                <option value="Other">Other State</option>
              </select>
            </div>
          )}

          {/* Annual Family Income */}
          {hasIncome && (
            <div className="space-y-1.5">
              <label htmlFor="eval-income" className="block text-xs font-semibold text-[#17243A]">
                Annual Family Income (₹)
                {maxIncome && (
                  <span className="text-[#2563EB] ml-1 font-normal">
                    (Ceiling: ₹{Number(maxIncome).toLocaleString("en-IN")})
                  </span>
                )}
              </label>
              <input
                id="eval-income"
                type="number"
                min="0"
                step="1000"
                value={annualIncome}
                onChange={(e) => setAnnualIncome(e.target.value)}
                placeholder="e.g. 150000"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E5EAF1] text-[#17243A] text-sm focus:bg-white focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition"
              />
            </div>
          )}

          {/* Occupation */}
          {hasOccupation && (
            <div className="space-y-1.5">
              <label htmlFor="eval-occ" className="block text-xs font-semibold text-[#17243A]">
                Occupation / Livelihood
                {requiredOccupation && (
                  <span className="text-[#2563EB] ml-1 font-normal capitalize">
                    (Target: {requiredOccupation})
                  </span>
                )}
              </label>
              <select
                id="eval-occ"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E5EAF1] text-[#17243A] text-sm focus:bg-white focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition"
              >
                <option value="">Select occupation</option>
                <option value="farmer">Farmer / Agriculture</option>
                <option value="unorganized worker">Construction / Unorganized Worker</option>
                <option value="student">Student</option>
                <option value="homestay operator">Homestay / Tourism Operator</option>
                <option value="sportsperson">Sportsperson</option>
                <option value="other">Other / Not Listed</option>
              </select>
            </div>
          )}

          {/* Disability Status */}
          {hasDisability && (
            <div className="space-y-1.5">
              <label htmlFor="eval-disability" className="block text-xs font-semibold text-[#17243A]">
                Disability Certificate Holder?
              </label>
              <select
                id="eval-disability"
                value={isDisability}
                onChange={(e) => setIsDisability(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E5EAF1] text-[#17243A] text-sm focus:bg-white focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition"
              >
                <option value="no">No</option>
                <option value="yes">Yes (40% or more certified disability)</option>
              </select>
            </div>
          )}

          {/* Social Category */}
          {hasCategory && (
            <div className="space-y-1.5">
              <label htmlFor="eval-category" className="block text-xs font-semibold text-[#17243A]">
                Social / Economic Category
              </label>
              <select
                id="eval-category"
                value={casteCategory}
                onChange={(e) => setCasteCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E5EAF1] text-[#17243A] text-sm focus:bg-white focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition"
              >
                <option value="General">General</option>
                <option value="SC">Scheduled Caste (SC)</option>
                <option value="BC">Backward Class (BC)</option>
                <option value="BPL">Below Poverty Line (BPL)</option>
                <option value="EWS">Economically Weaker Section (EWS)</option>
              </select>
            </div>
          )}
        </div>

        {/* Special Conditions Confirmation */}
        {specialConditions.length > 0 && (
          <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E5EAF1] space-y-2">
            <span className="text-xs font-bold text-[#14233B] block">
              Official Scheme Conditions:
            </span>
            <ul className="text-xs text-[#68758A] space-y-1 list-disc pl-4">
              {specialConditions.map((cond, idx) => (
                <li key={idx} className="leading-relaxed">{cond}</li>
              ))}
            </ul>
            <label className="flex items-start gap-2.5 pt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToConditions}
                onChange={(e) => setAgreedToConditions(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-[#2563EB] focus:ring-blue-500"
              />
              <span className="text-xs text-[#17243A] font-medium">
                I confirm that I meet the above criteria and have necessary official documents.
              </span>
            </label>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-sm transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <span>Evaluate My Eligibility</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>

          {hasEvaluated && (
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2.5 rounded-xl border border-[#E5EAF1] hover:bg-slate-100 text-[#68758A] hover:text-[#17243A] text-xs font-semibold transition cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </form>

      {/* Evaluation Results Banner */}
      {hasEvaluated && evaluation && (
        <div
          className={`p-5 rounded-2xl border space-y-3 transition-all ${
            isEligible
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : isNotEligible
              ? "bg-rose-50 border-rose-200 text-rose-900"
              : "bg-amber-50 border-amber-200 text-amber-900"
          }`}
          role="region"
          aria-live="polite"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                  isEligible
                    ? "bg-emerald-600 text-white"
                    : isNotEligible
                    ? "bg-rose-600 text-white"
                    : "bg-amber-600 text-white"
                }`}
              >
                {isEligible ? "✓" : isNotEligible ? "✕" : "⚠"}
              </span>
              <div>
                <h4 className="text-sm sm:text-base font-bold">
                  {isEligible
                    ? "Appears Eligible Based on Your Stated Information"
                    : isNotEligible
                    ? "Appears Ineligible Based on Specific Criteria"
                    : "Cannot Determine Eligibility (Incomplete Details)"}
                </h4>
                <p className="text-xs opacity-90 mt-0.5">
                  {isEligible
                    ? "Your inputs meet the verified eligibility rules on record for this scheme."
                    : isNotEligible
                    ? "One or more of your responses do not fulfill the official requirements."
                    : "Please complete all required fields to evaluate eligibility."}
                </p>
              </div>
            </div>
          </div>

          {/* Criteria Breakdown */}
          <div className="space-y-1.5 pt-2 text-xs">
            {evaluation.matchedCriteria?.length > 0 && (
              <div className="space-y-1">
                <span className="font-bold text-emerald-800 block">Criteria Fulfilled:</span>
                {evaluation.matchedCriteria.map((c, i) => (
                  <div key={i} className="flex items-center gap-1.5 pl-3">
                    <span className="text-emerald-700 font-bold">✓</span>
                    <span className="capitalize">{c.field}</span>: {String(c.userValue)} (Requirement met)
                  </div>
                ))}
              </div>
            )}

            {evaluation.failedCriteria?.length > 0 && (
              <div className="space-y-1 pt-1">
                <span className="font-bold text-rose-800 block">Unmet Criteria:</span>
                {evaluation.failedCriteria.map((c, i) => (
                  <div key={i} className="flex items-center gap-1.5 pl-3">
                    <span className="text-rose-700 font-bold">✕</span>
                    <span className="capitalize">{c.field}</span>: You entered {String(c.userValue)}, which does not satisfy the official rule.
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action CTA if Eligible */}
          {isEligible && applicationUrl && (
            <div className="pt-3 border-t border-emerald-200 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-emerald-800 font-medium">
                Ready to proceed? Apply directly through the official government portal:
              </span>
              <a
                href={applicationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition inline-flex items-center gap-1.5 shadow-xs"
              >
                <span>Proceed to Official Application Portal</span>
                <span>↗</span>
              </a>
            </div>
          )}

          {/* Disclaimer */}
          <p className="text-[11px] opacity-80 pt-2 border-t border-current/10 leading-relaxed">
            <strong>Informational Screening Notice:</strong> This eligibility evaluation is an automated screening tool provided by YojanaSathi using officially published guidelines. It does not replace the official application process, constitute legal approval, or guarantee government disbursement. The final decision rests solely with the competent government authority upon review of your original verification documents.
          </p>
        </div>
      )}
    </div>
  );
}
