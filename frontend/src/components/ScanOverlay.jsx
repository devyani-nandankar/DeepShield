import React, { useState, useEffect } from "react";
import "./ScanOverlay.css";

const PROGRESS_STEPS = [
  { id: "detect", label: "DETECTING FACE", icon: "👤", sub: "YuNet Landmark Alignment" },
  { id: "extract", label: "EXTRACTING FEATURES", icon: "🧠", sub: "260 × 260 Normalization" },
  { id: "analyze", label: "ANALYZING MEDIA", icon: "⚡", sub: "EfficientNetB2 Inference" },
  { id: "evidence", label: "GENERATING EVIDENCE", icon: "🔥", sub: "Grad-CAM Heatmap Synthesis" },
];

const ScanOverlay = ({ mode = "image" }) => {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % PROGRESS_STEPS.length);
    }, 900);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="scan-overlay-container" aria-live="polite">
      {/* Corner Bracket Reticles */}
      <div className="reticle top-left"></div>
      <div className="reticle top-right"></div>
      <div className="reticle bottom-left"></div>
      <div className="reticle bottom-right"></div>

      {/* Grid Pattern Overlay */}
      <div className="scan-grid-pattern"></div>

      {/* Laser Scanning Line */}
      <div className="scan-line">
        <div className="scan-line-glow"></div>
      </div>

      {/* Rotating Forensic Scan Ring & Crosshair */}
      <div className="scan-ring-wrapper">
        <div className="scan-rotating-ring outer"></div>
        <div className="scan-rotating-ring inner"></div>
        <div className="scan-crosshair-center">
          <span className="ch-icon">🔬</span>
        </div>
      </div>

      {/* Scan Header Badge */}
      <div className="scan-main-header">
        <span className="scan-pulse-dot"></span>
        <strong className="scan-title-text">AI FORENSIC SCAN</strong>
      </div>

      {/* 4-Step Animated Pipeline Sequence */}
      <div className="scan-pipeline-sequence">
        {PROGRESS_STEPS.map((step, idx) => {
          const isCurrent = idx === activeStep;
          const isDone = idx < activeStep;
          return (
            <div
              key={step.id}
              className={`scan-step-item ${isCurrent ? "current" : isDone ? "done" : "pending"}`}
            >
              <div className="step-bullet">
                {isDone ? "✓" : step.icon}
              </div>
              <div className="step-info">
                <span className="step-name">{step.label}</span>
                <span className="step-desc">{step.sub}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="scan-footer-note">
        Processing {mode === "image" ? "single image" : "video frames"} via EfficientNetB2 & YuNet
      </div>
    </div>
  );
};

export default ScanOverlay;
