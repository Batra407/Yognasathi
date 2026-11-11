"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function RevealSection({
  children,
  className = "",
  delay = 0,
  duration = 0.8,
  yOffset = 30,
  stagger = 0.08,
  childSelector = null,
}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const targets = childSelector ? el.querySelectorAll(childSelector) : el;
    gsap.set(targets, { y: yOffset, opacity: 0 });

    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 86%",
      once: true,
      onEnter: () => {
        gsap.to(targets, {
          y: 0,
          opacity: 1,
          duration: duration,
          delay: delay,
          stagger: childSelector ? stagger : 0,
          ease: "power2.out",
        });
      },
    });

    return () => {
      st.kill();
      gsap.killTweensOf(targets);
    };
  }, [delay, duration, yOffset, stagger, childSelector]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
