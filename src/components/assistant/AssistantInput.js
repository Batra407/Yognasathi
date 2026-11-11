"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import VoiceOrb from "./VoiceOrb";
import AssistantResponse from "./AssistantResponse";

const SUPPORTED_LANGUAGES = [
  { code: "hi-IN", shortCode: "hi", label: "हिन्दी (Hindi)" },
  { code: "en-IN", shortCode: "en", label: "English" },
  { code: "pa-IN", shortCode: "pa", label: "ਪੰਜਾਬੀ (Punjabi)" }
];

const SAMPLE_PROMPTS = {
  "hi-IN": [
    "मैं पंजाब का किसान हूँ और कृषि सब्सिडी योजना के बारे में जानना चाहता हूँ",
    "मेरी उम्र 22 साल है, मैं कॉलेज छात्र हूँ और स्कॉलरशिप चाहिए",
    "मैं असंगठित क्षेत्र का मजदूर हूँ, पेंशन योजना खोज रहा हूँ"
  ],
  "en-IN": [
    "I am a 35 year old farmer from Punjab with annual income 2 lakh and need a scheme",
    "I am a college student looking for higher education scholarship",
    "I am an unorganized worker looking for pension and healthcare scheme"
  ],
  "pa-IN": [
    "ਮੈਂ 35 ਸਾਲ ਦਾ ਪੰਜਾਬ ਦਾ ਕਿਸਾਨ ਹਾਂ ਅਤੇ ਟਿਊਬਵੈੱਲ ਸਬਸਿਡੀ ਯੋਜਨਾ ਲੱਭ ਰਿਹਾ ਹਾਂ",
    "ਮੈਂ ਵਿਦਿਆਰਥੀ ਹਾਂ ਅਤੇ ਮੈਨੂੰ ਉੱਚ ਸਿੱਖਿਆ ਸਕਾਲਰਸ਼ਿਪ ਚਾਹੀਦੀ ਹੈ",
    "ਮੈਨੂੰ ਸਮਾਜਿਕ ਸੁਰੱਖਿਆ ਪੈਨਸ਼ਨ ਯੋਜਨਾ ਚਾਹੀਦੀ ਹੈ"
  ]
};

