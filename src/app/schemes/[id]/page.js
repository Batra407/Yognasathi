"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SchemeEligibilityChecker from "@/components/government/SchemeEligibilityChecker";

// ─────────────────────────────────────────────────────────────────────────────
// Document Categorization Helper
// ─────────────────────────────────────────────────────────────────────────────

function categorizeDocuments(documentsText) {
  if (!documentsText || !documentsText.trim()) {
    return { mandatory: [], conditional: [] };
  }

  const rawDocs = documentsText
    .split(/,|\n|•|–|-(?=\s)/)
    .map((d) => d.trim().replace(/^[\d.)\s-]+/, ""))
    .filter((d) => d.length > 2);

  const mandatoryKeywords = [
    "aadhaar",
    "parivar pehchan patra",
    "ppp",
    "family id",
    "domicile",
    "residence",
    "resident",
    "bank account",
    "passbook",
    "photograph",
    "photo",
    "identity proof",
    "id proof",
    "voter id",
    "age proof",
    "birth certificate",
  ];

  const conditionalKeywords = [
    "caste",
    "income",
    "disability",
    "medical",
    "udid",
    "land",
    "jamabandi",
    "marriage",
    "death certificate",
    "bocw",
    "merit",
    "marksheet",
    "school",
    "college",
    "proposal",
    "terms of reference",
    "sanction",
    "bill",
    "receipt",
    "ration card",
    "bpl",
    "certificate",
  ];

  const mandatory = [];
  const conditional = [];

  for (const doc of rawDocs) {
    const lower = doc.toLowerCase();
    const isMandatory = mandatoryKeywords.some((kw) => lower.includes(kw));
    const isConditional = conditionalKeywords.some((kw) => lower.includes(kw));

    if (isConditional && !isMandatory) {
      conditional.push(doc);
    } else if (isMandatory && !isConditional) {
      mandatory.push(doc);
    } else if (isConditional && isMandatory) {
      if (
        lower.includes("caste") ||
        lower.includes("income") ||
        lower.includes("disability") ||
        lower.includes("marriage") ||
        lower.includes("death") ||
        lower.includes("marksheet")
      ) {
        conditional.push(doc);
      } else {
        mandatory.push(doc);
      }
    } else {
      mandatory.push(doc);
    }
  }

  return { mandatory, conditional };
}

// ─────────────────────────────────────────────────────────────────────────────
// Application Mode Detection Helper
// ─────────────────────────────────────────────────────────────────────────────

