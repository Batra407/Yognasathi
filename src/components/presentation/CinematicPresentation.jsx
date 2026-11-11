"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  X,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Mic,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Globe,
  MapPin,
  Volume2,
  ExternalLink,
} from "lucide-react";
import IndiaMapCanvas, { INDIA_HUBS } from "./IndiaMapCanvas";

const SCENES = [
  {
    id: "scene-1",
    num: "01",
    label: "Discover India",
    headline: "India is full of opportunities. Find yours.",
    subtext:
      "Discover government schemes, understand your eligibility and access opportunities through intelligent technology.",
  },
  {
    id: "scene-2",
    num: "02",
    label: "India's Diversity",
    headline: "One country. Millions of different needs.",
    subtext:
      "From smallholder farmers to young scholars and women artisans, welfare delivery must adapt to every individual circumstance.",
  },
  {
    id: "scene-3",
    num: "03",
    label: "Every State, Every Citizen",
    headline: "From every state. For every citizen.",
    subtext:
      "Deep administrative indexing across national ministries and state welfare departments with zero jurisdictional blindspots.",
  },
  {
    id: "scene-4",
    num: "04",
    label: "Intelligent Matching",
    headline: "Finding the right scheme should not be complicated.",
    subtext:
      "Deterministic rule evaluation without AI hallucination. Raw natural voice is transformed into verified public entitlements.",
  },
  {
    id: "scene-5",
    num: "05",
    label: "Multilingual Voice",
    headline: "Just speak. YojanaSathi listens.",
    subtext:
      "Acoustic dialect comprehension in Hindi, Punjabi, Hinglish, and English without accent barriers or bureaucratic jargon.",
  },
];

const DIVERSITY_VIGNETTES = [
  {
    id: "farmer",
    label: "Punjab & Haryana Farmers",
    role: "Agricultural Producers",
    image: "/images/scene_farmer.jpg",
    context: "Small & Marginal Farmers with landholding up to 5 acres.",
    need: "Subsidized crop nutrition, tube-well power, and direct DBT assistance.",
    scheme: "PM-Kisan Samman Nidhi & Crop Insurance (PMFBY)",
    portal: "pmkisan.gov.in",
  },
  {
    id: "student",
    label: "Scholars & Students",
    role: "Higher Education & Research",
    image: "/images/scene_student.jpg",
    context: "Post-matric and undergraduate scholars from underprivileged communities.",
    need: "Tuition fee waiver and monthly study maintenance allowance.",
    scheme: "Dr. Ambedkar Post-Matric Scholarship Scheme",
    portal: "scholarships.punjab.gov.in",
  },
  {
    id: "entrepreneur",
    label: "Women Entrepreneurs",
    role: "Artisans & Self-Help Groups",
    image: "/images/scene_women_entrepreneur.jpg",
    context: "Women establishing micro-enterprises and traditional handloom craft units.",
    need: "Collateral-free microcredit, marketing assistance, and marriage grants.",
    scheme: "Ashirwad Scheme & Stree Shakti Support",
    portal: "punjab.gov.in",
  },
];

