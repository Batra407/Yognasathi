"use client";

import { Sparkles, Mic, ShieldCheck, Zap } from "lucide-react";
import UnifiedYojanaAssistant from "@/components/assistant/UnifiedYojanaAssistant";

export default function AssistantSection({ selectedLanguage = "hi-IN" }) {
  return (
    <section
      id="assistant"
      className="py-20 sm:py-32 bg-[#F8FAFC] text-[#0F172A] relative scroll-mt-16 border-b border-[#E2E8F0]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-semibold text-[#D97706]">
            <Sparkles className="w-3.5 h-3.5 text-[#F5A623]" />
            <span className="font-mono text-[11px] uppercase tracking-wider">
              Unified Conversational AI Voice &amp; Text Interface
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#0F172A] font-sans">
            Speak or Type in Your Preferred Language
          </h2>

          <p className="text-base sm:text-lg text-[#475569] leading-relaxed">
            Tell the assistant about your age, location, occupation, or family situation in Hindi,
            English, Punjabi, or Hinglish. We evaluate your eligibility against verified government criteria.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs text-[#64748B] font-mono">
            <span className="flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5 text-[#D97706]" /> Live Microphone Waveform
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#2563EB]" /> Persistent Conversational Memory
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Zero-Hallucination Evaluation
            </span>
          </div>
        </div>

        {/* Unified Assistant Component */}
        <UnifiedYojanaAssistant
          initialLanguage={selectedLanguage}
          inputId="text-requirement"
          buttonText="Search Assistant"
        />

      </div>
    </section>
  );
}
