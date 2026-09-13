import React, { useState, useEffect } from "react";
import "./ScanOverlay.css";

const STEPS = [
  "AI ANALYSIS IN PROGRESS",
  "Detecting Face...",
  "Extracting Facial Features...",
  "Analyzing Deepfake Patterns...",
  "Generating Explainability...",
  "Analysis Complete",
];

const ScanOverlay = ({ mode = "image" }) => {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => {
        if (prev < STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, 700);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="scan-overlay-container">
      {/* Corner Bracket Reticles */}
      <div className="reticle top-left"></div>
      <div className="reticle top-right"></div>
      <div className="reticle bottom-left"></div>
      <div className="reticle bottom-right"></div>

      {/* Grid Overlay */}
      <div className="scan-grid-pattern"></div>

      {/* Laser Scanning Line */}
      <div className="scan-line">
        <div className="scan-line-glow"></div>
      </div>

      {/* Floating Scanning Pulse Box */}
      <div className="scan-focus-box">
        <div className="focus-crosshair"></div>
      </div>

      {/* Animated Text Box */}
      <div className="scan-status-badge">
        <span className="scan-pulse-dot"></span>
        <span className="scan-status-text">{STEPS[stepIndex]}</span>
      </div>

      <div className="scan-subtext">
        Processing {mode === "image" ? "single image frame" : "video keyframes"} via EfficientNetB2 & YuNet
      </div>
    </div>
  );
};

export default ScanOverlay;
