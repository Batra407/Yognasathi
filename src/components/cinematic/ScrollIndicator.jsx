"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ArrowDown } from "lucide-react";

export default function ScrollIndicator({ targetId = "story-opportunity" }) {
  const indicatorRef = useRef(null);

  useEffect(() => {
    if (!indicatorRef.current) return;

    const ctx = gsap.context(() => {
      gsap.to(".scroll-arrow-icon", {
        y: 4,
        repeat: -1,
        yoyo: true,
        duration: 1.2,
        ease: "power1.inOut",
      });
    }, indicatorRef);

    return () => ctx.revert();
  }, []);

  const handleClick = (e) => {
    e.preventDefault();
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollBy({ top: window.innerHeight * 0.85, behavior: "smooth" });
    }
  };

  return (
    <button
      ref={indicatorRef}
      type="button"
      onClick={handleClick}
      aria-label="Scroll to explore YojanaSathi platform"
      className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/15 hover:border-[#F5A623]/60 text-white/80 hover:text-white text-xs font-mono tracking-wider transition-all duration-200 cursor-pointer shadow-lg"
    >
      <span>Scroll to explore</span>
      <ArrowDown className="scroll-arrow-icon w-3.5 h-3.5 text-[#F5A623] transition-transform group-hover:text-[#FFC66B]" />
    </button>
  );
}

