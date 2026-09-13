import React from "react";
import TiltCard from "./TiltCard";
import "./HowItWorks.css";

const STEPS = [
  {
    num: "01",
    title: "Upload Media",
    badge: "Image & Video",
    icon: "📤",
    description: "Upload an image or video for forensic neural analysis.",
    snippet: "Formats: JPG, PNG, MP4, MOV",
  },
  {
    num: "02",
    title: "Detect & Crop Face",
    badge: "YuNet Detector",
    icon: "👤",
    description: "YuNet locates the face region and crops the alignment area at 260 × 260 resolution.",
    snippet: "Media → YuNet Detection → Face Crop",
  },
  {
    num: "03",
    title: "Analyze with AI",
    badge: "EfficientNetB2",
    icon: "🧠",
    description: "EfficientNetB2 analyzes deep learning facial features to estimate REAL vs. FAKE probability.",
    snippet: "260 × 260 Input → Real / Fake Score",
  },
  {
    num: "04",
    title: "Explain the Decision",
    badge: "Grad-CAM",
    icon: "🔥",
    description: "Grad-CAM visualizes neural gradient heatmaps highlighting manipulated facial regions.",
    snippet: "Gradient Attention → Visual Heatmap",
  },
  {
    num: "05",
    title: "Analyze Video Frames",
    badge: "Temporal Analysis",
    icon: "🎬",
    description: "For videos, frame-by-frame temporal consistency is evaluated across the sequence.",
    snippet: "Multi-Frame Sampling → Suspicion Timeline",
  },
  {
    num: "06",
    title: "Generate Forensic Result",
    badge: "Forensic Audit",
    icon: "🛡️",
    description: "Combines spatial, temporal, and explainability evidence into a final forensic report.",
    snippet: "Probability + Grad-CAM + PDF Report",
  },
];

const HowItWorks = () => {
  const scrollToDetection = (e) => {
    e.preventDefault();
    const elem = document.getElementById("detection");
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="how-it-works" className="how-it-works-section">
      <div className="section-heading text-center">
        <div className="section-badge">FORENSIC PIPELINE</div>
        <h2>HOW IT WORKS</h2>
        <p className="subtitle">
          From uploaded media to explainable deepfake detection.
        </p>
      </div>

      {/* SIMPLE 3-COLUMN WORKFLOW GRID */}
      <div className="workflow-grid-simple">
        {STEPS.map((step) => (
          <TiltCard key={step.num} className="workflow-card-simple">
            <div className="card-top-row">
              <div className="step-badge-num">
                <span>STEP {step.num}</span>
              </div>
              <span className="step-tech-tag">{step.badge}</span>
            </div>

            <div className="card-main-title">
              <span className="card-icon">{step.icon}</span>
              <h3>{step.title}</h3>
            </div>

            <p className="card-desc">{step.description}</p>

            <div className="card-footer-snippet">
              <span className="snippet-dot"></span>
              <span className="snippet-text">{step.snippet}</span>
            </div>
          </TiltCard>
        ))}
      </div>

      {/* FOOTER STATEMENT & CALL TO ACTION */}
      <div className="how-it-works-footer-simple">
        <p>
          "DeepShield combines face-centric detection, explainable AI, and temporal analysis to provide a transparent digital media forensic workflow."
        </p>

        <a href="#detection" onClick={scrollToDetection} className="btn-start-analysis">
          Start Forensic Analysis →
        </a>
      </div>
    </section>
  );
};

export default HowItWorks;