function detectApplicationModes(processText, applicationUrl) {
  const modes = [];
  const text = `${processText || ""} ${applicationUrl || ""}`.toLowerCase();

  if (
    text.includes("online") ||
    text.includes("portal") ||
    text.includes("http") ||
    text.includes("saralharyana") ||
    text.includes("punjab.gov") ||
    text.includes("eservices")
  ) {
    modes.push({
      label: "Online Application Portal",
      description: "Direct online submission via official state or national e-services portal",
      icon: "🌐",
    });
  }

  if (
    text.includes("sewa kendra") ||
    text.includes("csc") ||
    text.includes("antyodaya kendra") ||
    text.includes("citizen service centre") ||
    text.includes("cdpo") ||
    text.includes("district") ||
    text.includes("deputy commissioner")
  ) {
    modes.push({
      label: "Assisted / Sewa Kendra / CSC",
      description: "In-person assisted application at local citizen service centres",
      icon: "🏢",
    });
  }

  if (
    text.includes("automatic") ||
    text.includes("no separate application") ||
    text.includes("electricity bill") ||
    text.includes("meter reading") ||
    text.includes("auto-adjusted")
  ) {
    modes.push({
      label: "Automatic Entitlement",
      description: "Direct rebate applied without requiring a separate application form",
      icon: "⚡",
    });
  }

  if (modes.length === 0) {
    modes.push({
      label: "Department Application",
      description: "Apply through designated departmental channels or administrative sanction",
      icon: "📋",
    });
  }

  return modes;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function InfoField({ label, value, className = "", highlight = false }) {
  return (
    <div className={`space-y-1 ${className}`}>
      <dt className="text-xs font-bold uppercase tracking-wider text-[#68758A]">{label}</dt>
      <dd>
        {value ? (
          <p
            className={`text-sm leading-relaxed whitespace-pre-line ${
              highlight ? "text-[#2563EB] font-semibold" : "text-[#17243A]"
            }`}
          >
            {value}
          </p>
        ) : (
          <p className="text-xs text-[#94A3B8] italic">Information pending verification from official government records</p>
        )}
      </dd>
    </div>
  );
}

function DetailSection({ id, title, children, icon, action, className = "" }) {
  return (
    <section
      id={id}
      className={`p-6 sm:p-7 bg-[#FFFFFF] rounded-2xl border border-[#E5EAF1] shadow-xs space-y-5 transition-all hover:border-[#93C5FD] ${className}`}
    >
      <div className="flex items-center justify-between gap-3 border-b border-[#E5EAF1] pb-3.5">
        <h2 className="flex items-center gap-2.5 text-base sm:text-lg font-bold text-[#14233B]">
          <span
            className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB] shrink-0"
            aria-hidden="true"
          >
            {icon}
          </span>
          {title}
        </h2>
        {action && <div>{action}</div>}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function FinancialRow({ label, value }) {
  const num = parseFloat(value);
  const formatted =
    !value || isNaN(num) || num === 0
      ? null
      : `₹${num.toLocaleString("en-IN", { maximumFractionDigits: 2 })} Crores`;

  return (
    <div className="flex items-center justify-between py-2 border-b border-[#E5EAF1] last:border-0">
      <span className="text-xs text-[#68758A] font-medium">{label}</span>
      <span className={`text-sm font-bold ${formatted ? "text-[#14233B]" : "text-slate-400 italic font-normal"}`}>
        {formatted || "—"}
      </span>
    </div>
  );
}

function VerificationBadge({ status, lastVerifiedAt }) {
  if (!status) return null;
  const upper = status.toUpperCase();
  let label, badgeClass;

  if (upper.includes("VERIFIED_OFFICIAL") || upper === "VERIFIED") {
    label = "Official Government Source Verified";
    badgeClass = "bg-emerald-50 border-emerald-200 text-emerald-800";
  } else if (upper.includes("PARTIAL")) {
    label = "Partially Verified";
    badgeClass = "bg-amber-50 border-amber-200 text-amber-800";
  } else {
    label = "Awaiting Verification";
    badgeClass = "bg-slate-100 border-slate-200 text-slate-700";
  }

  const formattedDate = lastVerifiedAt
    ? new Date(lastVerifiedAt).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <div className="inline-flex items-center gap-2 flex-wrap">
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badgeClass}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" aria-hidden="true" />
        {label}
      </span>
      {formattedDate && (
        <span className="text-xs text-[#68758A]">
          Last checked: <strong className="text-[#17243A]">{formattedDate}</strong>
        </span>
      )}
    </div>
  );
}

