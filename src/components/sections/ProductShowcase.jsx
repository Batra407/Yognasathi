"use client";

import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { 
  Mic, 
  Cpu, 
  ShieldCheck, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Volume2
} from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const STEPS = [
  {
    id: "showcase-01",
    num: "01",
    tag: "Acoustic & Multilingual NLP",
    title: "Conversational Voice Understanding in 4 Languages",
    desc: "Citizens converse naturally in Hindi, Punjabi, Hinglish, or English. YojanaSathi normalizes regional colloquialisms, acoustic variations, and mixed-script queries into canonical semantic representations.",
    icon: Mic,
    previewTitle: "Multilingual Speech Stream & Normalization",
  },
  {
    id: "showcase-02",
    num: "02",
    tag: "Entity Recognition & Extraction",
    title: "High-Precision Profile Extraction Without Data Invention",
    desc: "Our dual-engine intent classifier and CRF sequence tagger extracts age, caste category, landholding, occupation, and state. If a citizen doesn't state their income, the system explicitly reports missing information instead of fabricating it.",
    icon: Cpu,
    previewTitle: "Extracted Parameter Matrix",
  },
  {
    id: "showcase-03",
    num: "03",
    tag: "Deterministic Eligibility Engine",
    title: "Zero-Hallucination Verified Rule Evaluation",
    desc: "Unlike standard LLMs that invent qualification rules, YojanaSathi evaluates 45+ verified deterministic criteria from state gazettes and official guidelines. Clear distinction between Eligible, Ineligible, and Insufficient Information.",
    icon: ShieldCheck,
    previewTitle: "Rule Verification Engine",
  },
  {
    id: "showcase-04",
    num: "04",
    tag: "Citizen Handoff & Transparency",
    title: "Direct Official Government Portal Integration",
    desc: "Every recommended scheme provides a verified direct portal link (.gov.in / .nic.in), published benefits summary, mandatory document checklist, and step-by-step application guidance.",
    icon: ExternalLink,
    previewTitle: "Official Portal Verification & Document Checklist",
  },
];

