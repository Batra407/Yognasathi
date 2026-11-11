"use client";

import AssistantInput from "@/components/assistant/AssistantInput";

export default function UnifiedYojanaAssistant({
  initialLanguage = "hi-IN",
  initialQuery = "",
  initialMode = "speak",
  inputId = "text-requirement",
  buttonText = "Search Assistant",
  isFullPage = false
}) {
  return (
    <div className={`w-full ${isFullPage ? "max-w-6xl mx-auto" : "max-w-4xl mx-auto"} space-y-6 font-sans`}>
      <div className="rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden">
        {/* Top Status Bar */}
        <div className="px-5 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-xs font-bold text-[#0F172A] tracking-wide">
              YOJANASATHI UNIFIED INTELLIGENCE ASSISTANT
            </span>
          </div>
          <span className="font-mono text-[11px] text-[#64748B]">
            672 Verified Schemes • Multilingual Speech &amp; Text
          </span>
        </div>

        {/* Core Assistant Input & Responses */}
        <div className="p-6 sm:p-8">
          <AssistantInput
            initialLanguage={initialLanguage}
            initialMode={initialMode}
            inputId={inputId}
            buttonText={buttonText}
          />
        </div>
      </div>
    </div>
  );
}
