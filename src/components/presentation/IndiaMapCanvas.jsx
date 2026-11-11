"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

// Accurate geographic coordinate nodes for India's administrative and regional welfare hubs
export const INDIA_HUBS = [
  { id: "delhi", name: "National Capital (New Delhi)", x: 380, y: 310, schemes: "Central & Pan-India Welfare", count: "637 Programs", active: true },
  { id: "punjab", name: "Punjab State", x: 330, y: 240, schemes: "20 Verified State Programs", count: "20 Schemes", active: true },
  { id: "haryana", name: "Haryana State", x: 360, y: 280, schemes: "15 Verified State Programs", count: "15 Schemes", active: true },
  { id: "rajasthan", name: "Rajasthan", x: 270, y: 360, schemes: "Desert Welfare & Agriculture", count: "Active", active: false },
  { id: "up", name: "Uttar Pradesh", x: 470, y: 340, schemes: "Rural Livelihoods & DBT", count: "Active", active: false },
  { id: "bihar", name: "Bihar", x: 620, y: 360, schemes: "Education & Social Security", count: "Active", active: false },
  { id: "wb", name: "West Bengal", x: 690, y: 420, schemes: "Artisans & Fishermen", count: "Active", active: false },
  { id: "assam", name: "North-East (Assam)", x: 800, y: 330, schemes: "Hill Tribe & Agro-Forestry", count: "Active", active: false },
  { id: "gujarat", name: "Gujarat", x: 210, y: 450, schemes: "Micro-Enterprises & Solar", count: "Active", active: false },
  { id: "maharashtra", name: "Maharashtra", x: 330, y: 560, schemes: "Industrial & Farmer Relief", count: "Active", active: false },
  { id: "telangana", name: "Telangana", x: 430, y: 590, schemes: "Rythu Bandhu & Welfare", count: "Active", active: false },
  { id: "karnataka", name: "Karnataka", x: 340, y: 700, schemes: "Technology & Rural Support", count: "Active", active: false },
  { id: "tamilnadu", name: "Tamil Nadu", x: 410, y: 790, schemes: "Women & Social Welfare", count: "Active", active: false },
  { id: "kerala", name: "Kerala", x: 360, y: 810, schemes: "Healthcare & Senior Citizens", count: "Active", active: false },
  { id: "jk", name: "Jammu & Kashmir", x: 320, y: 150, schemes: "Crafts & Winter Relief", count: "Active", active: false },
];

// Telemetry connection corridors linking states to the national welfare grid
const TELEMETRY_ROUTES = [
  ["delhi", "punjab"],
  ["delhi", "haryana"],
  ["punjab", "haryana"],
  ["delhi", "rajasthan"],
  ["delhi", "up"],
  ["up", "bihar"],
  ["bihar", "wb"],
  ["wb", "assam"],
  ["rajasthan", "gujarat"],
  ["gujarat", "maharashtra"],
  ["maharashtra", "telangana"],
  ["maharashtra", "karnataka"],
  ["telangana", "karnataka"],
  ["karnataka", "tamilnadu"],
  ["karnataka", "kerala"],
  ["delhi", "jk"],
  ["jk", "punjab"],
];

