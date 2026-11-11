"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function AnimatedText({
  text,
  className = "",
  tag: Tag = "h1",
  delay = 0,
  stagger = 0.035,
  triggerOnScroll = true,
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Respect reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(el.querySelectorAll(".word-inner"), { y: 0, opacity: 1 });
      return;
    }

    const words = el.querySelectorAll(".word-inner");
    gsap.set(words, { y: "115%", opacity: 0 });

    const animConfig = {
      y: "0%",
      opacity: 1,
      duration: 0.9,
      stagger: stagger,
      delay: delay,
      ease: "power3.out",
    };

    let st = null;
    if (triggerOnScroll) {
      st = ScrollTrigger.create({
        trigger: el,
        start: "top 88%",
        once: true,
        onEnter: () => {
          gsap.to(words, animConfig);
        },
      });
    } else {
      gsap.to(words, animConfig);
    }

    return () => {
      if (st) st.kill();
      gsap.killTweensOf(words);
    };
  }, [text, delay, stagger, triggerOnScroll]);

  const words = typeof text === "string" ? text.split(" ") : [];

  return (
    <Tag ref={containerRef} className={`${className} inline-block`} aria-label={text}>
      {words.map((word, i) => (
        <span
          key={i}
          className="inline-block overflow-hidden align-top mr-[0.25em] last:mr-0 pb-[0.08em]"
          aria-hidden="true"
        >
          <span className="word-inner inline-block will-change-transform">
            {word}
          </span>
        </span>
      ))}
    </Tag>
  );
}
