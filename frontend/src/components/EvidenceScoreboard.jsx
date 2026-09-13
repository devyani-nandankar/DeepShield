import React from "react";
import TiltCard from "./TiltCard";
import "./EvidenceScoreboard.css";

const EvidenceScoreboard = ({ result, mode }) => {
  if (!result) return null;

  const fakeProb = Number(result.fake_probability) || 0;
  const rawThreshold = Number(result.threshold);
  const threshold = !isNaN(rawThreshold)
    ? (rawThreshold <= 1 ? Number((rawThreshold * 100).toFixed(2)) : rawThreshold)
    : 7;
  const isFake = result.prediction === "FAKE";
  const frameProbs = (result.frame_probabilities || []).map(Number);
  const suspiciousCount = result.suspicious_frame_count ?? frameProbs.filter((p) => p >= threshold).length;

  const faceEvidenceAvailable = Boolean(result.face_image);
  const temporalEvidenceAvailable = mode === "video" && frameProbs.length > 0;
  const modelEvidenceAvailable = result.prediction !== undefined;
  const explainabilityAvailable = Boolean(result.gradcam_image);
  const mediaQualityAvailable = true;

  return (
    <TiltCard className="card evidence-scoreboard-card">
      <div className="scoreboard-header">
        <div>
          <div className="section-mini-badge">FORENSIC AUDIT MATRIX</div>
          <h3>EVIDENCE SCOREBOARD</h3>
          <p>Multi-channel forensic evidence evaluation based on actual backend neural extractions.</p>
        </div>

        <div className="evidence-badge-indicator">
          <span>Overall Verdict:</span>
          <strong className={isFake ? "fake-text" : "real-text"}>
            {isFake ? "⚠️ MANIPULATED / FAKE" : "✓ AUTHENTIC / REAL"}
          </strong>
        </div>
      </div>

      {/* 5 Distinct Evidence Cards */}
      <div className="scoreboard-grid">
        {/* Card 1: Face Evidence */}
        <div className="score-indicator-item">
          <div className="indicator-icon">👤</div>
          <div className="indicator-details">
            <span className="indicator-title">FACE EVIDENCE</span>
            <span className="indicator-sub">
              {faceEvidenceAvailable ? "YuNet Face Localization" : "Facial Alignment"}
            </span>
          </div>
          <strong className={`indicator-badge ${faceEvidenceAvailable ? "strong" : "normal"}`}>
            {faceEvidenceAvailable ? "Available" : "Not Available"}
          </strong>
        </div>

        {/* Card 2: Temporal Evidence */}
        <div className="score-indicator-item">
          <div className="indicator-icon">🎬</div>
          <div className="indicator-details">
            <span className="indicator-title">TEMPORAL EVIDENCE</span>
            <span className="indicator-sub">
              {temporalEvidenceAvailable
                ? `${suspiciousCount} of ${frameProbs.length} suspicious frames`
                : "Multi-Frame Video Metrics"}
            </span>
          </div>
          <strong className={`indicator-badge ${temporalEvidenceAvailable ? (suspiciousCount > 0 ? "fake" : "strong") : "normal"}`}>
            {temporalEvidenceAvailable ? "Available" : "Not Available"}
          </strong>
        </div>

        {/* Card 3: Model Evidence */}
        <div className="score-indicator-item">
          <div className="indicator-icon">🧠</div>
          <div className="indicator-details">
            <span className="indicator-title">MODEL EVIDENCE</span>
            <span className="indicator-sub">
              EfficientNetB2 ({fakeProb}%, Threshold: {threshold}%)
            </span>
          </div>
          <strong className={`indicator-badge ${modelEvidenceAvailable ? (isFake ? "fake" : "strong") : "normal"}`}>
            {modelEvidenceAvailable ? "Available" : "Not Available"}
          </strong>
        </div>

        {/* Card 4: Explainability */}
        <div className="score-indicator-item">
          <div className="indicator-icon">🔥</div>
          <div className="indicator-details">
            <span className="indicator-title">EXPLAINABILITY</span>
            <span className="indicator-sub">
              {result.strongest_region ? `Salience: ${result.strongest_region}` : "Grad-CAM Activation Heatmap"}
            </span>
          </div>
          <strong className={`indicator-badge ${explainabilityAvailable ? "info" : "normal"}`}>
            {explainabilityAvailable ? "Available" : "Not Available"}
          </strong>
        </div>

        {/* Card 5: Media Quality */}
        <div className="score-indicator-item">
          <div className="indicator-icon">📐</div>
          <div className="indicator-details">
            <span className="indicator-title">MEDIA QUALITY</span>
            <span className="indicator-sub">
              260 × 260 Normalized Tensor Input
            </span>
          </div>
          <strong className="indicator-badge strong">
            {mediaQualityAvailable ? "Available" : "Not Available"}
          </strong>
        </div>
      </div>

      {/* Quality Gate Reference */}
      <div className="quality-check-section">
        <h4>MEDIA QUALITY SUMMARY</h4>
        <div className="quality-check-grid">
          <div className="qcheck-item">
            <span>Face Region Bounding</span>
            <strong className="qval good">{faceEvidenceAvailable ? "Verified (YuNet)" : "Not Detected"}</strong>
          </div>
          <div className="qcheck-item">
            <span>Normalized Spatial Resolution</span>
            <strong className="qval good">260 × 260 RGB</strong>
          </div>
          <div className="qcheck-item">
            <span>Explainability Target Layer</span>
            <strong className="qval good">top_activation</strong>
          </div>
        </div>
      </div>
    </TiltCard>
  );
};

export default EvidenceScoreboard;
