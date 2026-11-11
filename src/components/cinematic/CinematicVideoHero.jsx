"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import gsap from "gsap";
import { CINEMATIC_SCENES } from "@/data/cinematicScenes";
import HeroOverlay from "./HeroOverlay";
import ScrollIndicator from "./ScrollIndicator";

export default function CinematicVideoHero({
  onPlayPresentation,
}) {
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [activeSlot, setActiveSlot] = useState("A"); // 'A' or 'B'
  const [slotAScene, setSlotAScene] = useState(CINEMATIC_SCENES[0]);
  const [slotBScene, setSlotBScene] = useState(CINEMATIC_SCENES[1]);
  const [videoAError, setVideoAError] = useState(false);
  const [videoBError, setVideoBError] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const containerRef = useRef(null);
  const videoARef = useRef(null);
  const videoBRef = useRef(null);
  const timerRef = useRef(null);
  const isTransitioningRef = useRef(false);

  // Check reduced-motion preference
  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia) {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setPrefersReducedMotion(mediaQuery.matches);

      const handleChange = (e) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, []);

  // Safe video playback helper
  const safePlay = useCallback((videoEl) => {
    if (!videoEl) return;
    videoEl.muted = true;
    const playPromise = videoEl.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        // Autoplay policy or loading error handled gracefully
        console.warn("Video playback deferred:", err?.message || err);
      });
    }
  }, []);

  // Initial video startup
  useEffect(() => {
    if (videoARef.current) {
      safePlay(videoARef.current);
    }
  }, [safePlay]);

  // Transition to next scene index
  const transitionToScene = useCallback(
    (targetIndex) => {
      if (isTransitioningRef.current) return;
      isTransitioningRef.current = true;

      const nextScene = CINEMATIC_SCENES[targetIndex];
      const currentSlot = activeSlot;
      const incomingSlot = currentSlot === "A" ? "B" : "A";

      const currentVideo = currentSlot === "A" ? videoARef.current : videoBRef.current;
      const incomingVideo = incomingSlot === "A" ? videoARef.current : videoBRef.current;

      // Update incoming scene
      if (incomingSlot === "A") {
        setSlotAScene(nextScene);
        setVideoAError(false);
      } else {
        setSlotBScene(nextScene);
        setVideoBError(false);
      }

      // Prepare incoming video
      if (incomingVideo) {
        incomingVideo.currentTime = 0;
        safePlay(incomingVideo);
      }

      // Smooth GSAP crossfade (1.2s)
      const fadeDuration = prefersReducedMotion ? 0.3 : 1.2;

      gsap.to(incomingVideo, {
        opacity: 1,
        duration: fadeDuration,
        ease: "power2.inOut",
        onStart: () => {
          if (incomingVideo) safePlay(incomingVideo);
        },
      });

      gsap.to(currentVideo, {
        opacity: 0,
        duration: fadeDuration,
        ease: "power2.inOut",
        onComplete: () => {
          if (currentVideo) {
            currentVideo.pause();
          }

          // Complete slot handover
          setActiveSlot(incomingSlot);
          setActiveSceneIndex(targetIndex);
          isTransitioningRef.current = false;

          // Preload upcoming scene into the now-inactive slot
          const upcomingIndex = (targetIndex + 1) % CINEMATIC_SCENES.length;
          const upcomingScene = CINEMATIC_SCENES[upcomingIndex];

          if (incomingSlot === "B") {
            setSlotAScene(upcomingScene);
            if (videoARef.current) videoARef.current.load();
          } else {
            setSlotBScene(upcomingScene);
            if (videoBRef.current) videoBRef.current.load();
          }
        },
      });
    },
    [activeSlot, prefersReducedMotion, safePlay]
  );

  // Automatic scene cycling loop (~8 seconds per scene)
  useEffect(() => {
    if (prefersReducedMotion) return;

    const currentDuration = CINEMATIC_SCENES[activeSceneIndex]?.duration || 8;

    timerRef.current = setTimeout(() => {
      const nextIndex = (activeSceneIndex + 1) % CINEMATIC_SCENES.length;
      transitionToScene(nextIndex);
    }, currentDuration * 1000);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [activeSceneIndex, prefersReducedMotion, transitionToScene]);

  return (
    <section className="relative px-3 sm:px-6 lg:px-8 pt-2 pb-12 sm:pb-16 max-w-[1720px] mx-auto w-full">
      
      {/* 
        Hero Stage Container:
        - Scale.com style rounded corners (16-24px)
        - Desktop height: 85-92vh
        - Fills width
        - Overflow hidden
        - Subtle border
      */}
      <div
        ref={containerRef}
        className="relative w-full min-h-[580px] sm:min-h-[660px] lg:min-h-[88vh] max-h-[1020px] rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-900 shadow-2xl"
      >
        
        {/* ======================================================== */}
        {/* VIDEO A LAYER */}
        {/* ======================================================== */}
        <div
          className="absolute inset-0 w-full h-full transition-opacity duration-300"
          style={{ opacity: activeSlot === "A" ? 1 : 0 }}
        >
          {!videoAError ? (
            <video
              ref={videoARef}
              src={slotAScene.videoSrc}
              poster={slotAScene.posterSrc}
              autoPlay
              muted
              playsInline
              loop
              preload="auto"
              onError={() => setVideoAError(true)}
              className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
            />
          ) : (
            <Image
              src={slotAScene.posterSrc || slotAScene.fallbackPoster}
              alt={slotAScene.title}
              fill
              priority
              className="object-cover select-none pointer-events-none"
            />
          )}
        </div>

        {/* ======================================================== */}
        {/* VIDEO B LAYER */}
        {/* ======================================================== */}
        <div
          className="absolute inset-0 w-full h-full transition-opacity duration-300"
          style={{ opacity: activeSlot === "B" ? 1 : 0 }}
        >
          {!videoBError ? (
            <video
              ref={videoBRef}
              src={slotBScene.videoSrc}
              poster={slotBScene.posterSrc}
              muted
              playsInline
              loop
              preload="auto"
              onError={() => setVideoBError(true)}
              className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
            />
          ) : (
            <Image
              src={slotBScene.posterSrc || slotBScene.fallbackPoster}
              alt={slotBScene.title}
              fill
              className="object-cover select-none pointer-events-none"
            />
          )}
        </div>

        {/* ======================================================== */}
        {/* MINIMAL SUBTLE GRADIENT (ONLY FOR TEXT READABILITY) */}
        {/* Preserves natural daylight and vivid colors of the video */}
        {/* ======================================================== */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent pointer-events-none"
          aria-hidden="true"
        />

        {/* ======================================================== */}
        {/* PERMANENT EDITORIAL HEADLINE & CLEAN 2-BUTTON OVERLAY */}
        {/* ======================================================== */}
        <HeroOverlay
          onPlayPresentation={onPlayPresentation}
        />

        {/* ======================================================== */}
        {/* MINIMAL BOTTOM-RIGHT SCROLL INDICATOR */}
        {/* ======================================================== */}
        <div className="absolute bottom-8 right-8 sm:bottom-12 sm:right-12 z-30 pointer-events-auto">
          <ScrollIndicator targetId="story-opportunity" />
        </div>

      </div>

    </section>
  );
}
