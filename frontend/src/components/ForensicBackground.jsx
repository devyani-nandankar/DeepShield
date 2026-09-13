import React, { useState, useEffect } from "react";
import "./ForensicBackground.css";

const DATA_STREAMS = [
  "DS-AI // 010011",
  "FACE_LANDMARK_ALIGNED",
  "EFFICIENTNET_B2_INIT",
  "GRAD_CAM_ATTENTION",
  "TEMPORAL_SAMPLING",
  "FRAME_PROBABILITY",
  "DEEPSHIELD_CORE_v2",
];

const ForensicBackground = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      if (window.innerWidth < 768) return;

      const x = (e.clientX / window.innerWidth - 0.5) * 30;
      const y = (e.clientY / window.innerHeight - 0.5) * 30;
      setMousePos({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="forensic-background-stage" aria-hidden="true">
      {/* 1. Moving 3D Cyber Grid */}
      <div className="perspective-grid-container">
        <div className="moving-cyber-grid"></div>
      </div>

      {/* 2. Soft Radial AI Light Glows with Mouse Parallax */}
      <div
        className="radial-glow glow-primary"
        style={{ transform: `translate3d(${mousePos.x * 1.5}px, ${mousePos.y * 1.5}px, 0)` }}
      ></div>
      <div
        className="radial-glow glow-secondary"
        style={{ transform: `translate3d(${-mousePos.x}px, ${-mousePos.y}px, 0)` }}
      ></div>
      <div className="radial-glow glow-center"></div>

      {/* 3. Central 3D Holographic AI Forensic Core */}
      <div
        className="holographic-3d-stage"
        style={{
          transform: `rotateX(${-10 + mousePos.y * 0.2}deg) rotateY(${15 + mousePos.x * 0.2}deg)`,
        }}
      >
        <div className="core-3d-object">
          {/* Ring 1 - Outer 3D Gyrosphere */}
          <div className="holo-ring ring-outer-3d"></div>
          {/* Ring 2 - Reverse Orbiting Ring */}
          <div className="holo-ring ring-middle-3d"></div>
          {/* Ring 3 - Tilted Hexagonal Geometry */}
          <div className="holo-ring ring-inner-hex"></div>

          {/* Central Shield Wireframe Emblem */}
          <div className="holo-shield-core">
            <svg className="shield-svg" viewBox="0 0 100 100">
              <polygon
                points="50,10 90,25 90,65 50,95 10,65 10,25"
                fill="none"
                stroke="rgba(56, 189, 248, 0.35)"
                strokeWidth="1.5"
                strokeDasharray="4 2"
              />
              <polygon
                points="50,22 80,33 80,60 50,82 20,60 20,33"
                fill="rgba(56, 189, 248, 0.05)"
                stroke="rgba(56, 189, 248, 0.6)"
                strokeWidth="1"
              />
              <circle cx="50" cy="50" r="8" fill="rgba(56, 189, 248, 0.8)" />
            </svg>
          </div>

          {/* Periodic Expanding Scanning Pulse Rings */}
          <div className="scan-pulse-ring pulse-1"></div>
          <div className="scan-pulse-ring pulse-2"></div>
        </div>
      </div>

      {/* 4. Abstract Face Forensic Landmark Overlay */}
      <div className="abstract-face-forensics">
        <svg className="face-wireframe-svg" viewBox="0 0 200 240">
          {/* Face Contour Points & Lines */}
          <path
            d="M 50,40 Q 100,20 150,40 Q 170,120 150,190 Q 100,230 50,190 Q 30,120 50,40 Z"
            fill="none"
            stroke="rgba(56, 189, 248, 0.12)"
            strokeWidth="1"
            strokeDasharray="2 3"
          />
          {/* Eye Landmarks */}
          <circle cx="70" cy="90" r="10" stroke="rgba(56, 189, 248, 0.25)" fill="none" strokeWidth="1" />
          <circle cx="130" cy="90" r="10" stroke="rgba(56, 189, 248, 0.25)" fill="none" strokeWidth="1" />
          <circle cx="70" cy="90" r="2" fill="#38bdf8" />
          <circle cx="130" cy="90" r="2" fill="#38bdf8" />
          {/* Nose Bridge */}
          <line x1="100" y1="85" x2="100" y2="125" stroke="rgba(56, 189, 248, 0.2)" strokeWidth="1" />
          <polygon points="90,135 100,125 110,135" fill="none" stroke="rgba(56, 189, 248, 0.25)" strokeWidth="1" />
          {/* Mouth Alignment Grid */}
          <path d="M 75,160 Q 100,175 125,160" fill="none" stroke="rgba(56, 189, 248, 0.2)" strokeWidth="1" />
          {/* Facial Mesh Triangles */}
          <line x1="70" y1="90" x2="100" y2="125" stroke="rgba(56, 189, 248, 0.1)" strokeWidth="0.8" />
          <line x1="130" y1="90" x2="100" y2="125" stroke="rgba(56, 189, 248, 0.1)" strokeWidth="0.8" />
          <line x1="70" y1="90" x2="50" y2="40" stroke="rgba(56, 189, 248, 0.1)" strokeWidth="0.8" />
          <line x1="130" y1="90" x2="150" y2="40" stroke="rgba(56, 189, 248, 0.1)" strokeWidth="0.8" />
        </svg>
      </div>

      {/* 5. Dual Scanning Beams (Horizontal & Vertical) */}
      <div className="horizontal-scan-beam">
        <div className="h-beam-glow"></div>
      </div>
      <div className="vertical-scan-beam">
        <div className="v-beam-glow"></div>
      </div>

      {/* 6. Neural Network Nodes & Connection Vector Layer */}
      <div className="neural-network-layer">
        <div className="net-node node-a"><span className="node-pulse"></span></div>
        <div className="net-node node-b"><span className="node-pulse"></span></div>
        <div className="net-node node-c"><span className="node-pulse"></span></div>
        <div className="net-node node-d"></div>
        <div className="net-node node-e"></div>
        <div className="net-node node-f"></div>

        <svg className="net-connections-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
          <line x1="12" y1="25" x2="38" y2="48" stroke="rgba(56, 189, 248, 0.15)" strokeWidth="0.5" strokeDasharray="1 1" />
          <line x1="38" y1="48" x2="68" y2="28" stroke="rgba(56, 189, 248, 0.15)" strokeWidth="0.5" />
          <line x1="68" y1="28" x2="88" y2="72" stroke="rgba(56, 189, 248, 0.15)" strokeWidth="0.5" strokeDasharray="1 1" />
          <line x1="38" y1="48" x2="22" y2="82" stroke="rgba(56, 189, 248, 0.15)" strokeWidth="0.5" />
          <line x1="68" y1="28" x2="45" y2="80" stroke="rgba(56, 189, 248, 0.12)" strokeWidth="0.5" />
        </svg>
      </div>

      {/* 7. Multi-Layer Floating Particle Field (45 particles) */}
      <div className="multi-particle-field">
        {Array.from({ length: 42 }).map((_, i) => (
          <span
            key={i}
            className={`p-particle layer-${i % 3}`}
            style={{
              left: `${(i * 2.38 + 1) % 98}%`,
              width: `${(i % 3) + 1.5}px`,
              height: `${(i % 3) + 1.5}px`,
              animationDuration: `${10 + (i % 12) * 1.8}s`,
              animationDelay: `${(i % 9) * 1.2}s`,
            }}
          ></span>
        ))}
      </div>

      {/* 8. Decorative Vertical Data Streams */}
      <div className="data-streams-container">
        {DATA_STREAMS.map((str, idx) => (
          <div
            key={idx}
            className="data-stream-column"
            style={{
              left: `${8 + idx * 14}%`,
              animationDuration: `${16 + idx * 3}s`,
              animationDelay: `${idx * 2}s`,
            }}
          >
            <span>{str}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ForensicBackground;