export default function AssistantInput({
  initialLanguage = "hi-IN",
  initialMode = "speak",
  inputId = "text-requirement",
  buttonText = "Search Assistant"
}) {
  const [selectedLangCode, setSelectedLangCode] = useState(
    SUPPORTED_LANGUAGES.some((l) => l.code === initialLanguage) ? initialLanguage : "hi-IN"
  );
  const [inputMode, setInputMode] = useState(initialMode === "type" ? "type" : "speak");

  // Explicit visual states: 'idle' | 'listening' | 'processing' | 'searching' | 'speaking' | 'error'
  const [conversationState, setConversationState] = useState("idle");
  const [statusMessage, setStatusMessage] = useState("Tap orb to start speaking or type your circumstances.");

  const [transcript, setTranscript] = useState("");
  const [textInput, setTextInput] = useState("");
  const [mediaStream, setMediaStream] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [assistantResult, setAssistantResult] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [missingInfoFollowUp, setMissingInfoFollowUp] = useState([]);

  const recognitionRef = useRef(null);
  const textareaRef = useRef(null);
  const streamRef = useRef(null);

  // Stop active media tracks safely
  const stopMediaTracks = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // Safe ignore
        }
      });
      streamRef.current = null;
    }
    setMediaStream(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // Safe ignore
        }
      }
      stopMediaTracks();
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [stopMediaTracks]);

  // Handle Speech Recognition Initiation
  const startListening = async () => {
    const SpeechRecognition = typeof window !== "undefined"
      ? (window.SpeechRecognition || window.webkitSpeechRecognition)
      : null;

    if (!SpeechRecognition) {
      setConversationState("error");
      setStatusMessage("Speech recognition is not supported in this browser. Please use text mode below.");
      setInputMode("type");
      return;
    }

    try {
      setConversationState("listening");
      setStatusMessage("Listening... Speak your requirement clearly.");
      setApiError(null);

      // Access real microphone stream for audio visualizer
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
          streamRef.current = stream;
          setMediaStream(stream);
        } catch (micErr) {
          console.warn("Microphone stream visualization permission:", micErr);
        }
      }

      const recognition = new SpeechRecognition();
      recognition.lang = selectedLangCode;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      let finalTranscriptAccumulator = "";

      recognition.onresult = (event) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const chunk = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscriptAccumulator += (finalTranscriptAccumulator ? " " : "") + chunk;
          } else {
            interim += chunk;
          }
        }
        const combined = (finalTranscriptAccumulator + " " + interim).trim();
        setTranscript(combined);
        setTextInput(combined);
      };

      recognition.onerror = (event) => {
        try {
          recognition.abort();
        } catch {
          // Safe ignore native abort error
        }

        if (event.error === "no-speech") {
          setStatusMessage("No speech was detected. Tap orb and try speaking again.");
          setConversationState("idle");
        } else if (event.error === "aborted") {
          setConversationState("idle");
        } else if (event.error === "network") {
          setStatusMessage("Voice recognition network timeout. Switched to keyboard mode — please type your query below.");
          setConversationState("idle");
          setInputMode("type");
          if (textareaRef.current) {
            textareaRef.current.focus();
          }
        } else if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          setStatusMessage("Microphone permission was denied. Please allow microphone access or type your query below.");
          setConversationState("error");
          setInputMode("type");
        } else {
          setStatusMessage("Speech capture unavailable. Please type your query below.");
          setConversationState("idle");
          setInputMode("type");
        }
        stopMediaTracks();
      };

      recognition.onend = () => {
        stopMediaTracks();
        if (conversationState === "listening") {
          setConversationState("idle");
          setStatusMessage("Speech capture finished. Review or edit your query below.");
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn("Speech recognition initialization notice:", err);
      setConversationState("idle");
      setStatusMessage("Could not initialize microphone. Please type your query.");
      setInputMode("type");
      stopMediaTracks();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Safe ignore
      }
    }
    stopMediaTracks();
    setConversationState("idle");
    setStatusMessage("Listening stopped. Review your requirement below and click Search.");
  };

  const handleToggleListen = () => {
    if (conversationState === "listening") {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleRetry = () => {
    setConversationState("idle");
    setApiError(null);
    setStatusMessage("Ready. Speak your query or type below.");
    startListening();
  };

  const handleClear = () => {
    setTranscript("");
    setTextInput("");
    setAssistantResult(null);
    setApiError(null);
    setMissingInfoFollowUp([]);
    setConversationState("idle");
    setStatusMessage("Cleared. Tell us your circumstances in Hindi, English, or Punjabi.");
  };

  const handleSamplePromptClick = (promptText) => {
    setTextInput(promptText);
    setTranscript(promptText);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
    handleSearch(promptText);
  };

  // Central search execution against authentic API
  const handleSearch = async (overrideQuery = null) => {
    const rawVal = textareaRef.current?.value || "";
    const query = (overrideQuery || textInput || transcript || rawVal).trim();
    if (!query) {
      setStatusMessage("Please speak or type a requirement before searching.");
      return;
    }

    if (conversationState === "listening") {
      stopListening();
    }

    setIsLoading(true);
    setApiError(null);
    setConversationState("searching");
    setStatusMessage("Searching verified citizen welfare schemes...");

    try {
      const response = await fetch("/api/schemes/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: query }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP error ${response.status}`);
      }

      const data = await response.json();
      setAssistantResult(data);
      setConversationState("idle");
      setStatusMessage(
        data.results && data.results.length > 0
          ? `Found ${data.results.length} verified government welfare schemes matching your circumstances.`
          : "No direct welfare scheme match found. Try broadening your description."
      );

      // Check missing profile fields
      const p = data.profile || {};
      const missing = [];
      if (!p.age) missing.push("age");
      if (!p.annualIncome) missing.push("annualIncome");
      if (!p.occupation) missing.push("occupation");
      if (!p.state) missing.push("state");
      setMissingInfoFollowUp(missing);

      // Scroll to results
      setTimeout(() => {
        const resultsEl = document.getElementById("assistant-results");
        if (resultsEl) {
          resultsEl.scrollIntoView({ behavior: "smooth" });
        }
      }, 150);

    } catch (err) {
      console.warn("Assistant API search notice:", err);
      setApiError(err.message || "Failed to search schemes. Please check your connection.");
      setConversationState("error");
      setStatusMessage("Search failed. Please try again or refine your query.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowUpAnswer = (field, value) => {
    const updated = `${textInput.trim()} and my ${field} is ${value}`.trim();
    setTextInput(updated);
    setTranscript(updated);
    handleSearch(updated);
  };

  const handleSpeechStateChange = (speechStatus) => {
    if (speechStatus === "SPEAKING") {
      setConversationState("speaking");
      setStatusMessage("Speaking response (synthesis playback)...");
    } else if (speechStatus === "COMPLETED" || speechStatus === "IDLE") {
      setConversationState("idle");
      setStatusMessage("Response complete. Ask another question or refine your profile.");
    }
  };

  const currentPrompts = SAMPLE_PROMPTS[selectedLangCode] || SAMPLE_PROMPTS["hi-IN"];

  return (
    <div className="w-full space-y-8">
      {/* Top Voice & Query Experience Card */}
      <div className="p-6 sm:p-10 rounded-3xl bg-[#FFFFFF] border border-[#E5EAF1] shadow-lg relative overflow-hidden">
        {/* Subtle radial ambient highlight */}
        <div
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#2563EB]/5 blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">

          {/* Left Column: Voice Orb & Interactive State */}
          <div className="lg:col-span-5 flex flex-col items-center text-center p-6 sm:p-8 rounded-2xl bg-[#F8FAFC] border border-[#E5EAF1]">
            <VoiceOrb
              state={conversationState}
              mediaStream={mediaStream}
              onToggleListen={handleToggleListen}
              onRetry={handleRetry}
              disabled={isLoading}
              size={200}
            />

            <div className="mt-5 space-y-3 max-w-xs">
              <p className="text-xs sm:text-sm font-medium text-[#17243A] leading-relaxed">
                {statusMessage}
              </p>

              <div className="flex items-center justify-center gap-2 pt-1">
                {conversationState === "listening" ? (
                  <button
                    type="button"
                    onClick={stopListening}
                    className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Stop Listening</span>
                  </button>
                ) : conversationState === "error" ? (
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Retry Microphone</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={startListening}
                    disabled={isLoading}
                    className="px-4 py-2 rounded-xl bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#2563EB] font-bold text-xs border border-[#BFDBFE] transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <svg className="w-3.5 h-3.5 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
                    </svg>
                    <span>Start Speaking</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setInputMode("type");
                    setTimeout(() => textareaRef.current?.focus(), 100);
                  }}
                  className="px-3 py-2 rounded-xl text-xs text-[#68758A] hover:text-[#17243A] hover:bg-slate-200/50 transition-colors cursor-pointer"
                >
                  Type instead
                </button>

                {(transcript || textInput) && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="px-3 py-2 rounded-xl text-xs text-[#68758A] hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Controls, Transcript & Typing Box */}
          <div className="lg:col-span-7 space-y-5">

            {/* Header Strip with Language Toggle & Input Mode */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E5EAF1]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#68758A] uppercase tracking-wider">Language:</span>
                <div className="flex rounded-lg bg-[#F1F5F9] p-1 border border-[#E2E8F0]">
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => setSelectedLangCode(lang.code)}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${selectedLangCode === lang.code
                        ? "bg-[#FFFFFF] text-[#2563EB] shadow-xs"
                        : "text-[#68758A] hover:text-[#17243A]"
                        }`}
                    >
                      {lang.label.split(" ")[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mode Toggle: Speak vs Type */}
              <div className="flex rounded-lg bg-[#F1F5F9] p-1 border border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setInputMode("speak")}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${inputMode === "speak"
                    ? "bg-[#FFFFFF] text-[#2563EB] shadow-xs"
                    : "text-[#68758A] hover:text-[#17243A]"
                    }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
                  </svg>
                  <span>Voice</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInputMode("type");
                    setTimeout(() => textareaRef.current?.focus(), 100);
                  }}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${inputMode === "type"
                    ? "bg-[#FFFFFF] text-[#2563EB] shadow-xs"
                    : "text-[#68758A] hover:text-[#17243A]"
                    }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Type</span>
                </button>
              </div>
            </div>

            {/* Editable Live Transcript / Input Area */}
            <div className="space-y-3">
              <label htmlFor={inputId} className="block text-xs font-semibold text-[#17243A]">
                {inputMode === "speak" ? "Spoken Requirement (Editable Transcript):" : "Type Your Need or Circumstance:"}
              </label>

              <div className="relative">
                <textarea
                  id={inputId}
                  ref={textareaRef}
                  rows={3}
                  value={textInput}
                  onInput={(e) => {
                    setTextInput(e.target.value);
                    setTranscript(e.target.value);
                  }}
                  onChange={(e) => {
                    setTextInput(e.target.value);
                    setTranscript(e.target.value);
                  }}
                  placeholder={
                    selectedLangCode === "hi-IN"
                      ? "उदाहरण: मैं पंजाब का 35 वर्षीय किसान हूँ, मुझे सिंचाई व कृषि सब्सिडी योजना चाहिए..."
                      : selectedLangCode === "pa-IN"
                        ? "ਉਦਾਹਰਣ: ਮੈਂ 35 ਸਾਲ ਦਾ ਪੰਜਾਬ ਦਾ ਕਿਸਾਨ ਹਾਂ, ਮੈਨੂੰ ਖੇਤੀ ਸਬਸਿਡੀ ਯੋਜਨਾ ਚਾਹੀਦੀ ਹੈ..."
                        : "e.g., I am a 35 year old farmer from Punjab with 2 lakh annual income looking for agricultural schemes..."
                  }
                  className="w-full p-4 rounded-2xl bg-[#FFFFFF] border border-[#E5EAF1] text-[#17243A] placeholder-[#94A3B8] text-sm focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-blue-100 transition-colors resize-none shadow-xs"
                />

                {textInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setTextInput("");
                      setTranscript("");
                    }}
                    className="absolute top-3 right-3 text-[#68758A] hover:text-[#17243A] text-xs bg-slate-100 hover:bg-slate-200 p-1.5 rounded-lg transition-colors cursor-pointer"
                    aria-label="Clear query text"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="text-xs text-[#68758A]">
                  {textInput.length > 0 && <span>{textInput.split(/\s+/).filter(Boolean).length} words detected</span>}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleSearch()}
                    disabled={isLoading}
                    className="px-6 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-40 text-white font-bold text-sm shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <span>{buttonText}</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Missing Info Interactive Follow-Up Questions */}
            {missingInfoFollowUp.length > 0 && (
              <div className="p-4 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse" />
                  <span className="text-xs font-bold text-[#1D4ED8] uppercase tracking-wide">
                    Suggested Follow-up: Click to provide missing details
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {missingInfoFollowUp.includes("age") && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleFollowUpAnswer("age", "30 years")}
                        className="px-3 py-1 rounded-lg bg-[#FFFFFF] hover:bg-[#DBEAFE] text-xs text-[#17243A] border border-[#BFDBFE] transition-all cursor-pointer font-medium"
                      >
                        + Add Age: 30
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFollowUpAnswer("age", "65 years (Senior Citizen)")}
                        className="px-3 py-1 rounded-lg bg-[#FFFFFF] hover:bg-[#DBEAFE] text-xs text-[#17243A] border border-[#BFDBFE] transition-all cursor-pointer font-medium"
                      >
                        + Senior Citizen (65+)
                      </button>
                    </>
                  )}

                  {missingInfoFollowUp.includes("annualIncome") && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleFollowUpAnswer("annual income", "under 1.5 Lakh")}
                        className="px-3 py-1 rounded-lg bg-[#FFFFFF] hover:bg-[#DBEAFE] text-xs text-[#17243A] border border-[#BFDBFE] transition-all cursor-pointer font-medium"
                      >
                        + Income &lt; ₹1.5 Lakh
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFollowUpAnswer("annual income", "under 2.5 Lakh (BPL)")}
                        className="px-3 py-1 rounded-lg bg-[#FFFFFF] hover:bg-[#DBEAFE] text-xs text-[#17243A] border border-[#BFDBFE] transition-all cursor-pointer font-medium"
                      >
                        + Income &lt; ₹2.5 Lakh
                      </button>
                    </>
                  )}

                  {!textInput.toLowerCase().includes("punjab") && (
                    <button
                      type="button"
                      onClick={() => handleFollowUpAnswer("state", "Punjab")}
                      className="px-3 py-1 rounded-lg bg-[#FFFFFF] hover:bg-[#DBEAFE] text-xs text-[#2563EB] border border-[#BFDBFE] transition-all cursor-pointer font-medium"
                    >
                      + State: Punjab
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Sample Prompts */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-semibold text-[#68758A]">Try asking in your words:</span>
              <div className="flex flex-wrap gap-2">
                {currentPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSamplePromptClick(prompt)}
                    className="text-left text-xs px-3 py-1.5 rounded-lg bg-[#F8FAFC] hover:bg-[#EFF6FF] text-[#17243A] hover:text-[#2563EB] border border-[#E5EAF1] hover:border-[#BFDBFE] transition-colors cursor-pointer"
                  >
                    &ldquo;{prompt.length > 55 ? prompt.slice(0, 52) + "..." : prompt}&rdquo;
                  </button>
                ))}
              </div>
            </div>

            {/* Error banner */}
            {apiError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
                <svg className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="flex-1 flex items-center justify-between gap-2">
                  <span>{apiError}</span>
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="underline hover:text-rose-900 font-bold ml-2 cursor-pointer"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>
      </div>

      {/* Results Section */}
      {assistantResult && (
        <div id="assistant-results" className="scroll-mt-24">
          <AssistantResponse
            result={assistantResult}
            selectedLanguage={selectedLangCode}
            onProvideMissingInfo={(field, val) => handleFollowUpAnswer(field, val)}
            onSpeechStateChange={handleSpeechStateChange}
          />
        </div>
      )}
    </div>
  );
}
