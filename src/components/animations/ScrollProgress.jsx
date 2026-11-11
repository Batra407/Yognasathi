"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function ScrollProgress() {
  const barRef = useRef(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    const st = ScrollTrigger.create({
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        gsap.set(bar, { scaleX: self.progress });
      },
    });

    return () => {
      st.kill();
    };
  }, []);

  return (
    <div
      className="fixed top-0 left-0 right-0 h-[2px] z-[999] pointer-events-none origin-left"
      aria-hidden="true"
    >
      <div
        ref={barRef}
        className="w-full h-full bg-gradient-to-r from-[#F5A623] via-[#FFC66B] to-[#F5A623] origin-left scale-x-0 will-change-transform shadow-[0_0_8px_#F5A623]"
      />
    </div>
  );
}
