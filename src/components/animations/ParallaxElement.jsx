"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function ParallaxElement({
  children,
  className = "",
  speed = 0.15, // Positive moves slower/upward, negative moves downward
}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      window.innerWidth < 768
    ) {
      return; // Disable parallax on mobile & reduced motion
    }

    const distance = 100 * speed;
    const tween = gsap.fromTo(
      el,
      { y: -distance },
      {
        y: distance,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.2,
        },
      }
    );

    return () => {
      if (tween.scrollTrigger) tween.scrollTrigger.kill();
      tween.kill();
    };
  }, [speed]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