export default function ProductShowcase() {
  const [activeStep, setActiveStep] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      STEPS.forEach((_, idx) => {
        ScrollTrigger.create({
          trigger: `#showcase-step-${idx}`,
          start: "top center",
          end: "bottom center",
          onEnter: () => setActiveStep(idx),
          onEnterBack: () => setActiveStep(idx),
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      id="product-showcase"
      className="py-20 sm:py-32 bg-[#F8FAFC] border-y border-gray-200 relative text-[#0F172A]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16 sm:mb-24 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-semibold text-[#D97706]">
            <span className="w-2 h-2 rounded-full bg-[#F5A623] animate-pulse" />
            <span className="font-mono text-[11px] uppercase tracking-wider">
              Engine Architecture &amp; Methodology
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#0F172A] font-sans">
            How YojanaSathi Solves Public Welfare Discovery
          </h2>
          <p className="text-base sm:text-lg text-[#475569] leading-relaxed">
            By coupling multilingual natural language understanding with a strictly deterministic eligibility engine,
            citizens get authentic access to government programs without bureaucratic confusion.
          </p>
        </div>

        {/* 2-Column Storytelling Grid: Left Steps, Right Sticky Dynamic Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
          
          {/* Left Column: Narrative Steps */}
          <div className="lg:col-span-6 space-y-8 sm:space-y-12">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isActive = activeStep === idx;

              return (
                <div
                  key={step.id}
                  id={`showcase-step-${idx}`}
                  onClick={() => setActiveStep(idx)}
                  className={`p-6 sm:p-8 rounded-2xl border transition-all duration-300 cursor-pointer ${
                    isActive
                      ? "bg-white border-[#F5A623] shadow-md ring-1 ring-[#F5A623]/30"
                      : "bg-white/80 hover:bg-white border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs font-bold text-[#64748B]">
                      {step.num}
                    </span>
                    <span
                      className={`font-mono text-[11px] uppercase tracking-wider px-2.5 py-1 rounded-md border ${
                        isActive
                          ? "bg-amber-100 text-[#B45309] border-amber-300 font-semibold"
                          : "bg-gray-100 text-[#64748B] border-gray-200"
                      }`}
                    >
                      {step.tag}
                    </span>
                  </div>

                  <div className="flex items-start gap-4">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isActive
                          ? "bg-gradient-to-br from-[#F5A623] to-[#FFC66B] text-black shadow-xs"
                          : "bg-gray-100 text-[#475569]"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
                        {step.title}
                      </h3>
                      <p className="text-sm text-[#475569] leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Sticky Dynamic Visualization Frame */}
          <div className="lg:col-span-6 lg:sticky lg:top-28">
            <div className="rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden">
              
              {/* Frame Header */}
              <div className="px-5 py-3.5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                  <span className="ml-2 font-mono text-[11px] text-[#475569] uppercase tracking-wider font-semibold">
                    {STEPS[activeStep].previewTitle}
                  </span>
                </div>
                <span className="font-mono text-[11px] text-[#D97706] font-bold">
                  LIVE INTERACTIVE PREVIEW
                </span>
              </div>

              {/* Dynamic Content based on activeStep */}
              <div className="p-6 sm:p-8 min-h-[380px] flex flex-col justify-between bg-white">
                
                {/* Visualizer Step 0: Audio Wave & Multilingual Speech */}
                {activeStep === 0 && (
                  <div className="space-y-6">
                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-[#0F172A] font-semibold flex items-center gap-1.5">
                          <Volume2 className="w-4 h-4 text-[#D97706]" />
                          Audio Waveform Input (Sample Rate: 16kHz)
                        </span>
                        <span className="font-mono text-[11px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 font-semibold">
                          Active Speech
                        </span>
                      </div>
                      
                      {/* Animated Audio Visualizer Bars */}
                      <div className="flex items-center justify-center gap-1.5 h-16 py-2">
                        {[40, 75, 95, 60, 30, 85, 100, 45, 90, 70, 40, 80, 65, 95, 30, 85].map((h, i) => (
                          <div
                            key={i}
                            className="w-1.5 bg-gradient-to-t from-[#F5A623] to-[#FFC66B] rounded-full transition-all duration-150 animate-pulse"
                            style={{ height: `${h}%`, animationDelay: `${i * 70}ms` }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="font-mono text-xs text-[#64748B] font-semibold">
                        Transcribed Phonetic Stream:
                      </span>
                      <div className="p-3.5 rounded-lg bg-gray-50 border border-gray-200 text-sm text-[#0F172A] font-medium">
                        &ldquo;ਮੇਰੇ ਕੋਲ ਦੋ ਏਕੜ ਜ਼ਮੀਨ ਹੈ, ਮੈਨੂੰ ਕਣਕ ਦੀ ਖਾਦ ਲਈ ਮਦਦ ਚਾਹੀਦੀ ਹੈ&rdquo;
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-xs text-[#64748B]">Normalized to:</span>
                        <span className="text-xs font-mono text-[#B45309] bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-semibold">
                          Punjabi • Farmer Assistance • Crop Nutrition
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Visualizer Step 1: NER Profile Extraction */}
                {activeStep === 1 && (
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <span className="font-mono text-xs text-[#64748B] font-semibold">
                        Tokenized Sequence Highlighting:
                      </span>
                      <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-sm text-[#334155] leading-loose">
                        I am a{" "}
                        <span className="bg-amber-100 text-[#B45309] px-2 py-0.5 rounded font-mono text-xs font-bold border border-amber-300">
                          B-OCCUPATION: farmer
                        </span>{" "}
                        living in{" "}
                        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-mono text-xs font-bold border border-blue-300">
                          B-STATE: Haryana
                        </span>
                        , aged{" "}
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono text-xs font-bold border border-emerald-300">
                          B-AGE: 64
                        </span>
                        .
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="font-mono text-xs text-[#64748B] font-semibold">
                        Extracted Citizen Profile (Database-Ready):
                      </span>
                      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200">
                          <span className="text-[#64748B] block">occupation</span>
                          <span className="text-[#0F172A] font-bold">farmer</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200">
                          <span className="text-[#64748B] block">state</span>
                          <span className="text-[#0F172A] font-bold">Haryana</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200">
                          <span className="text-[#64748B] block">age</span>
                          <span className="text-[#0F172A] font-bold">64 years</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200">
                          <span className="text-[#64748B] block">annualIncome</span>
                          <span className="text-[#D97706] font-bold">MISSING (Unstated)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Visualizer Step 2: Deterministic Rule Verification */}
                {activeStep === 2 && (
                  <div className="space-y-4">
                    <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-[#B45309] font-medium flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-[#D97706]" />
                      <span>Zero Hallucination: Missing income generates a direct follow-up rather than guessing qualification.</span>
                    </div>

                    <div className="space-y-2">
                      <span className="font-mono text-xs text-[#64748B] font-semibold">
                        Evaluated Gazette Rules (PM-Kisan Scheme):
                      </span>
                      <div className="space-y-2">
                        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                          <span className="flex items-center gap-2 font-medium text-emerald-950">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            Rule: Citizen occupation must match Agricultural Producer
                          </span>
                          <span className="font-mono text-emerald-800 font-bold uppercase text-[10px]">
                            PASSED
                          </span>
                        </div>

                        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                          <span className="flex items-center gap-2 font-medium text-emerald-950">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            Rule: Resident of an Indian state (Haryana)
                          </span>
                          <span className="font-mono text-emerald-800 font-bold uppercase text-[10px]">
                            PASSED
                          </span>
                        </div>

                        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-between text-xs">
                          <span className="flex items-center gap-2 font-medium text-amber-950">
                            <AlertCircle className="w-4 h-4 text-amber-600" />
                            Rule: Institutional landholder exclusion check
                          </span>
                          <span className="font-mono text-amber-800 font-bold uppercase text-[10px]">
                            INSUFFICIENT INFO
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Visualizer Step 3: Portal Integration & Handoff */}
                {activeStep === 3 && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-[#0F172A]">
                          PM-KISAN SAMMAN NIDHI
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
                          ✓ 100% OFFICIAL
                        </span>
                      </div>
                      <p className="text-xs text-[#475569]">
                        Ministry of Agriculture &amp; Farmers Welfare • Direct Benefit Transfer of ₹6,000 annually in three equal installments.
                      </p>
                      <div className="pt-2 border-t border-gray-200 flex items-center justify-between text-xs font-mono">
                        <span className="text-[#64748B]">Official Portal:</span>
                        <span className="text-[#2563EB] font-bold underline">pmkisan.gov.in ↗</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-lg bg-gray-50 border border-gray-200 space-y-2">
                      <span className="font-mono text-[11px] text-[#64748B] block font-semibold">
                        Mandatory Document Checklist:
                      </span>
                      <div className="grid grid-cols-2 gap-2 text-xs text-[#0F172A]">
                        <span className="flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-[#D97706]" /> Aadhaar Card
                        </span>
                        <span className="flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-[#D97706]" /> Land Records (Khasra)
                        </span>
                        <span className="flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-[#D97706]" /> Bank Account Passbook
                        </span>
                        <span className="flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-[#D97706]" /> Active Mobile Number
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer status row */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-mono text-[#64748B]">
                  <span>Step {activeStep + 1} of 4</span>
                  <span className="text-emerald-700 font-semibold">Status: Verified &amp; Real-Time</span>
                </div>

              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