export default function CinematicPresentation({ isOpen, onClose, onLaunchAssistant }) {
  const [activeScene, setActiveScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [sceneProgress, setSceneProgress] = useState(0);
  const [selectedVignette, setSelectedVignette] = useState(0);
  const [selectedHub, setSelectedHub] = useState(INDIA_HUBS[1]); // Punjab
  const [micActive, setMicActive] = useState(false);

  const containerRef = useRef(null);
  const scrollPositionRef = useRef(0);
  const autoPlayTimerRef = useRef(null);
  const progressTimerRef = useRef(null);

  // Preserve scroll position on mount
  useEffect(() => {
    if (isOpen) {
      scrollPositionRef.current = window.scrollY;
      document.body.style.overflow = "hidden";

      // Attempt native browser fullscreen if user allows
      if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {
          // Fallback to CSS full-viewport
        });
      }
    } else {
      document.body.style.overflow = "";
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Clean exit handler with exact scroll restoration
  const handleExit = useCallback(() => {
    setIsPlaying(false);
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
    document.body.style.overflow = "";
    onClose();

    // Restore scroll position cleanly
    setTimeout(() => {
      window.scrollTo({
        top: scrollPositionRef.current,
        behavior: "instant",
      });
    }, 50);
  }, [onClose]);

  // Keyboard navigation: Escape to exit, Arrow keys to navigate
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleExit();
      } else if (e.key === "ArrowRight") {
        nextScene();
      } else if (e.key === "ArrowLeft") {
        prevScene();
      } else if (e.key === " ") {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleExit]);

  // Listen to native fullscreen changes (e.g. user presses F11 or Esc)
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isOpen) {
        // Native fullscreen was exited, keep presentation open in full-viewport mode
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [isOpen]);

  // Scene progression timers
  const SCENE_DURATION_MS = 8000;
  const TICK_INTERVAL_MS = 80;

  const nextScene = () => {
    setActiveScene((cur) => (cur + 1) % SCENES.length);
    setSceneProgress(0);
  };

  const prevScene = () => {
    setActiveScene((cur) => (cur - 1 + SCENES.length) % SCENES.length);
    setSceneProgress(0);
  };

  useEffect(() => {
    if (!isOpen || !isPlaying) return;

    progressTimerRef.current = setInterval(() => {
      setSceneProgress((prev) => {
        const next = prev + (TICK_INTERVAL_MS / SCENE_DURATION_MS) * 100;
        if (next >= 100) {
          nextScene();
          return 0;
        }
        return next;
      });
    }, TICK_INTERVAL_MS);

    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [isOpen, isPlaying, activeScene]);

  // Double-click background to exit presentation (guarded against buttons/interactive content)
  const handleBackgroundDoubleClick = (e) => {
    if (e.target === containerRef.current || e.target.dataset.scenebg === "true") {
      handleExit();
    }
  };

  if (!isOpen) return null;

  const cur = SCENES[activeScene];

  return (
    <div
      ref={containerRef}
      onDoubleClick={handleBackgroundDoubleClick}
      className="fixed inset-0 z-[99999] bg-[#050505] text-white flex flex-col justify-between overflow-hidden select-none font-sans"
      role="dialog"
      aria-modal="true"
      aria-label="YojanaSathi Cinematic Product Presentation"
    >
      {/* ── TOP BAR: BRAND + EXIT CONTROL ───────────────────────────── */}
      <header className="relative z-50 px-6 sm:px-10 pt-6 flex items-center justify-between pointer-events-auto">
        {/* Brand Monolithic Wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#F5A623] to-[#FFC66B] flex items-center justify-center text-[#050505] font-mono text-xs font-bold shadow-[0_0_15px_rgba(245,166,35,0.4)]">
            YS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading text-lg font-bold tracking-tight text-white">
                YOJANASATHI
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#F5A623] border border-[#F5A623]/40 bg-[#F5A623]/10 px-1.5 py-0.5 rounded">
                CINEMATIC
              </span>
            </div>
            <p className="text-[10px] text-[#737373] font-mono">
              SCENE {cur.num} OF 05 • {cur.label.toUpperCase()}
            </p>
          </div>
        </div>

        {/* TOP-RIGHT MANDATORY EXIT PRESENTATION BUTTON */}
        <button
          type="button"
          onClick={handleExit}
          className="group px-4 py-2 rounded-full bg-black/70 hover:bg-[#F5A623] text-white hover:text-black border border-white/20 hover:border-[#F5A623] transition-all duration-200 flex items-center gap-2 shadow-2xl backdrop-blur-md cursor-pointer"
          aria-label="Exit Presentation"
        >
          <span className="font-mono text-xs font-semibold tracking-wide uppercase">
            Exit Presentation
          </span>
          <div className="w-5 h-5 rounded-full bg-white/10 group-hover:bg-black/20 flex items-center justify-center transition-colors">
            <X className="w-3.5 h-3.5 text-current" />
          </div>
        </button>
      </header>

      {/* ── CENTER SCENE STAGE (1 OF 5) ─────────────────────────────── */}
      <main
        data-scenebg="true"
        className="relative z-10 flex-grow flex items-center justify-center px-4 sm:px-12 py-6 overflow-hidden"
      >
        {/* ── SCENE 01: DISCOVER INDIA ── */}
        {activeScene === 0 && (
          <div
            data-scenebg="true"
            className="w-full h-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
          >
            {/* Left Narrative */}
            <div className="lg:col-span-6 space-y-6 animate-fadeIn">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#151515] border border-[#262626] text-xs">
                <span className="w-2 h-2 rounded-full bg-[#F5A623] animate-pulse" />
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#B8B8B8]">
                  Scene 01 • Territorial Intelligence
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1]">
                India is full of opportunities. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F5A623] via-[#FFC66B] to-[#F5A623]">
                  Find yours.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-[#B8B8B8] max-w-xl leading-relaxed">
                Discover government welfare schemes, understand verified eligibility requirements,
                and access benefits across central and state welfare programs through intelligent conversational technology.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-mono text-[#737373]">
                <span className="flex items-center gap-1.5 text-white">
                  <ShieldCheck className="w-4 h-4 text-[#F5A623]" /> 672 Indexed Programs
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5 text-white">
                  <Globe className="w-4 h-4 text-[#FFC66B]" /> 100% Official Portals
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5 text-white">
                  <Cpu className="w-4 h-4 text-[#10B981]" /> Zero Hallucinations
                </span>
              </div>
            </div>

            {/* Right Geographical Map Canvas */}
            <div className="lg:col-span-6 h-[400px] sm:h-[520px] relative flex items-center justify-center">
              <IndiaMapCanvas
                activeHubId="delhi"
                interactive={false}
                showAllConnections={true}
              />
            </div>
          </div>
        )}

        {/* ── SCENE 02: INDIA'S DIVERSITY ── */}
        {activeScene === 1 && (
          <div
            data-scenebg="true"
            className="w-full h-full max-w-7xl mx-auto flex flex-col justify-between py-2 space-y-6 animate-fadeIn"
          >
            {/* Top Scene Text */}
            <div className="max-w-3xl space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#151515] border border-[#262626] text-xs">
                <span className="w-2 h-2 rounded-full bg-[#F5A623]" />
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#B8B8B8]">
                  Scene 02 • Human Diversity
                </span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
                One country. Millions of different needs.
              </h2>
              <p className="text-sm sm:text-base text-[#B8B8B8]">
                From marginal farmers in rural districts to ambitious university scholars and women artisans,
                welfare delivery must adapt to every individual circumstance.
              </p>
            </div>

            {/* Cinematic Vignette Showcase */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Main Cinematic Visual */}
              <div className="lg:col-span-8 relative rounded-2xl overflow-hidden border border-[#262626] bg-[#101010] min-h-[300px] sm:min-h-[400px] shadow-2xl">
                <Image
                  src={DIVERSITY_VIGNETTES[selectedVignette].image}
                  alt={DIVERSITY_VIGNETTES[selectedVignette].label}
                  fill
                  priority
                  className="object-cover object-center transition-all duration-700 hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 65vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                {/* Overlaid Vignette Card */}
                <div className="absolute bottom-6 left-6 right-6 p-5 rounded-xl bg-black/80 backdrop-blur-md border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-[#F5A623] uppercase tracking-wider font-semibold">
                      {DIVERSITY_VIGNETTES[selectedVignette].role}
                    </span>
                    <span className="text-[11px] font-mono text-[#737373]">
                      PORTAL: {DIVERSITY_VIGNETTES[selectedVignette].portal}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    {DIVERSITY_VIGNETTES[selectedVignette].label}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#B8B8B8]">
                    {DIVERSITY_VIGNETTES[selectedVignette].context}
                  </p>
                  <div className="pt-1 flex items-center justify-between text-xs border-t border-white/10">
                    <span className="text-[#E5E5E5]">
                      <strong className="text-[#FFC66B]">Entitled Welfare:</strong> {DIVERSITY_VIGNETTES[selectedVignette].scheme}
                    </span>
                    <span className="text-[#10B981] font-mono flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 100% Verified
                    </span>
                  </div>
                </div>
              </div>

              {/* Selector Tabs */}
              <div className="lg:col-span-4 flex flex-col justify-between gap-3">
                {DIVERSITY_VIGNETTES.map((vig, idx) => (
                  <button
                    key={vig.id}
                    type="button"
                    onClick={() => setSelectedVignette(idx)}
                    className={`p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                      selectedVignette === idx
                        ? "bg-[#151515] border-[#F5A623] shadow-[0_0_20px_rgba(245,166,35,0.15)]"
                        : "bg-[#101010] border-[#262626] opacity-70 hover:opacity-100 hover:border-[#333333]"
                    }`}
                  >
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#F5A623] block mb-1">
                      0{idx + 1} • {vig.role}
                    </span>
                    <h4 className="text-base font-bold text-white mb-1">{vig.label}</h4>
                    <p className="text-xs text-[#B8B8B8] line-clamp-2">{vig.need}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── SCENE 03: EVERY STATE, EVERY CITIZEN ── */}
        {activeScene === 2 && (
          <div
            data-scenebg="true"
            className="w-full h-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-fadeIn"
          >
            {/* Left Interactive Map */}
            <div className="lg:col-span-7 h-[380px] sm:h-[500px] relative flex items-center justify-center">
              <IndiaMapCanvas
                activeHubId={selectedHub?.id}
                onSelectHub={(hub) => setSelectedHub(hub)}
                interactive={true}
                showAllConnections={true}
              />
            </div>

            {/* Right Regional Scheme Intelligence Panel */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#151515] border border-[#262626] text-xs">
                  <MapPin className="w-3.5 h-3.5 text-[#F5A623]" />
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[#B8B8B8]">
                    Scene 03 • Regional Welfare Ingestion
                  </span>
                </div>
                <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
                  From every state. <br />
                  <span className="text-[#FFC66B]">For every citizen.</span>
                </h2>
                <p className="text-sm text-[#B8B8B8]">
                  YojanaSathi indexes verified state gazettes and central schemes, allowing citizens
                  to discover opportunities managed by their own state government.
                </p>
              </div>

              {/* State Card */}
              <div className="p-6 rounded-2xl bg-[#151515] border border-[#262626] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#262626]">
                  <div>
                    <span className="font-mono text-xs text-[#F5A623] uppercase tracking-wider">
                      Selected Jurisdiction
                    </span>
                    <h3 className="text-xl font-bold text-white">{selectedHub?.name}</h3>
                  </div>
                  <span className="font-mono text-xs text-[#10B981] bg-[#10B981]/10 px-2.5 py-1 rounded-md border border-[#10B981]/30 font-semibold">
                    {selectedHub?.count}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-[#B8B8B8]">
                  <p>
                    <strong className="text-white">Active Departmental Indexing: </strong>
                    {selectedHub?.schemes}
                  </p>
                  <p>
                    <strong className="text-white">Official Data Source: </strong>
                    State Gazettes, Seva Sindhu, Antyodaya Saral, and myScheme API Setu.
                  </p>
                </div>

                {/* State Quick Switchers */}
                <div className="pt-2 flex flex-wrap gap-2">
                  {INDIA_HUBS.filter((h) => h.active).map((h) => (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => setSelectedHub(h)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                        selectedHub?.id === h.id
                          ? "bg-[#F5A623] text-black font-semibold shadow-[0_0_12px_rgba(245,166,35,0.4)]"
                          : "bg-[#101010] text-[#B8B8B8] hover:text-white border border-[#262626]"
                      }`}
                    >
                      {h.name.split(" ")[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── SCENE 04: INTELLIGENT SCHEME MATCHING ── */}
        {activeScene === 3 && (
          <div
            data-scenebg="true"
            className="w-full h-full max-w-7xl mx-auto space-y-6 flex flex-col justify-center animate-fadeIn"
          >
            <div className="text-center max-w-3xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#151515] border border-[#262626] text-xs">
                <Cpu className="w-3.5 h-3.5 text-[#F5A623]" />
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#B8B8B8]">
                  Scene 04 • Zero-Hallucination Matching Engine
                </span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
                Finding the right scheme should not be complicated.
              </h2>
              <p className="text-sm sm:text-base text-[#B8B8B8]">
                Natural citizen language is translated into structured demographic parameters, evaluated
                against 45+ deterministic criteria from official state gazettes.
              </p>
            </div>

            {/* 3-Column Execution Architecture Visual */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Step 1: Citizen Natural Query */}
              <div className="p-6 rounded-2xl bg-[#151515] border border-[#262626] space-y-4">
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#F5A623] block font-semibold">
                  01 • Natural Language Stream
                </span>
                <div className="p-4 rounded-xl bg-[#101010] border border-[#262626] text-sm text-[#E5E5E5] font-medium leading-relaxed">
                  &ldquo;Main Punjab se ek chhota kisan hoon, mere paas 3 acre zameen hai. Kheti ke liye sarkari yojana batao.&rdquo;
                </div>
                <div className="text-xs text-[#737373] font-mono">
                  Intent: <span className="text-[#FFC66B]">SCHEME_QUERY (98.4%)</span>
                </div>
              </div>

              {/* Step 2: CRF Entity Parameter Extraction */}
              <div className="p-6 rounded-2xl bg-[#151515] border border-[#262626] space-y-3">
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#FFC66B] block font-semibold">
                  02 • Extracted Profile Parameters
                </span>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-[#101010] border border-[#262626] flex justify-between">
                    <span className="text-[#737373]">Occupation</span>
                    <span className="font-mono font-semibold text-white">Farmer (B-OCC)</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#101010] border border-[#262626] flex justify-between">
                    <span className="text-[#737373]">State Jurisdiction</span>
                    <span className="font-mono font-semibold text-white">Punjab (B-STATE)</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#101010] border border-[#262626] flex justify-between">
                    <span className="text-[#737373]">Landholding</span>
                    <span className="font-mono font-semibold text-white">3 Acres (Marginal)</span>
                  </div>
                </div>
              </div>

              {/* Step 3: Deterministic Rule Verification */}
              <div className="p-6 rounded-2xl bg-[#151515] border border-[#262626] space-y-3">
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#10B981] block font-semibold">
                  03 • Verified Scheme Entitlement
                </span>
                <div className="p-4 rounded-xl bg-[#101010] border border-[#10B981]/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">PM-Kisan Samman Nidhi</span>
                    <span className="text-[10px] font-mono text-[#10B981] bg-[#10B981]/15 px-2 py-0.5 rounded font-semibold">
                      ELIGIBLE
                    </span>
                  </div>
                  <p className="text-xs text-[#B8B8B8]">
                    Direct DBT transfer of ₹6,000 / year in 3 equal four-monthly installments.
                  </p>
                  <div className="pt-2 border-t border-[#262626] text-[11px] text-[#737373] flex justify-between">
                    <span>Portal: pmkisan.gov.in</span>
                    <span className="text-[#F5A623]">100% Rules Pass</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── SCENE 05: MULTILINGUAL VOICE ASSISTANT ── */}
        {activeScene === 4 && (
          <div
            data-scenebg="true"
            className="w-full h-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-fadeIn"
          >
            {/* Left Glowing Microphone Visual */}
            <div className="lg:col-span-6 relative flex items-center justify-center">
              <div className="relative w-[300px] sm:w-[420px] h-[300px] sm:h-[420px] rounded-3xl overflow-hidden border border-[#262626] shadow-[0_0_50px_rgba(245,166,35,0.2)] bg-[#101010]">
                <Image
                  src="/images/scene_microphone.jpg"
                  alt="YojanaSathi Multilingual Voice Assistant"
                  fill
                  priority
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30" />

                {/* Animated Waveform Overlay */}
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-black/80 backdrop-blur-md border border-[#F5A623]/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-[#F5A623]" />
                    <span className="font-mono text-xs text-white">Voice Waveform Input</span>
                  </div>
                  <div className="flex items-center gap-1 h-6">
                    {[40, 80, 100, 60, 30, 90, 70, 40, 85, 95, 30].map((h, i) => (
                      <div
                        key={i}
                        className="w-1 bg-[#F5A623] rounded-full animate-pulse"
                        style={{ height: `${h}%`, animationDelay: `${i * 90}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Narrative & Action */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#151515] border border-[#262626] text-xs">
                <Mic className="w-3.5 h-3.5 text-[#F5A623]" />
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#B8B8B8]">
                  Scene 05 • Multilingual Conversational AI
                </span>
              </div>

              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
                Just speak. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F5A623] via-[#FFC66B] to-[#F5A623]">
                  YojanaSathi listens.
                </span>
              </h2>

              <p className="text-base sm:text-lg text-[#B8B8B8] leading-relaxed">
                Describe your circumstances in your mother tongue. Our speech recognition and NLP
                engine understands native dialects without penalizing regional pronunciations.
              </p>

              {/* Supported Languages Pills */}
              <div className="space-y-2">
                <span className="font-mono text-xs text-[#737373] uppercase tracking-wider">
                  Supported Languages:
                </span>
                <div className="flex flex-wrap gap-2 text-xs font-medium">
                  <span className="px-3 py-1.5 rounded-lg bg-[#151515] border border-[#262626] text-white">
                    हिन्दी (Hindi)
                  </span>
                  <span className="px-3 py-1.5 rounded-lg bg-[#151515] border border-[#262626] text-white">
                    ਪੰਜਾਬੀ (Punjabi)
                  </span>
                  <span className="px-3 py-1.5 rounded-lg bg-[#151515] border border-[#262626] text-white">
                    English (Indian Dialects)
                  </span>
                  <span className="px-3 py-1.5 rounded-lg bg-[#151515] border border-[#262626] text-[#F5A623]">
                    Hinglish (Colloquial)
                  </span>
                </div>
              </div>

              {/* Interactive CTA to Launch Real Voice Engine */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => {
                    handleExit();
                    if (onLaunchAssistant) onLaunchAssistant();
                  }}
                  className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#F5A623] to-[#FFC66B] hover:brightness-110 text-[#050505] font-bold text-sm shadow-[0_0_25px_rgba(245,166,35,0.4)] transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Mic className="w-4 h-4" />
                  <span>Start Voice Assistant Now</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── BOTTOM TIMELINE & PLAYBACK CONTROLS ─────────────────────── */}
      <footer className="relative z-50 px-6 sm:px-10 pb-6 pt-3 flex flex-col sm:flex-row items-center justify-between gap-4 pointer-events-auto border-t border-white/5 bg-[#050505]/60 backdrop-blur-sm">
        {/* Play / Pause & Prev / Next Arrows */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            className="w-9 h-9 rounded-full bg-[#151515] hover:bg-[#262626] border border-white/10 flex items-center justify-center text-white transition-colors cursor-pointer"
            aria-label={isPlaying ? "Pause Presentation" : "Play Presentation"}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-[#F5A623]" />}
          </button>

          <button
            type="button"
            onClick={prevScene}
            className="w-9 h-9 rounded-full bg-[#151515] hover:bg-[#262626] border border-white/10 flex items-center justify-center text-[#B8B8B8] hover:text-white transition-colors cursor-pointer"
            aria-label="Previous Scene"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={nextScene}
            className="w-9 h-9 rounded-full bg-[#151515] hover:bg-[#262626] border border-white/10 flex items-center justify-center text-[#B8B8B8] hover:text-white transition-colors cursor-pointer"
            aria-label="Next Scene"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <span className="text-xs font-mono text-[#737373] ml-2 hidden sm:inline">
            Double-click background or press Esc to exit
          </span>
        </div>

        {/* 5-Scene Progress Segment Indicators */}
        <div className="flex items-center gap-2">
          {SCENES.map((scene, idx) => {
            const isActive = activeScene === idx;
            const isCompleted = activeScene > idx;

            return (
              <button
                key={scene.id}
                type="button"
                onClick={() => {
                  setActiveScene(idx);
                  setSceneProgress(0);
                }}
                className="group flex flex-col items-start gap-1 p-1 text-left cursor-pointer"
                aria-label={`Jump to ${scene.label}`}
              >
                <div className="w-16 sm:w-24 h-1 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r from-[#F5A623] to-[#FFC66B] transition-all ${
                      isActive ? "duration-75" : "duration-300"
                    }`}
                    style={{
                      width: isActive ? `${sceneProgress}%` : isCompleted ? "100%" : "0%",
                    }}
                  />
                </div>
                <span
                  className={`font-mono text-[10px] hidden sm:block transition-colors ${
                    isActive ? "text-[#F5A623] font-semibold" : "text-[#737373] group-hover:text-white"
                  }`}
                >
                  {scene.num} {scene.label}
                </span>
              </button>
            );
          })}
        </div>
      </footer>
    </div>
  );
}

