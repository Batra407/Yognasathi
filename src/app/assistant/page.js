"use client";

import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import UnifiedYojanaAssistant from "@/components/assistant/UnifiedYojanaAssistant";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Sparkles, ArrowLeft } from "lucide-react";

function AssistantPageContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialLang = searchParams.get("lang") || "hi-IN";

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A] font-sans">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Breadcrumb & Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <nav className="flex items-center gap-2 text-xs text-[#64748B]" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-[#0F172A] transition-colors inline-flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" />
              <span>Back to Home</span>
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-[#0F172A] font-semibold" aria-current="page">
              Unified AI Assistant
            </span>
          </nav>

          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Deterministic Eligibility Active (672 Schemes)
            </span>
          </div>
        </div>

        {/* Header intro */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-semibold text-[#D97706]">
            <Sparkles className="w-3.5 h-3.5 text-[#F5A623]" />
            <span className="font-mono text-[11px] uppercase tracking-wider">
              Single Unified Intelligence Interface
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
            YojanaSathi Multilingual AI Voice &amp; Text Assistant
          </h1>
          <p className="text-sm sm:text-base text-[#475569] leading-relaxed">
            Speak or type in Hindi, English, Punjabi, or Hinglish. Your demographic and financial
            attributes are evaluated deterministically against verified government rules.
          </p>
        </div>

        {/* The Exact Same Unified Assistant */}
        <UnifiedYojanaAssistant
          initialLanguage={initialLang}
          initialQuery={initialQuery}
          inputId="text-requirement"
          buttonText="Search Assistant"
          isFullPage={true}
        />
      </main>

      <Footer />
    </div>
  );
}

export default function AssistantPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
          <div className="text-sm font-semibold text-[#64748B]">Loading YojanaSathi Assistant...</div>
        </div>
      }
    >
      <AssistantPageContent />
    </Suspense>
  );
}