function DocumentCardGroup({ documentsText }) {
  if (!documentsText || !documentsText.trim()) return null;

  const { mandatory, conditional } = categorizeDocuments(documentsText);

  return (
    <div className="space-y-5">
      {/* Mandatory Documents */}
      {mandatory.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-[#EFF6FF] text-[#2563EB] text-xs font-bold flex items-center justify-center">
              !
            </span>
            <h3 className="text-xs font-bold text-[#14233B] uppercase tracking-wide">
              Mandatory Identity &amp; Residence Proofs
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {mandatory.map((doc, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E5EAF1] hover:border-[#93C5FD] transition-colors"
              >
                <span className="w-6 h-6 rounded-lg bg-[#EFF6FF] text-[#2563EB] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="text-xs sm:text-sm text-[#17243A] leading-relaxed font-medium">
                  {doc}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conditional / Category Verification Documents */}
      {conditional.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold flex items-center justify-center">
              §
            </span>
            <h3 className="text-xs font-bold text-[#14233B] uppercase tracking-wide">
              Conditional / Category-Specific Verification Documents
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {conditional.map((doc, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E5EAF1] hover:border-emerald-200 transition-colors"
              >
                <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  ✓
                </span>
                <span className="text-xs sm:text-sm text-[#17243A] leading-relaxed font-medium">
                  {doc}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Advisory Note */}
      <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E5EAF1] flex items-start gap-2.5 text-xs text-[#68758A]">
        <span className="text-[#2563EB] shrink-0 mt-0.5">💡</span>
        <span>
          <strong>Citizen Preparation Tip:</strong> Keep self-attested photocopies along with original documents ready. Bank accounts must be Aadhaar-linked (DBT enabled) for direct cash disbursements.
        </span>
      </div>
    </div>
  );
}

function ApplicationStepsGroup({ stepsText, applicationUrl, schemeName }) {
  if (!stepsText || !stepsText.trim()) return null;

  const steps = stepsText
    .split(/\n|(?<=\.)(?=\s*\d+\.)/)
    .map((s) => s.trim().replace(/^\d+\.\s*/, ""))
    .filter((s) => s.length > 5);

  const modes = detectApplicationModes(stepsText, applicationUrl);

  return (
    <div className="space-y-6">
      {/* Application Modes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {modes.map((mode, i) => (
          <div
            key={i}
            className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E5EAF1] space-y-1.5"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">{mode.icon}</span>
              <span className="text-xs font-bold text-[#14233B]">{mode.label}</span>
            </div>
            <p className="text-xs text-[#68758A] leading-relaxed">{mode.description}</p>
          </div>
        ))}
      </div>

      {/* Step by Step Flow */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#68758A]">
          Step-by-Step Instructions
        </h3>
        <div className="space-y-3">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3.5 p-4 rounded-xl bg-[#F8FAFC] border border-[#E5EAF1] hover:border-[#93C5FD] transition-colors"
            >
              <span className="flex-shrink-0 w-7 h-7 rounded-xl bg-[#2563EB] text-white text-xs font-bold flex items-center justify-center mt-0.5 shadow-xs">
                {idx + 1}
              </span>
              <div className="space-y-1">
                <p className="text-sm text-[#17243A] leading-relaxed font-medium">{step}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Direct Application CTA */}
      {applicationUrl && (
        <div className="p-5 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-[#14233B]">
              Ready to submit your application for {schemeName}?
            </h4>
            <p className="text-xs text-[#68758A]">
              Access the authentic government portal directly without middlemen.
            </p>
          </div>
          <a
            href={applicationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs sm:text-sm font-bold transition inline-flex items-center justify-center gap-2 shadow-xs shrink-0"
          >
            <span>Apply on Official Portal</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Scheme Detail Page
// ─────────────────────────────────────────────────────────────────────────────

export default function SchemeDetailPage() {
  const { id } = useParams();
  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    let ignore = false;

    fetch(`/api/schemes/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error(r.status === 404 ? "Scheme not found." : `Server error (${r.status})`);
        return r.json();
      })
      .then((data) => {
        if (!ignore) setScheme(data);
      })
      .catch((err) => {
        if (!ignore) setError(err.message);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [id]);

  const isCitizenScheme = scheme?.recordType === "CITIZEN_WELFARE_SCHEME";
  const isBudgetEntry = scheme?.recordType === "BUDGET_ACCOUNTING_ENTRY";
  const hasEligibilityRules = scheme?.eligibilityRules && scheme.eligibilityRules.length > 0;

  const linkedGovScheme = scheme?.mappings?.[0]?.governmentScheme || null;

  const effectiveDescription = scheme?.description || linkedGovScheme?.description || null;
  const effectivePlainSummary = scheme?.plainLanguageSummary || null;
  const effectiveBenefits = scheme?.benefits || linkedGovScheme?.benefits || null;
  const effectiveEligibility = scheme?.eligibilityText || linkedGovScheme?.eligibilityText || null;
  const effectiveApplicationProcess = scheme?.applicationProcess || linkedGovScheme?.applicationProcess || null;
  const effectiveRequiredDocuments = scheme?.requiredDocuments || linkedGovScheme?.requiredDocuments || null;
  const effectiveTargetBeneficiaries = scheme?.targetBeneficiaries || linkedGovScheme?.targetBeneficiaries || null;
  const effectiveOfficialUrl = scheme?.officialUrl || linkedGovScheme?.officialUrl || null;
  const effectiveApplicationUrl = scheme?.officialApplicationUrl || scheme?.officialUrl || null;

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFFFF] text-[#17243A]">
      <Navbar />

      <main className="flex-1 pb-16">
        {/* Loading skeleton */}
        {loading && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-6">
            <div className="h-4 w-48 rounded bg-slate-100 animate-pulse" />
            <div className="h-10 w-full max-w-2xl rounded bg-slate-100 animate-pulse" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
              <div className="lg:col-span-8 space-y-6">
                <div className="h-48 rounded-2xl bg-slate-100 animate-pulse border border-[#E5EAF1]" />
                <div className="h-64 rounded-2xl bg-slate-100 animate-pulse border border-[#E5EAF1]" />
              </div>
              <div className="lg:col-span-4 space-y-6">
                <div className="h-72 rounded-2xl bg-slate-100 animate-pulse border border-[#E5EAF1]" />
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-600 text-2xl font-bold">
              ✕
            </div>
            <h2 className="text-xl font-bold text-[#14233B]">{error}</h2>
            <p className="text-sm text-[#68758A] max-w-md mx-auto">
              The scheme record you requested could not be located in our verified dataset.
            </p>
            <Link
              href="/schemes"
              className="inline-block px-6 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-sm transition-colors"
            >
              ← Back to All Schemes
            </Link>
          </div>
        )}

        {/* Content */}
        {!loading && !error && scheme && (
          <>
            {/* Page Header Hero */}
            <div className="bg-[#F8FAFC] border-b border-[#E5EAF1] py-8 sm:py-12">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-xs text-[#68758A] mb-4" aria-label="Breadcrumb">
                  <Link href="/" className="hover:text-[#2563EB] transition-colors">
                    Home
                  </Link>
                  <span aria-hidden="true">/</span>
                  <Link href="/schemes" className="hover:text-[#2563EB] transition-colors">
                    Find Schemes
                  </Link>
                  <span aria-hidden="true">/</span>
                  <span className="text-[#17243A] font-medium truncate max-w-xs" aria-current="page">
                    {scheme.schemeName}
                  </span>
                </nav>

                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                  <div className="space-y-3 max-w-3xl">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
                      {scheme.department?.name || "Administering Ministry / Department"}
                    </p>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#14233B] font-heading leading-tight">
                      {scheme.schemeName}
                    </h1>

                    {/* Tags */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {scheme.state ? (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 border border-blue-200 text-[#2563EB]">
                          📍 {scheme.state} State Scheme
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 border border-slate-200 text-slate-700">
                          🇮🇳 Central / All-India
                        </span>
                      )}
                      {isCitizenScheme && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-1.5">
                          <span>✓</span>
                          Citizen Welfare Scheme
                        </span>
                      )}
                      {isBudgetEntry && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 border border-slate-200 text-slate-600">
                          Union Budget Record
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Header Quick CTA */}
                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    {effectiveApplicationUrl && isCitizenScheme && (
                      <a
                        href={effectiveApplicationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-bold transition flex items-center gap-2 shadow-xs"
                      >
                        <span>Apply on Official Portal</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                    {effectiveOfficialUrl && (
                      <a
                        href={effectiveOfficialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-3 rounded-xl bg-[#FFFFFF] hover:bg-[#F8FAFC] border border-[#E5EAF1] text-[#17243A] text-xs font-bold transition flex items-center gap-2 shadow-2xs"
                      >
                        <span>Official Guidelines</span>
                        <svg className="w-3.5 h-3.5 text-[#68758A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Two-Column Desktop Layout */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Column (Primary Content - 8 Cols) */}
                <div className="lg:col-span-8 space-y-6">
                  
                  {/* Notice banner for verified schemes */}
                  {isCitizenScheme && (
                    <div className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                      <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                        ✓
                      </span>
                      <div className="space-y-0.5 text-xs leading-relaxed">
                        <strong className="font-bold">Verified Citizen Welfare Scheme</strong>
                        <p className="opacity-90">
                          Information has been verified from official government portals. Always verify current notifications at the official portal before applying.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* 1. Scheme Overview */}
                  <DetailSection
                    title="Scheme Overview"
                    icon={
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    }
                  >
                    {effectivePlainSummary && (
                      <div className="p-4 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] space-y-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#2563EB] block">
                          Plain Language Summary
                        </span>
                        <p className="text-sm text-[#14233B] leading-relaxed font-medium">
                          {effectivePlainSummary}
                        </p>
                      </div>
                    )}

                    <InfoField label="What is this scheme?" value={effectiveDescription} />

                    {effectiveTargetBeneficiaries && (
                      <InfoField label="Who can benefit?" value={effectiveTargetBeneficiaries} highlight={true} />
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#E5EAF1]">
                      <InfoField label="Administering Department" value={scheme.department?.name} />
                      <InfoField label="Jurisdiction Level" value={scheme.schemeLevel || (scheme.state ? "State" : "Central")} />
                      <InfoField label="State / Coverage" value={scheme.state || "All India / National"} />
                      {scheme.category?.name && (
                        <InfoField label="Category" value={scheme.category.name} />
                      )}
                    </div>
                  </DetailSection>

                  {/* 2. Benefits & Applicable Conditions */}
                  {(effectiveBenefits || isCitizenScheme) && (
                    <DetailSection
                      title="Financial & Other Benefits"
                      icon={
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      }
                    >
                      {effectiveBenefits ? (
                        <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E5EAF1]">
                          <p className="text-sm text-[#17243A] leading-relaxed whitespace-pre-line font-medium">
                            {effectiveBenefits}
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-[#94A3B8] italic">
                          Benefit scales pending verification from official published departmental notifications.
                        </p>
                      )}
                    </DetailSection>
                  )}

                  {/* 3. Eligibility Criteria & Interactive Screener */}
                  <DetailSection
                    id="eligibility"
                    title="Eligibility Criteria & Online Screener"
                    icon={
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    }
                  >
                    {effectiveEligibility ? (
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-[#68758A]">
                            Official Requirements
                          </h3>
                          <p className="text-sm text-[#17243A] leading-relaxed whitespace-pre-line">
                            {effectiveEligibility}
                          </p>
                        </div>

                        {/* Interactive In-Page Screener */}
                        <div className="pt-2">
                          <SchemeEligibilityChecker
                            scheme={scheme}
                            rules={scheme.eligibilityRules || []}
                          />
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-[#94A3B8] italic">
                        Eligibility criteria are pending verification from official guidelines.
                      </p>
                    )}
                  </DetailSection>

                  {/* 4. Required Documents */}
                  {(effectiveRequiredDocuments || isCitizenScheme) && (
                    <DetailSection
                      title="Required Documents & Checklist"
                      icon={
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      }
                    >
                      {effectiveRequiredDocuments ? (
                        <DocumentCardGroup documentsText={effectiveRequiredDocuments} />
                      ) : (
                        <p className="text-xs text-[#94A3B8] italic">
                          Document requirements are pending verification from official guidelines.
                        </p>
                      )}
                    </DetailSection>
                  )}

                  {/* 5. How to Apply */}
                  {(effectiveApplicationProcess || isCitizenScheme) && (
                    <DetailSection
                      title="How to Apply Step-by-Step"
                      icon={
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                        </svg>
                      }
                    >
                      {effectiveApplicationProcess ? (
                        <ApplicationStepsGroup
                          stepsText={effectiveApplicationProcess}
                          applicationUrl={effectiveApplicationUrl}
                          schemeName={scheme.schemeName}
                        />
                      ) : (
                        <p className="text-xs text-[#94A3B8] italic">
                          Application instructions are pending verification from official sources.
                        </p>
                      )}
                    </DetailSection>
                  )}

                  {/* 6. Budget Allocation (If non-zero fiscal line) */}
                  {(scheme.actuals20242025Crores !== "0" || scheme.be20262027Crores !== "0") && (
                    <DetailSection
                      title="Union Budget Allocation Overview"
                      icon={
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      }
                    >
                      <p className="text-xs text-[#68758A] leading-relaxed -mt-1">
                        Figures below are ministry outlays in ₹ Crores authorized under Union Budget Expenditure Profile 2026-27. They do not represent individual citizen benefit amounts.
                      </p>
                      <div className="bg-[#F8FAFC] rounded-xl p-4 border border-[#E5EAF1] space-y-1">
                        <FinancialRow label="2024-25 Actuals" value={scheme.actuals20242025Crores} />
                        <FinancialRow label="2025-26 Budget Estimate" value={scheme.be20252026Crores} />
                        <FinancialRow label="2025-26 Revised Estimate" value={scheme.re20252026Crores} />
                        <FinancialRow label="2026-27 Budget Estimate" value={scheme.be20262027Crores} />
                      </div>
                    </DetailSection>
                  )}

                </div>

                {/* Right Column (Sticky Quick Action & Provenance Sidebar - 4 Cols) */}
                <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
                  
                  {/* Primary Application Card */}
                  <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5EAF1] shadow-md space-y-5">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB] block">
                        Application Journey
                      </span>
                      <h3 className="text-base font-bold text-[#14233B]">
                        Apply for this Scheme
                      </h3>
                      <p className="text-xs text-[#68758A]">
                        Access the authentic government application portal directly.
                      </p>
                    </div>

                    <div className="space-y-2.5">
                      {effectiveApplicationUrl && isCitizenScheme && (
                        <a
                          href={effectiveApplicationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                        >
                          <span>Apply on Official Portal</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      )}

                      {effectiveOfficialUrl && (
                        <a
                          href={effectiveOfficialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2.5 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E5EAF1] text-[#17243A] font-semibold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <span>Official Portal &amp; Guidelines</span>
                          <svg className="w-3.5 h-3.5 text-[#68758A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      )}

                      {hasEligibilityRules && (
                        <a
                          href="#eligibility"
                          className="w-full py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-semibold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <span>✓ Check Eligibility Online</span>
                        </a>
                      )}
                    </div>

                    <div className="pt-3 border-t border-[#E5EAF1] space-y-2">
                      <VerificationBadge
                        status={scheme.verificationStatus}
                        lastVerifiedAt={scheme.lastVerifiedAt}
                      />
                    </div>
                  </div>

                  {/* Department & Provenance Card */}
                  <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E5EAF1] space-y-3.5 text-xs">
                    <h4 className="font-bold text-[#14233B] uppercase tracking-wider text-[11px]">
                      Administrative Authority
                    </h4>
                    
                    <div className="space-y-1">
                      <span className="text-[#68758A] block">Administering Department:</span>
                      <span className="font-semibold text-[#17243A] block">{scheme.department?.name}</span>
                    </div>

                    {scheme.sourceTitle && (
                      <div className="space-y-1 pt-2 border-t border-[#E5EAF1]">
                        <span className="text-[#68758A] block">Source Title:</span>
                        <span className="text-[#17243A] font-medium block">{scheme.sourceTitle}</span>
                      </div>
                    )}

                    {linkedGovScheme && (
                      <div className="p-3 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] space-y-1">
                        <span className="font-bold text-[#2563EB] block">
                          🏛 Mapped on myScheme.gov.in
                        </span>
                        {linkedGovScheme.sourceUrl && (
                          <a
                            href={linkedGovScheme.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[#2563EB] underline break-all font-mono"
                          >
                            {linkedGovScheme.sourceUrl}
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Legal Notice */}
                  <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E5EAF1] text-xs text-[#68758A] leading-relaxed space-y-1.5">
                    <p className="font-bold text-[#17243A]">Important Citizen Notice:</p>
                    <p>
                      YojanaSathi is an informational screening platform. Final sanction and benefit disbursement are executed solely by the concerned government authority upon verification of original documents.
                    </p>
                  </div>

                </aside>

              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
