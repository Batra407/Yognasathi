"use client";

export default function AssistantStatus({
  state = "idle", // "idle" | "listening" | "processing" | "searching" | "speaking" | "error"
  customMessage = null,
  detectedLanguage = null
}) {
  const configs = {
    idle: {
      label: "Ready",
      defaultText: "Ready to assist. Ask your question in Hindi, English, Punjabi, or Hinglish.",
      dotColor: "bg-emerald-500",
      badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200"
    },
    listening: {
      label: "Listening",
      defaultText: "Listening to your voice... Speak your age, occupation, state, or requirements.",
      dotColor: "bg-blue-600 animate-ping",
      badgeClass: "bg-blue-50 text-blue-800 border-blue-200"
    },
    processing: {
      label: "Extracting Profile",
      defaultText: "Processing your statement with multilingual NLP...",
      dotColor: "bg-amber-500 animate-pulse",
      badgeClass: "bg-amber-50 text-amber-800 border-amber-200"
    },
    searching: {
      label: "Searching Database",
      defaultText: "Scanning verified central and state welfare scheme records...",
      dotColor: "bg-indigo-600 animate-spin",
      badgeClass: "bg-indigo-50 text-indigo-800 border-indigo-200"
    },
    speaking: {
      label: "Speaking",
      defaultText: "Responding via speech synthesis...",
      dotColor: "bg-purple-600 animate-bounce",
      badgeClass: "bg-purple-50 text-purple-800 border-purple-200"
    },
    error: {
      label: "Attention",
      defaultText: "An issue occurred. You can retry speaking or type your query below.",
      dotColor: "bg-red-500",
      badgeClass: "bg-red-50 text-red-800 border-red-200"
    }
  };

  const current = configs[state] || configs.idle;
  const message = customMessage || current.defaultText;

  return (
    <div 
      className={`inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border text-xs font-medium transition-all duration-200 ${current.badgeClass}`}
      role="status"
      aria-live="polite"
    >
      <span className="relative flex h-2 w-2">
        <span className={`relative inline-flex rounded-full h-2 w-2 ${current.dotColor}`} />
      </span>
      <span className="font-semibold uppercase tracking-wider text-[11px]">
        {current.label}
      </span>
      <span className="text-slate-400 font-light">|</span>
      <span className="truncate max-w-[280px] sm:max-w-md text-xs">
        {message}
      </span>
      {detectedLanguage && (
        <span className="ml-auto bg-white/80 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider text-[#14233B] border border-slate-200">
          {detectedLanguage}
        </span>
      )}
    </div>
  );
}

