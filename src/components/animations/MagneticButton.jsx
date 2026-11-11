"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";

export default function MagneticButton({
  children,
  className = "",
  strength = 0.25,
  onClick,
  ...props
}) {
  const btnRef = useRef(null);

  useEffect(() => {
    const btn = btnRef.current;
    if (!btn || window.matchMedia("(prefers-reduced-motion: reduce)").matches || window.innerWidth < 768) {
      return;
    }

    const onMouseMove = (e) => {
      const rect = btn.getBoundingClientRect();
      const x = (e.clientX - (rect.left + rect.width / 2)) * strength;
      const y = (e.clientY - (rect.top + rect.height / 2)) * strength;

      gsap.to(btn, {
        x: x,
        y: y,
        duration: 0.3,
        ease: "power2.out",
      });
    };

    const onMouseLeave = () => {
      gsap.to(btn, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: "elastic.out(1, 0.4)",
      });
    };

    btn.addEventListener("mousemove", onMouseMove);
    btn.addEventListener("mouseleave", onMouseLeave);

    return () => {
      btn.removeEventListener("mousemove", onMouseMove);
      btn.removeEventListener("mouseleave", onMouseLeave);
      gsap.killTweensOf(btn);
    };
  }, [strength]);

  return (
    <div
      ref={btnRef}
      className={`inline-block ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}
