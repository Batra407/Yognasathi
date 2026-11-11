"use client";

/**
 * MicrophoneButton
 * 
 * Elegant, accessible microphone control supporting states:
 * - 'idle'
 * - 'listening'
 * - 'processing'
 * - 'speaking'
 * - 'error'
 */
export default function MicrophoneButton({
  state = "idle",
  onClick,
  disabled = false,
  size = "lg",
  ariaLabel = "Activate microphone",
}) {
  const isListening = state === "listening";
  const isProcessing = state === "processing" || state === "searching";
  const isSpeaking = state === "speaking";
  const isError = state === "error";

  const sizeClasses =
    size === "lg"
      ? "w-20 h-20 sm:w-24 sm:h-24"
      : size === "md"
      ? "w-16 h-16"
      : "w-12 h-12";

  const iconSizes =
    size === "lg"
      ? "w-8 h-8 sm:w-9 sm:h-9"
      : size === "md"
      ? "w-6 h-6"
      : "w-5 h-5";

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* Outer ambient wave ring when listening */}
      {isListening && (
        <span
          className="absolute inset-0 rounded-full bg-blue-500/25 animate-ping pointer-events-none"
          aria-hidden="true"
        />
      )}
      {isSpeaking && (
        <span
          className="absolute inset-0 rounded-full bg-emerald-500/20 animate-pulse pointer-events-none"
          aria-hidden="true"
        />
      )}

      <button
        type="button"
        onClick={onClick}
        disabled={disabled || isProcessing}
        aria-label={
          isListening
            ? "Stop recording speech"
            : isSpeaking
            ? "Stop speaking audio"
            : ariaLabel
        }
        className={`relative z-10 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-4 cursor-pointer select-none ${sizeClasses} ${
          isListening
            ? "bg-[#2563EB] text-white shadow-lg shadow-blue-500/40 ring-4 ring-blue-200 animate-pulse scale-105"
            : isSpeaking
            ? "bg-[#15803D] text-white shadow-lg shadow-emerald-500/30 ring-4 ring-emerald-200"
            : isProcessing
            ? "bg-[#EFF6FF] border-2 border-[#2563EB] text-[#2563EB] cursor-wait"
            : isError
            ? "bg-rose-600 text-white shadow-md shadow-rose-500/30"
            : "bg-[#FFFFFF] hover:bg-[#F8FAFC] border-2 border-[#E5EAF1] hover:border-[#2563EB] text-[#2563EB] shadow-md hover:shadow-lg hover:scale-105"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {isListening ? (
          <svg className={iconSizes} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
          </svg>
        ) : isProcessing ? (
          <svg className={`${iconSizes} animate-spin`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        ) : isSpeaking ? (
          <svg className={`${iconSizes} animate-bounce`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        ) : isError ? (
          <svg className={iconSizes} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        ) : (
          <svg className={iconSizes} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
          </svg>
        )}
      </button>
    </div>
  );
}

