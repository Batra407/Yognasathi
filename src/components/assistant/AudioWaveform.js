"use client";

/**
 * AudioWaveform
 * 
 * Animated audio waveform visualizer.
 * In 'listening' mode: reflects audio level.
 * In 'speaking' mode: harmonic speech bars.
 * In 'idle' mode: calm resting bars.
 */
export default function AudioWaveform({ state = "idle", barCount = 18 }) {
  const isListening = state === "listening";
  const isSpeaking = state === "speaking";
  const isProcessing = state === "processing" || state === "searching";

  const bars = Array.from({ length: barCount }, (_, i) => i);

  return (
    <div
      className="flex items-center justify-center gap-1.5 h-10 px-4 py-1"
      aria-hidden="true"
    >
      {bars.map((bar) => {
        // Vary base heights and animations across bars
        const delay = (bar % 6) * 0.15;
        const baseHeight = 6 + (Math.sin(bar) + 1) * 4;

        let heightClass = "h-2 bg-slate-200";
        let style = {};

        if (isListening) {
          heightClass = "bg-[#2563EB]";
          style = {
            animation: `barWave 0.8s ease-in-out infinite`,
            animationDelay: `${delay}s`,
            minHeight: "4px",
          };
        } else if (isSpeaking) {
          heightClass = "bg-[#15803D]";
          style = {
            animation: `barWave 1.1s ease-in-out infinite`,
            animationDelay: `${delay}s`,
            minHeight: "4px",
          };
        } else if (isProcessing) {
          heightClass = "bg-blue-300";
          style = {
            animation: `barWave 1.4s ease-in-out infinite`,
            animationDelay: `${delay}s`,
            minHeight: "4px",
          };
        } else {
          style = {
            height: `${baseHeight}px`,
          };
        }

        return (
          <span
            key={bar}
            className={`w-1 rounded-full transition-all duration-300 ${heightClass}`}
            style={style}
          />
        );
      })}
    </div>
  );
}

