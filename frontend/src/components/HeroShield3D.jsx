import React, { useState, useRef } from "react";
import "./HeroShield3D.css";

const HeroShield3D = () => {
  const containerRef = useRef(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.innerWidth < 768) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    // Subtle max 12 deg tilt
    const rotateY = (mouseX / (rect.width / 2)) * 12;
    const rotateX = (-mouseY / (rect.height / 2)) * 12;

    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  return (
    <div
      ref={containerRef}
      className="hero-shield-wrapper"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background cyber radar grid */}
      <div className="shield-grid-bg">
        <div className="radar-sweep"></div>
        <div className="grid-rings">
          <div className="ring r1"></div>
          <div className="ring r2"></div>
          <div className="ring r3"></div>
        </div>
      </div>

      {/* Floating ambient particles around shield */}
      <div className="shield-particles">
        <span className="sp p1"></span>
        <span className="sp p2"></span>
        <span className="sp p3"></span>
        <span className="sp p4"></span>
        <span className="sp p5"></span>
        <span className="sp p6"></span>
      </div>

      {/* Main 3D Stage */}
      <div
        className="shield-3d-stage"
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
        }}
      >
        {/* Layer 1: Outer Rotating Tech Ring */}
        <div className="shield-layer layer-tech-ring">
          <div className="tech-ring-inner"></div>
        </div>

        {/* Layer 2: Hexagonal Outer Glow Shield */}
        <div className="shield-layer layer-outer-shield">
          <div className="shield-shape outer"></div>
        </div>

        {/* Layer 3: Main Metallic Blue Shield Plate */}
        <div className="shield-layer layer-main-shield">
          <div className="shield-shape main">
            <div className="shield-light-streak"></div>
          </div>
        </div>

        {/* Layer 4: Inner Core Emblem */}
        <div className="shield-layer layer-emblem">
          <div className="emblem-container">
            <div className="shield-icon-svg">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 2L4 5V11.09C4 16.14 7.41 20.85 12 22C16.59 20.85 20 16.14 20 11.09V5L12 2Z"
                  fill="url(#shield-grad)"
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 6L7 9V11.5C7 14.8 9.1 17.9 12 18.7C14.9 17.9 17 14.8 17 11.5V9L12 6Z"
                  fill="rgba(56, 189, 248, 0.15)"
                  stroke="#60a5fa"
                  strokeWidth="1"
                />
                <circle cx="12" cy="12" r="2.5" fill="#38bdf8" />
                <path
                  d="M12 9.5V7M12 17v-2.5M9.5 12H7M17 12h-2.5"
                  stroke="#a5f3fc"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="shield-grad" x1="4" y1="2" x2="20" y2="22" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#1e40af" />
                    <stop offset="0.5" stopColor="#2563eb" />
                    <stop offset="1" stopColor="#0284c7" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="emblem-glow"></div>
          </div>
        </div>

        {/* Layer 5: Front Floating Holographic Nodes */}
        <div className="shield-layer layer-holo-node">
          <div className="node-dot nd1"></div>
          <div className="node-dot nd2"></div>
          <div className="node-dot nd3"></div>
        </div>
      </div>
    </div>
  );
};

export default HeroShield3D;
