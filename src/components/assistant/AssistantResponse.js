"use client";

import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import ProfileCard from "./ProfileCard";
import MissingInformation from "./MissingInformation";
import SchemeCard from "./SchemeCard";
import TrustNotice from "./TrustNotice";

export default function AssistantResponse({
  result,
  selectedLanguage = "hi-IN",
  onProvideMissingInfo,
  onSpeechStateChange,
}) {
  const [speechState, setSpeechState] = useState("IDLE"); // IDLE, SPEAKING, PAUSED, COMPLETED
  const resultsContainerRef = useRef(null);

  // GSAP sequential card entry animation
  useEffect(() => {
    if (!result || !result.results || result.results.length === 0) return;

    const cards = resultsContainerRef.current?.querySelectorAll(".scheme-card-item");
    if (!cards || cards.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.07,
          ease: "power2.out",
          clearProps: "all",
        }
      );
    }, resultsContainerRef);

    return () => ctx.revert();
  }, [result]);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!result) return null;

  const { profile, results = [], language } = result;

  // Find all missing information across recommended schemes
  const allMissingInfo = Array.from(
    new Set(results.flatMap((s) => s.missingInformation || []))
  );

  // Text-To-Speech (TTS) handler
  const handleSpeakSummary = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }

    if (speechState === "SPEAKING") {
      window.speechSynthesis.cancel();
      setSpeechState("IDLE");
      if (onSpeechStateChange) onSpeechStateChange("IDLE");
      return;
    }

    if (speechState === "PAUSED") {
      window.speechSynthesis.resume();
      setSpeechState("SPEAKING");
      if (onSpeechStateChange) onSpeechStateChange("SPEAKING");
      return;
    }

    window.speechSynthesis.cancel();

    // Prepare clear, truthful spoken summary
    let summaryText = "";
    if (profile && (profile.occupation || profile.state || profile.age)) {
      const parts = [];
      if (profile.age) parts.push(`${profile.age} years of age`);
      if (profile.occupation) parts.push(`working as ${profile.occupation}`);
      if (profile.state) parts.push(`in ${profile.state}`);
      summaryText += `Identified profile: ${parts.join(", ")}. `;
    }

    if (results.length > 0) {
      summaryText += `Found ${results.length} relevant schemes. `;
      summaryText += `The top result is ${results[0].schemeName} administered by ${results[0].department}. `;
      if (results[0].eligibilityStatus === "ELIGIBLE") {
        summaryText += "Criteria matches confirmed government eligibility rules. ";
      } else {
        summaryText += "Review official criteria to confirm final eligibility. ";
      }
    } else {
      summaryText += "No direct scheme matches were found for these criteria. ";
    }

    const utterance = new SpeechSynthesisUtterance(summaryText);

    const langMap = {
      hi: "hi-IN",
      en: "en-IN",
      pa: "pa-IN",
    };
    utterance.lang = langMap[language] || selectedLanguage || "hi-IN";
    utterance.rate = 0.95;

    utterance.onstart = () => {
      setSpeechState("SPEAKING");
      if (onSpeechStateChange) onSpeechStateChange("SPEAKING");
    };
    utterance.onend = () => {
      setSpeechState("COMPLETED");
      if (onSpeechStateChange) onSpeechStateChange("COMPLETED");
    };
    utterance.onerror = () => {
      setSpeechState("IDLE");
      if (onSpeechStateChange) onSpeechStateChange("IDLE");
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleStopSpeech = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setSpeechState("IDLE");
    if (onSpeechStateChange) onSpeechStateChange("IDLE");
  };

  return (
    <div className="space-y-6" ref={resultsContainerRef}>
      
      {/* Top Summary Banner */}
      <div className="p-6 sm:p-7 rounded-2xl bg-[#FFFFFF] border border-[#E5EAF1] shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
              Discovery Results
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-[#14233B]">
              {results.length > 0
                ? `${results.length} Verified Schemes Identified`
                : "No Matching Schemes Identified"}
            </h3>
          </div>

          {/* Voice Speech Output Controls */}
          {results.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSpeakSummary}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer ${
                  speechState === "SPEAKING"
                    ? "bg-[#2563EB] text-white animate-pulse"
                    : "bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#2563EB] border border-[#BFDBFE]"
                }`}
              >
                {speechState === "SPEAKING" ? (
                  <>
                    <svg className="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                    <span>Speaking Summary...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                    <span>Listen to Spoken Summary</span>
                  </>
                )}
              </button>

              {speechState === "SPEAKING" && (
                <button
                  type="button"
                  onClick={handleStopSpeech}
                  className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900 cursor-pointer"
                  title="Stop Speech"
                >
                  ✕
                </button>
              )}
            </div>
          )}
        </div>

        {/* Structured Citizen Profile Card */}
        {profile && Object.keys(profile).length > 0 && (
          <div className="pt-2">
            <ProfileCard profile={profile} />
          </div>
        )}
      </div>

      {/* Missing Information Notice */}
      {allMissingInfo.length > 0 && (
        <MissingInformation
          missingFields={allMissingInfo}
          onSelectField={(field) => onProvideMissingInfo && onProvideMissingInfo(field, "clarified")}
        />
      )}

      {/* Scheme Cards Grid */}
      {results.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#14233B]">
              Recommended Schemes
            </h4>
            <span className="text-xs text-[#68758A]">
              Ranked by relevance &amp; verified rules
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {results.map((scheme) => (
              <div key={scheme.schemeId} className="scheme-card-item">
                <SchemeCard scheme={scheme} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-2xl bg-[#FFFFFF] border border-[#E5EAF1] text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            🔍
          </div>
          <h4 className="text-base font-bold text-[#14233B]">
            No matching schemes found in Dataset A
          </h4>
          <p className="text-xs text-[#68758A] max-w-md mx-auto leading-relaxed">
            We could not find direct citizen welfare schemes matching those specific keywords. Try describing your occupation (e.g. farmer, student, construction worker), your state, or your age.
          </p>
        </div>
      )}

      {/* Verified Data & Platform Trust Notice */}
      <TrustNotice />

    </div>
  );
}
