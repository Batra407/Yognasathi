"use client";

export default function VoiceButton({
  state = "IDLE", // IDLE, LISTENING, PROCESSING, SPEAKING, COMPLETED, ERROR
  onStart,
  onStop,
  disabled = false,
  labelOverride = null
}) {
  const isListening = state === "LISTENING";
  const isProcessing = state === "PROCESSING";
  const isSpeaking = state === "SPEAKING";

  const getButtonContent = () => {
    if (labelOverride) return labelOverride;

    switch (state) {
      case "LISTENING":
        return (
          <>
            <span className="relative flex h-3 w-3 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
            </span>
            <span>Listening...</span>
          </>
        );
      case "PROCESSING":
        return (
          <>
            <svg className="w-5 h-5 animate-spin mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Understanding...</span>
          </>
        );
      case "SPEAKING":
        return (
          <>
            <svg className="w-5 h-5 animate-bounce mr-2 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
            <span>Speaking...</span>
          </>
        );
      case "COMPLETED":
        return (
          <>
            <svg className="w-5 h-5 mr-2 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Listen again</span>
          </>
        );
      default:
        return (
          <>
            <svg className="w-5 h-5 mr-2 text-emerald-400 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
            </svg>
            <span>Speak</span>
          </>
        );
    }
  };

  const getAriaLabel = () => {
    if (isListening) return "Stop listening voice input";
    if (isSpeaking) return "Stop speaking voice summary";
    return "Start voice input";
  };

  return (
    <button
      type="button"
      onClick={isListening ? onStop : onStart}
      disabled={disabled || isProcessing}
      aria-label={getAriaLabel()}
      className={`group relative inline-flex items-center justify-center px-5 py-3 rounded-2xl font-bold text-sm transition-all duration-200 focus:outline-none focus:ring-4 ${
        isListening
          ? "bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 focus:ring-rose-500/50 animate-pulse"
          : isSpeaking
          ? "bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/30 focus:ring-amber-500/50"
          : "bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white border border-slate-700/80 shadow-md hover:border-emerald-500 focus:ring-emerald-500/50"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "hover:-translate-y-0.5 active:translate-y-0"}`}
    >
      {getButtonContent()}
    </button>
  );
}
