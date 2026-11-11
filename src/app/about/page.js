import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";

export const metadata = {
  title: "About YojanaSathi — Mission, Data Provenance & Verification",
  description: "Learn how YojanaSathi indexes official Indian government welfare schemes, verifies data against official portals, and empowers citizens across languages."
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9FC]">
      <Navbar />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#68758A]" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#17243A] transition-colors">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-[#17243A] font-semibold" aria-current="page">
            About & Transparency
          </span>
        </nav>

        {/* Hero Section */}
        <div className="bg-white border border-[#E5EAF1] rounded-3xl p-8 sm:p-12 shadow-xs space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
            Public Transparency & Verification Report
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#14233B] tracking-tight">
            Democratizing Access to Public Welfare
          </h1>
          <p className="text-base sm:text-lg text-[#68758A] leading-relaxed max-w-3xl">
            YojanaSathi was created to solve a fundamental challenge in Indian governance: millions of eligible citizens miss out on life-changing welfare programs simply because information is fragmented across hundreds of ministry websites, technical budget books, and complex eligibility criteria.
          </p>
        </div>

        {/* Three Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-[#E5EAF1] rounded-2xl p-6 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-[#14233B]">100% Evidence-Backed</h3>
            <p className="text-xs text-[#68758A] leading-relaxed">
              Every scheme entry is verified against authentic Union Budget documents (Statements 4A & 4B) or official state portals (e.g., Punjab punjab.gov.in, Haryana saralharyana.gov.in).
            </p>
          </div>

          <div className="bg-white border border-[#E5EAF1] rounded-2xl p-6 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-[#14233B]">Voice-First in Indian Languages</h3>
            <p className="text-xs text-[#68758A] leading-relaxed">
              Citizens can speak naturally in Hindi, English, Punjabi, or Hinglish. Our conversational pipeline extracts user profiles without complex form-filling.
            </p>
          </div>

          <div className="bg-white border border-[#E5EAF1] rounded-2xl p-6 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-[#14233B]">Deterministic Rules Engine</h3>
            <p className="text-xs text-[#68758A] leading-relaxed">
              We never fabricate eligibility. Explicit mathematical rules verify age limits, income ceilings, landholding brackets, and gender criteria with zero hallucination.
            </p>
          </div>
        </div>

        {/* In-depth Provenance and Methodology */}
        <div className="bg-white border border-[#E5EAF1] rounded-3xl p-8 sm:p-10 shadow-xs space-y-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#14233B] mb-3">
              Data Architecture & Dataset Taxonomy
            </h2>
            <p className="text-sm text-[#68758A] leading-relaxed">
              YojanaSathi indexes 672 scheme records across Central Ministries and State Government Directorates. To ensure complete clarity between fiscal allocations and citizen-applicable welfare benefits, each record is strictly classified:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-[#F7F9FC] border border-[#E5EAF1] space-y-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                CITIZEN_WELFARE_SCHEME
              </span>
              <h4 className="text-sm font-bold text-[#14233B]">Actionable Welfare Schemes</h4>
              <p className="text-xs text-[#68758A] leading-relaxed">
                Direct citizen programs (e.g. PM-Kisan, Ayushman Bharat, Ashirwad Scheme, Shagun Scheme). These feature step-by-step application journeys, required document checklists, and direct links to official application portals.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#F7F9FC] border border-[#E5EAF1] space-y-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                BUDGET_ACCOUNTING_ENTRY
              </span>
              <h4 className="text-sm font-bold text-[#14233B]">Central Budget Outlay Entries</h4>
              <p className="text-xs text-[#68758A] leading-relaxed">
                Expenditure lines from Statement 4A/4B of the Union Budget. These track national financial outlays across departments and are transparently labeled to prevent confusing citizens who are looking for individual benefits.
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-[#E5EAF1]">
            <h3 className="text-base font-bold text-[#14233B]">
              Verification Checklist for Every Scheme
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span><strong>Administering Authority:</strong> Explicit Central Ministry or State Department verified.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span><strong>Target Beneficiaries:</strong> Specific demographic tags (Farmers, Women, Students, SC/ST/OBC, Senior Citizens).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span><strong>Documentation Checklist:</strong> Mandatory proofs (Aadhaar, Income Certificate, Residence Proof, Land Records).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span><strong>Official Portal Link:</strong> Verified HTTPS URL to government domain (.gov.in or .nic.in).</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Official Disclaimer */}
        <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2 text-xs leading-relaxed">
          <p className="font-bold uppercase tracking-wider text-[11px] text-amber-800 flex items-center gap-2">
            <svg className="w-4 h-4 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>Official Government Disclaimer</span>
          </p>
          <p>
            YojanaSathi is an independent, open civic technology initiative. It is not affiliated with the Government of India, the Government of Punjab, the Government of Haryana, or any other state government. All scheme approvals, sanctions, disbursements, and document verifications are conducted exclusively by the competent government authorities on official portals.
          </p>
        </div>

        {/* Call to action */}
        <div className="text-center pt-4 space-y-3">
          <h3 className="text-lg font-bold text-[#14233B]">Ready to discover benefits you qualify for?</h3>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/schemes"
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-2xs"
            >
              Browse 672 Schemes
            </Link>
            <Link
              href="/assistant"
              className="px-6 py-2.5 rounded-xl bg-white border border-[#E5EAF1] hover:bg-slate-50 text-[#14233B] text-xs font-bold transition-colors shadow-2xs"
            >
              Talk to AI Assistant
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

