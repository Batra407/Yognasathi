"use client";

import { useEffect, useRef, createContext, useContext } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Ensure GSAP plugins are registered client-side
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const LenisContext = createContext(null);

export function useLenis() {
  return useContext(LenisContext);
}

export default function SmoothScrollProvider({ children }) {
  const lenisRef = useRef(null);

  useEffect(() => {
    // Check for prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      return; // Use native scrolling if user prefers reduced motion
    }

    // Initialize Lenis with enterprise-tuned settings (fast, fluid, responsive)
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential deceleration
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      touchMultiplier: 1.5,
      infinite: false,
    });

    lenisRef.current = lenis;

    // Synchronize Lenis scroll with GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);

    // Drive Lenis RAF loop through GSAP's internal high-performance ticker
    const updateTicker = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateTicker);
    gsap.ticker.lagSmoothing(0);

    // Anchor link smooth scroll interception
    const handleAnchorClick = (e) => {
      const target = e.target.closest("a");
      if (target && target.hash && target.origin === window.location.origin && target.pathname === window.location.pathname) {
        const targetElement = document.querySelector(target.hash);
        if (targetElement) {
          e.preventDefault();
          lenis.scrollTo(targetElement, { offset: -80, duration: 1.2 });
        }
      }
    };

    document.addEventListener("click", handleAnchorClick);

    // Cleanup on unmount
    return () => {
      document.removeEventListener("click", handleAnchorClick);
      gsap.ticker.remove(updateTicker);
      lenis.destroy();
      lenisRef.current = null;
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  return (
    <LenisContext.Provider value={lenisRef.current}>
      {children}
    </LenisContext.Provider>
  );
}
