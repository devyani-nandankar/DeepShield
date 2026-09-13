import React, { useState, useEffect } from "react";
import "./MovingForensicBackground.css";

const DECORATIVE_TOKENS = [
  "AI_SCAN",
  "FRAME_001",
  "FACE_ALIGN",
  "TEMPORAL",
  "ANALYSIS",
  "010101",
  "101001",
  "DS_CORE",
  "REAL_PROB",
  "FAKE_PROP",
  "GRAD_CAM",
  "YUNET_CNN",
];

const MovingForensicBackground = () => {
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      if (window.innerWidth < 768) return;

      const x = (e.clientX / window.innerWidth - 0.5) * 35;
      const y = (e.clientY / window.innerHeight - 0.5) * 35;
      setCursorPos({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="moving-forensic-bg-root" aria-hidden="true">
      {/* LAYER 1: 3D Forward-Moving Cyber Grid */}
      <div className="perspective-grid-stage">
        <div className="moving-grid-plane"></div>
      </div>

      {/* LAYER 2: 6 Glowing Orbs (Moving & Scaling) */}
      <div className="orbs-layer">
        <div
          className="glowing-orb orb-1"
          style={{ transform: `translate3d(${cursorPos.x * 1.4}px, ${cursorPos.y * 1.4}px, 0)` }}
        ></div>
        <div
          className="glowing-orb orb-2"
          style={{ transform: `translate3d(${-cursorPos.x}px, ${-cursorPos.y}px, 0)` }}
        ></div>
        <div className="glowing-orb orb-3"></div>
        <div className="glowing-orb orb-4"></div>
        <div className="glowing-orb orb-5"></div>
        <div className="glowing-orb orb-6"></div>
      </div>

      {/* LAYER 3: Moving Light Waves (Horizontal Drift) */}
      <div className="light-waves-layer">
        <div className="light-wave wave-1"></div>
        <div className="light-wave wave-2"></div>
        <div className="light-wave wave-3"></div>
      </div>

      {/* LAYER 4: Rotating 3D Holographic Forensic Core & Shield */}
      <div
        className="holographic-3d-viewport"
        style={{
          transform: `rotateX(${-12 + cursorPos.y * 0.15}deg) rotateY(${18 + cursorPos.x * 0.15}deg)`,
        }}
      >
        <div className="holographic-3d-core">
          {/* 4 Rotating 3D Gyrosphere Rings */}
          <div className="holo-ring-3d r-xaxis"></div>
          <div className="holo-ring-3d r-yaxis"></div>
          <div className="holo-ring-3d r-zaxis"></div>
          <div className="holo-ring-3d r-ccw"></div>

          {/* Floating Abstract Forensic Shield Core */}
          <div className="floating-forensic-shield">
            <svg className="shield-3d-svg" viewBox="0 0 100 100">
              <polygon
                points="50,8 92,24 92,66 50,96 8,66 8,24"
                fill="rgba(56, 189, 248, 0.04)"
                stroke="rgba(56, 189, 248, 0.4)"
                strokeWidth="1.5"
                strokeDasharray="4 2"
              />
              <polygon
                points="50,20 82,32 82,60 50,83 18,60 18,32"
                fill="rgba(56, 189, 248, 0.08)"
                stroke="rgba(96, 165, 250, 0.6)"
                strokeWidth="1.2"
              />
              <circle cx="50" cy="50" r="7" fill="#38bdf8" />
            </svg>
          </div>

          {/* Continuous Circular Scanning Pulse */}
          <div className="continuous-scan-pulse pulse-ring-a"></div>
          <div className="continuous-scan-pulse pulse-ring-b"></div>
        </div>
      </div>

      {/* LAYER 5: Abstract Facial Forensic Wireframe Overlay */}
      <div className="abstract-face-layer">
        <svg className="face-mesh-svg" viewBox="0 0 200 240">
          <path
            d="M 50,35 Q 100,15 150,35 Q 175,120 150,195 Q 100,235 50,195 Q 25,120 50,35 Z"
            fill="none"
            stroke="rgba(56, 189, 248, 0.15)"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
          {/* Eyes */}
          <circle cx="70" cy="88" r="11" stroke="rgba(56, 189, 248, 0.3)" fill="none" strokeWidth="1" />
          <circle cx="130" cy="88" r="11" stroke="rgba(56, 189, 248, 0.3)" fill="none" strokeWidth="1" />
          <circle cx="70" cy="88" r="2.5" fill="#38bdf8" />
          <circle cx="130" cy="88" r="2.5" fill="#38bdf8" />
          {/* Nose & Mouth Mesh */}
          <line x1="100" y1="80" x2="100" y2="128" stroke="rgba(56, 189, 248, 0.25)" strokeWidth="1" />
          <polygon points="88,138 100,128 112,138" fill="none" stroke="rgba(56, 189, 248, 0.3)" strokeWidth="1" />
          <path d="M 72,165 Q 100,180 128,165" fill="none" stroke="rgba(56, 189, 248, 0.25)" strokeWidth="1" />
          {/* Triangulation Lines */}
          <line x1="70" y1="88" x2="100" y2="128" stroke="rgba(56, 189, 248, 0.12)" strokeWidth="0.8" />
          <line x1="130" y1="88" x2="100" y2="128" stroke="rgba(56, 189, 248, 0.12)" strokeWidth="0.8" />
          <line x1="70" y1="88" x2="50" y2="35" stroke="rgba(56, 189, 248, 0.12)" strokeWidth="0.8" />
          <line x1="130" y1="88" x2="150" y2="35" stroke="rgba(56, 189, 248, 0.12)" strokeWidth="0.8" />
        </svg>
      </div>

      {/* LAYER 6: Dual Continuous Scan Beams */}
      <div className="h-scan-beam">
        <div className="h-beam-glow-effect"></div>
      </div>
      <div className="v-scan-beam">
        <div className="v-beam-glow-effect"></div>
      </div>

      {/* LAYER 7: Moving Neural Network & Traveling Light Pulses */}
      <div className="moving-neural-network">
        <div className="neural-node node-1"><span className="node-glow-pulse"></span></div>
        <div className="neural-node node-2"><span className="node-glow-pulse"></span></div>
        <div className="neural-node node-3"><span className="node-glow-pulse"></span></div>
        <div className="neural-node node-4"></div>
        <div className="neural-node node-5"></div>
        <div className="neural-node node-6"></div>

        {/* Connections with Traveling Light Pulses */}
        <svg className="neural-lines-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
          <line x1="14" y1="22" x2="36" y2="46" stroke="rgba(56, 189, 248, 0.18)" strokeWidth="0.6" strokeDasharray="1 1" />
          <line x1="36" y1="46" x2="72" y2="26" stroke="rgba(56, 189, 248, 0.18)" strokeWidth="0.6" />
          <line x1="72" y1="26" x2="86" y2="74" stroke="rgba(56, 189, 248, 0.18)" strokeWidth="0.6" strokeDasharray="1 1" />
          <line x1="36" y1="46" x2="24" y2="84" stroke="rgba(56, 189, 248, 0.18)" strokeWidth="0.6" />
          <line x1="72" y1="26" x2="48" y2="82" stroke="rgba(56, 189, 248, 0.14)" strokeWidth="0.6" />
        </svg>
      </div>

      {/* LAYER 8: 52 Continuously Floating 3D Particles */}
      <div className="floating-particles-3d-field">
        {Array.from({ length: 50 }).map((_, i) => (
          <span
            key={i}
            className={`particle-dot depth-${i % 3}`}
            style={{
              left: `${(i * 2.05 + 1.2) % 98}%`,
              width: `${(i % 3) + 1.8}px`,
              height: `${(i % 3) + 1.8}px`,
              animationDuration: `${9 + (i % 11) * 1.6}s`,
              animationDelay: `${(i % 8) * 1.1}s`,
            }}
          ></span>
        ))}
      </div>

      {/* LAYER 9: Moving Decorative Data Streams */}
      <div className="moving-data-streams">
        {DECORATIVE_TOKENS.map((token, index) => (
          <div
            key={index}
            className="data-token-column"
            style={{
              left: `${6 + index * 8}%`,
              animationDuration: `${15 + index * 2.5}s`,
              animationDelay: `${index * 1.8}s`,
            }}
          >
            <span>{token}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MovingForensicBackground;
