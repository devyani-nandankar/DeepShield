import React from "react";
import TiltCard from "./TiltCard";
import "./ResearchDashboard.css";

const RESEARCH_TOPICS = [
  {
    id: "video-eval",
    title: "Video-Level Evaluation",
    icon: "🎬",
    focus: "Multi-frame temporal aggregation & sequence consistency across video streams.",
    status: "Active Research",
    details: "Assessing frame sampling density vs classification latency on high-fps media.",
  },
  {
    id: "threshold-calib",
    title: "Threshold Calibration",
    icon: "⚖️",
    focus: "Decision boundary optimization for balancing false acceptance and false rejection.",
    status: "Baseline Configured",
    details: "Operational decision threshold calibrated on face-centric neural activations.",
  },
  {
    id: "ablation-study",
    title: "Ablation Study",
    icon: "🧪",
    focus: "Isolating YuNet face alignment, margin scaling, and input resolution (260 × 260).",
    status: "Framework Defined",
    details: "Comparative analysis between full-frame vs cropped facial region processing.",
  },
  {
    id: "explainability-analysis",
    title: "Explainability Analysis",
    icon: "🔥",
    focus: "Grad-CAM spatial localization fidelity on manipulated facial landmarks and boundaries.",
    status: "Active Research",
    details: "Qualitative evaluation of attention map focus on eyes, mouth, and boundary blend seams.",
  },
];

const ResearchDashboard = () => {
  return (
    <section id="research" className="research-section">
      <div className="section-title-center">
        <div className="section-badge">🔬 ACADEMIC & RESEARCH WORKSPACE</div>
        <h2>RESEARCH & EVALUATION</h2>
        <p className="research-subtitle">
          Experimental methodologies, evaluation frameworks, and planned investigation tracks for explainable deepfake forensics.
        </p>
      </div>

      {/* 6 Research & Evaluation Cards */}
      <div className="research-grid-six">
        {RESEARCH_TOPICS.map((topic) => (
          <TiltCard key={topic.id} className="card research-card-clean">
            <div className="research-card-top">
              <span className="research-card-icon">{topic.icon}</span>
              <span className={`research-status-pill ${topic.status.toLowerCase().replace(/\s+/g, "-")}`}>
                {topic.status}
              </span>
            </div>

            <h3>{topic.title}</h3>
            <p className="research-focus">{topic.focus}</p>

            <div className="research-card-footer">
              <span className="rfooter-label">Status Note:</span>
              <span className="rfooter-desc">{topic.details}</span>
            </div>
          </TiltCard>
        ))}
      </div>

      {/* RESEARCH TRANSPARENCY NOTICE */}
      <div className="research-transparency-card">
        <div className="transparency-icon">ℹ️</div>
        <div>
          <h4>Scientific Transparency & Integrity Notice</h4>
          <p>
            DeepShield adheres to strict scientific integrity standards. In accordance with forensic research guidelines, all benchmark claims require peer-verified validation runs. Research tracks display live framework objectives without fabricated test metrics.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ResearchDashboard;
