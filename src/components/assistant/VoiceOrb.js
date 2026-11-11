"use client";

import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";

/**
 * VoiceOrb — Signature Multilingual AI Voice Assistant Visualizer
 *
 * Premium White + Blue Design System:
 * - 'idle': Calm royal blue orb with subtle breathing motion
 * - 'listening': Active microphone capture responding dynamically to real audio amplitude
 * - 'processing': Orbital acceleration with blue core
 * - 'searching': Radar sweep while scheme API request runs
 * - 'speaking': Harmonic waveform rhythm in sync with synthesis
 * - 'error': Crimson warning indicator with retry action
 */
export default function VoiceOrb({
  state = "idle",
  mediaStream = null,
  onToggleListen,
  onRetry,
  disabled = false,
  size = 210,
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const animFrameRef = useRef(null);

  // Normalize state name
  const activeState = state === "responding" ? "speaking" : state;

  // Audio setup for real microphone analysis
  const setupAudioAnalysis = useCallback((stream) => {
    if (typeof window === "undefined" || !stream) return;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }

      if (audioContextRef.current.state === "suspended") {
        audioContextRef.current.resume();
      }

      const audioCtx = audioContextRef.current;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.8;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      analyserRef.current = analyser;
      sourceRef.current = source;
    } catch (err) {
      console.warn("Web Audio API visualization could not be attached:", err);
    }
  }, []);

  const teardownAudioAnalysis = useCallback(() => {
    if (sourceRef.current) {
      try {
        sourceRef.current.disconnect();
      } catch (e) {
        // Safe ignore
      }
      sourceRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      try {
        audioContextRef.current.close();
      } catch (e) {
        // Safe ignore
      }
      audioContextRef.current = null;
    }
    analyserRef.current = null;
  }, []);

  useEffect(() => {
    if (activeState === "listening" && mediaStream) {
      setupAudioAnalysis(mediaStream);
    } else if (activeState !== "listening") {
      teardownAudioAnalysis();
    }

    return () => {
      teardownAudioAnalysis();
    };
  }, [activeState, mediaStream, setupAudioAnalysis, teardownAudioAnalysis]);

  // Canvas render loop for high-performance audio waveform and particle rings
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let time = 0;
    const dataArray = new Uint8Array(32);

    const render = () => {
      time += 0.035;
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      let currentVolume = 0;
      if (analyserRef.current && activeState === "listening") {
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        currentVolume = Math.min(1.0, (sum / dataArray.length) / 85);
      } else if (activeState === "speaking") {
        currentVolume = 0.32 + 0.28 * Math.abs(Math.sin(time * 3.2) * Math.cos(time * 1.8));
      } else {
        currentVolume = 0;
      }

      // 1. Draw outer ambient concentric rings in blue
      const ringCount = 3;
      for (let r = 1; r <= ringCount; r++) {
        const baseRadius = 46 + r * 22;
        const dynamicRadius = baseRadius + currentVolume * (16 * r);
        let alpha = 0.12;

        if (activeState === "listening") {
          alpha = 0.25 + (currentVolume * 0.45) / r;
        } else if (activeState === "speaking") {
          alpha = 0.22 + Math.sin(time * 2.5 + r) * 0.08;
        } else if (activeState === "processing" || activeState === "searching") {
          alpha = 0.20 + Math.sin(time * 3 + r) * 0.07;
        }

        ctx.beginPath();
        ctx.arc(centerX, centerY, Math.max(0, dynamicRadius), 0, Math.PI * 2);
        ctx.strokeStyle =
          activeState === "error"
            ? `rgba(220, 38, 38, ${alpha})`
            : `rgba(37, 99, 235, ${alpha})`;
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }

      // 2. Draw rotating orbital dots when processing or searching
      if (activeState === "processing" || activeState === "searching") {
        const dotCount = activeState === "searching" ? 6 : 8;
        const speed = activeState === "searching" ? 2.0 : 3.0;
        for (let i = 0; i < dotCount; i++) {
          const angle = time * speed + (i * Math.PI * 2) / dotCount;
          const orbitRadius = 64;
          const x = centerX + Math.cos(angle) * orbitRadius;
          const y = centerY + Math.sin(angle) * orbitRadius;
          ctx.beginPath();
          ctx.arc(x, y, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(37, 99, 235, 0.85)";
          ctx.fill();
        }
      }

      // 3. Draw audio waveform points in listening/speaking mode
      if (activeState === "listening" || activeState === "speaking") {
        const numPoints = 32;
        ctx.beginPath();
        for (let i = 0; i <= numPoints; i++) {
          const angle = (i / numPoints) * Math.PI * 2;
          const freqOffset =
            activeState === "listening" && analyserRef.current
              ? (dataArray[i % dataArray.length] / 255) * 26
              : Math.sin(angle * 4 + time * 3.5) * 10 * currentVolume;
          const radius = 46 + freqOffset;
          const px = centerX + Math.cos(angle) * radius;
          const py = centerY + Math.sin(angle) * radius;

          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.strokeStyle =
          activeState === "listening"
            ? "rgba(37, 99, 235, 0.9)"
            : "rgba(59, 130, 246, 0.8)";
        ctx.lineWidth = 1.8;
        ctx.stroke();
      }

      // 4. Central Glowing Core
      const coreGradient = ctx.createRadialGradient(
        centerX,
        centerY,
        4,
        centerX,
        centerY,
        42 + currentVolume * 14
      );

      if (activeState === "error") {
        coreGradient.addColorStop(0, "rgba(239, 68, 68, 0.95)");
        coreGradient.addColorStop(0.5, "rgba(220, 38, 38, 0.5)");
        coreGradient.addColorStop(1, "rgba(254, 242, 242, 0)");
      } else if (activeState === "listening") {
        coreGradient.addColorStop(0, "rgba(239, 246, 255, 0.98)");
        coreGradient.addColorStop(0.35, "rgba(59, 130, 246, 0.9)");
        coreGradient.addColorStop(0.75, "rgba(37, 99, 235, 0.45)");
        coreGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
      } else if (activeState === "speaking") {
        coreGradient.addColorStop(0, "rgba(239, 246, 255, 0.95)");
        coreGradient.addColorStop(0.4, "rgba(37, 99, 235, 0.85)");
        coreGradient.addColorStop(0.8, "rgba(29, 78, 216, 0.35)");
        coreGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
      } else if (activeState === "processing" || activeState === "searching") {
        coreGradient.addColorStop(0, "rgba(96, 165, 250, 0.9)");
        coreGradient.addColorStop(0.45, "rgba(37, 99, 235, 0.6)");
        coreGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
      } else {
        // Idle calm blue core
        coreGradient.addColorStop(0, "rgba(37, 99, 235, 0.8)");
        coreGradient.addColorStop(0.5, "rgba(59, 130, 246, 0.4)");
        coreGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
      }

      ctx.beginPath();
      ctx.arc(centerX, centerY, 42 + currentVolume * 14, 0, Math.PI * 2);
      ctx.fillStyle = coreGradient;
      ctx.fill();

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [activeState]);

  // GSAP organic breathing pulse
  useEffect(() => {
    if (!containerRef.current) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      gsap.set(containerRef.current, { scale: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      if (activeState === "idle") {
        gsap.to(containerRef.current, {
          scale: 1.025,
          duration: 2.6,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      } else if (activeState === "listening") {
        gsap.to(containerRef.current, {
          scale: 1.05,
          duration: 0.85,
          repeat: -1,
          yoyo: true,
          ease: "power1.inOut",
        });
      } else if (activeState === "speaking") {
        gsap.to(containerRef.current, {
          scale: 1.03,
          duration: 1.4,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      } else {
        gsap.to(containerRef.current, {
          scale: 1,
          duration: 0.35,
          ease: "power2.out",
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, [activeState]);

  const getStateLabel = () => {
    switch (activeState) {
      case "listening":
        return "Listening to speech";
      case "processing":
        return "Processing query";
      case "searching":
        return "Searching verified schemes";
      case "speaking":
        return "Speaking response";
      case "error":
        return "Microphone issue";
      default:
        return "Voice assistant idle";
    }
  };

  const handleClick = () => {
    if (disabled) return;
    if (activeState === "error" && onRetry) {
      onRetry();
    } else if (onToggleListen) {
      onToggleListen();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center select-none" ref={containerRef}>
      {/* Orb Canvas & Interactive Target */}
      <div
        role="button"
        tabIndex={0}
        aria-label={`${getStateLabel()}. Click to ${
          activeState === "listening"
            ? "stop listening"
            : activeState === "error"
            ? "retry microphone"
            : "start speaking"
        }`}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
        className="relative group cursor-pointer rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-4 focus-visible:ring-offset-white"
      >
        {/* Glow backdrop */}
        <div
          className={`absolute inset-0 rounded-full blur-2xl transition-opacity duration-500 pointer-events-none ${
            activeState === "listening"
              ? "bg-[#2563EB]/25 opacity-100"
              : activeState === "speaking"
              ? "bg-[#2563EB]/20 opacity-90"
              : activeState === "error"
              ? "bg-rose-500/20 opacity-90"
              : "bg-[#2563EB]/10 opacity-70 group-hover:opacity-100"
          }`}
        />

        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          className="relative z-10 block"
          style={{ width: `${size}px`, height: `${size}px` }}
          aria-label={`AI Voice Visualizer — Current state: ${activeState}`}
          role="img"
        />

        {/* Center icon / mic indicator overlay */}
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-13 h-13 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${
            activeState === "listening"
              ? "bg-[#2563EB] text-white scale-110 shadow-blue-500/50"
              : activeState === "speaking"
              ? "bg-[#1D4ED8] text-white shadow-blue-500/40"
              : activeState === "error"
              ? "bg-rose-600 text-white shadow-rose-600/40"
              : "bg-white border border-[#CBD5E1] text-[#2563EB] group-hover:border-[#2563EB] group-hover:scale-105"
          }`}
        >
          {activeState === "listening" ? (
            <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
            </svg>
          ) : activeState === "speaking" ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          ) : activeState === "processing" || activeState === "searching" ? (
            <svg className="w-5 h-5 animate-spin text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          ) : activeState === "error" ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
            </svg>
          )}
        </div>
      </div>

      {/* State indicator strip below orb */}
      <div className="mt-3 flex items-center gap-2">
        <span
          className={`inline-block w-2 h-2 rounded-full ${
            activeState === "listening"
              ? "bg-[#2563EB] animate-ping"
              : activeState === "speaking"
              ? "bg-[#15803D] animate-pulse"
              : activeState === "error"
              ? "bg-rose-500"
              : activeState === "processing" || activeState === "searching"
              ? "bg-[#2563EB] animate-spin"
              : "bg-[#94A3B8]"
          }`}
          aria-hidden="true"
        />
        <span className="text-[11px] font-bold tracking-wide text-[#68758A] uppercase">
          {getStateLabel()}
        </span>
      </div>
    </div>
  );
}
