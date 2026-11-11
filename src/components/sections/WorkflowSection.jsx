"use client";

import { Mic, FileCode, Database, CheckCircle2 } from "lucide-react";
import RevealSection from "@/components/animations/RevealSection";

const STAGES = [
  {
    num: "01",
    label: "Multilingual Ingestion",
    title: "Speak or Type Naturally",
    desc: "Describe your livelihood, household, age, or state in conversational Hindi, English, Punjabi, or Hinglish. No administrative codes needed.",
    icon: Mic,
  },
  {
    num: "02",
    label: "CRF Token Extraction",
    title: "Extract Profile Parameters",
    desc: "Our machine-learning models extract discrete parameters: age, occupation, land size, and domicile while flagging unmentioned fields.",
    icon: FileCode,
  },
  {
    num: "03",
    label: "Candidate Querying",
    title: "PostgreSQL Database Match",
    desc: "Searches 672 verified government welfare programs, excluding administrative accounting expenditures from the public registry.",
    icon: Database,
  },
  {
    num: "04",
    label: "Rule Evaluation",
    title: "Deterministic Verification",
    desc: "Evaluates exact published criteria without LLM hallucination. Returns verified qualification or specifies missing requirements.",
    icon: CheckCircle2,
  },
];

export default function WorkflowSection() {
  return (
    <section id="how-it-works" className="py-20 sm:py-32 bg-white border-b border-gray-200 scroll-mt-16 text-[#0F172A] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <RevealSection className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-semibold text-[#D97706]">
            <span className="w-2 h-2 rounded-full bg-[#F5A623] animate-pulse" />
            <span className="font-mono text-[11px] uppercase tracking-wider">
              End-to-End Execution Pipeline
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#0F172A] font-sans">
            Designed for Reliability at Every Step
          </h2>

          <p className="text-base sm:text-lg text-[#475569] leading-relaxed">
            From raw citizen voice input to verified official portal redirection through 4 transparent, auditable stages.
          </p>
        </RevealSection>

        {/* 4-Column Scale AI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STAGES.map((stage, idx) => {
            const Icon = stage.icon;
            return (
              <div
                key={stage.num}
                className="p-6 rounded-2xl bg-[#F8FAFC] border border-gray-200 hover:border-[#F5A623] transition-all duration-300 flex flex-col justify-between group hover:shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-mono text-xs font-bold text-[#64748B]">
                      {stage.num}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 group-hover:border-[#F5A623] flex items-center justify-center transition-all shadow-xs">
                      <Icon className="w-4 h-4 text-[#D97706] group-hover:scale-110 transition-transform" />
                    </div>
                  </div>

                  <span className="font-mono text-[11px] uppercase tracking-wider text-[#D97706] block mb-2 font-bold">
                    {stage.label}
                  </span>

                  <h3 className="text-lg font-bold text-[#0F172A] tracking-tight mb-2">
                    {stage.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                    {stage.desc}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-gray-200 flex items-center justify-between text-[11px] font-mono text-[#64748B]">
                  <span>Stage {idx + 1} of 4</span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    Active
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