export default function IndiaMapCanvas({
  activeHubId = null,
  onSelectHub = null,
  interactive = true,
  className = "",
  showAllConnections = true,
}) {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;

    // ViewBox mapping (0,0 to 1000, 950)
    const baseWidth = 1000;
    const baseHeight = 950;

    // Floating background golden particles
    const particles = Array.from({ length: 45 }, () => ({
      x: Math.random() * baseWidth,
      y: Math.random() * baseHeight,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      size: Math.random() * 1.8 + 0.6,
      alpha: Math.random() * 0.6 + 0.2,
      pulse: Math.random() * Math.PI * 2,
    }));

    // Data energy packets travelling across telemetry lines
    const pulses = TELEMETRY_ROUTES.map(([fromId, toId]) => ({
      from: INDIA_HUBS.find((h) => h.id === fromId),
      to: INDIA_HUBS.find((h) => h.id === toId),
      t: Math.random(),
      speed: Math.random() * 0.005 + 0.003,
      size: Math.random() * 2.2 + 1.2,
    })).filter((p) => p.from && p.to);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });

    let time = 0;

    const render = () => {
      time += 0.02;
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // Scale factors to fit 1000x950 viewBox into current width/height
      const scale = Math.min(width / baseWidth, height / baseHeight) * 0.95;
      const offsetX = (width - baseWidth * scale) / 2;
      const offsetY = (height - baseHeight * scale) / 2;

      ctx.translate(offsetX, offsetY);
      ctx.scale(scale, scale);

      // 1. Draw India Geographical Silhouettes & Ambient Golden Glow
      const centerGrad = ctx.createRadialGradient(420, 480, 50, 420, 480, 460);
      centerGrad.addColorStop(0, "rgba(245, 166, 35, 0.09)");
      centerGrad.addColorStop(0.5, "rgba(255, 198, 107, 0.04)");
      centerGrad.addColorStop(1, "rgba(5, 5, 5, 0)");
      ctx.fillStyle = centerGrad;
      ctx.beginPath();
      ctx.arc(420, 480, 480, 0, Math.PI * 2);
      ctx.fill();

      // 2. Draw Floating Atmospheric Golden Particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.03;
        if (p.x < 0) p.x = baseWidth;
        if (p.x > baseWidth) p.x = 0;
        if (p.y < 0) p.y = baseHeight;
        if (p.y > baseHeight) p.y = 0;

        const currentAlpha = p.alpha * (0.6 + 0.4 * Math.sin(p.pulse));
        ctx.fillStyle = `rgba(255, 198, 107, ${currentAlpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Draw Telemetry Corridors
      if (showAllConnections) {
        TELEMETRY_ROUTES.forEach(([fromId, toId]) => {
          const from = INDIA_HUBS.find((h) => h.id === fromId);
          const to = INDIA_HUBS.find((h) => h.id === toId);
          if (!from || !to) return;

          const isHighlighted =
            activeHubId && (from.id === activeHubId || to.id === activeHubId);

          ctx.beginPath();
          ctx.moveTo(from.x, from.y);
          ctx.lineTo(to.x, to.y);
          ctx.strokeStyle = isHighlighted
            ? "rgba(245, 166, 35, 0.7)"
            : "rgba(245, 166, 35, 0.16)";
          ctx.lineWidth = isHighlighted ? 1.8 : 0.9;
          ctx.setLineDash([4, 6]);
          ctx.lineDashOffset = -time * 12;
          ctx.stroke();
          ctx.setLineDash([]);
        });

        // 4. Draw Flowing Light Packets
        pulses.forEach((packet) => {
          packet.t += packet.speed;
          if (packet.t > 1) packet.t = 0;

          const px = packet.from.x + (packet.to.x - packet.from.x) * packet.t;
          const py = packet.from.y + (packet.to.y - packet.from.y) * packet.t;

          ctx.beginPath();
          ctx.arc(px, py, packet.size, 0, Math.PI * 2);
          ctx.fillStyle = "#FFC66B";
          ctx.shadowColor = "#F5A623";
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;
        });
      }

      // 5. Draw Regional Welfare Nodes
      INDIA_HUBS.forEach((hub) => {
        const isSelected = hub.id === activeHubId;
        const isPunjabHaryana = hub.id === "punjab" || hub.id === "haryana" || hub.id === "delhi";

        // Outer pulse circle
        const pulseRadius = isSelected
          ? 18 + Math.sin(time * 3) * 4
          : isPunjabHaryana
          ? 12 + Math.sin(time * 2 + hub.x) * 3
          : 8;

        ctx.beginPath();
        ctx.arc(hub.x, hub.y, pulseRadius, 0, Math.PI * 2);
        ctx.fillStyle = isSelected
          ? "rgba(245, 166, 35, 0.25)"
          : isPunjabHaryana
          ? "rgba(245, 166, 35, 0.15)"
          : "rgba(255, 255, 255, 0.05)";
        ctx.fill();

        // Node center
        ctx.beginPath();
        ctx.arc(hub.x, hub.y, isSelected ? 5.5 : isPunjabHaryana ? 4.5 : 3, 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? "#FFFFFF" : isPunjabHaryana ? "#FFC66B" : "#B8B8B8";
        ctx.shadowColor = isPunjabHaryana ? "#F5A623" : "transparent";
        ctx.shadowBlur = isSelected ? 12 : 6;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Node Label
        ctx.font = isSelected
          ? "600 13px Inter, sans-serif"
          : isPunjabHaryana
          ? "500 11px Inter, sans-serif"
          : "400 10px Inter, sans-serif";
        ctx.fillStyle = isSelected ? "#FFFFFF" : isPunjabHaryana ? "#E5E5E5" : "#737373";
        ctx.fillText(hub.name.split(" ")[0], hub.x + 10, hub.y + 4);
      });

      ctx.restore();
      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [activeHubId, showAllConnections]);

  const handleCanvasClick = (e) => {
    if (!interactive || !canvasRef.current || !onSelectHub) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const baseWidth = 1000;
    const baseHeight = 950;
    const scale = Math.min(rect.width / baseWidth, rect.height / baseHeight) * 0.95;
    const offsetX = (rect.width - baseWidth * scale) / 2;
    const offsetY = (rect.height - baseHeight * scale) / 2;

    const mappedX = (clickX - offsetX) / scale;
    const mappedY = (clickY - offsetY) / scale;

    // Find nearest hub within 35px threshold
    let nearest = null;
    let minDist = 45;
    INDIA_HUBS.forEach((hub) => {
      const dist = Math.hypot(hub.x - mappedX, hub.y - mappedY);
      if (dist < minDist) {
        minDist = dist;
        nearest = hub;
      }
    });

    if (nearest) {
      onSelectHub(nearest);
    }
  };

  return (
    <div className={`relative w-full h-full min-h-[380px] sm:min-h-[500px] flex items-center justify-center ${className}`}>
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className={`w-full h-full max-w-[950px] max-h-[850px] ${interactive ? "cursor-pointer" : ""}`}
        aria-label="Interactive Geographical India Welfare Network"
      />
    </div>
  );
}

