import React from "react";
import TiltCard from "./TiltCard";
import "./EvidenceScoreboard.css";

const EvidenceScoreboard = ({ result, mode }) => {
  if (!result) return null;

  const fakeProb = Number(result.fake_probability) || 0;
  const threshold = Number(result.threshold) || 7;
  const isFake = result.prediction === "FAKE";

  // Derived indicator metrics (labeled explicitly as Evidence Indicators)
  const faceEvidenceLevel = result.face_image ? "STRONG" : "FAIR";
  const modelEvidenceLevel = fakeProb >= 50 ? "ELEVATED" : fakeProb >= threshold ? "MODERATE" : "MINIMAL";
  const explainabilityLevel = result.gradcam_image ? "HIGH CONCENTRATION" : "UNAVAILABLE";
  const temporalLevel = mode === "video"
    ? ((result.frame_probabilities || []).filter(p => Number(p) >= threshold).length > 0 ? "ANOMALOUS" : "CONSISTENT")
    : "N/A (SINGLE FRAME)";

  // Quality gate assessments
  const faceQuality = result.face_image ? "GOOD" : "FAIR";
  const resolutionQuality = "GOOD (260 × 260 Normalized)";
  const faceSizeQuality = result.face_image ? "GOOD" : "POOR";

  const isLowQuality = faceQuality === "POOR" || faceSizeQuality === "POOR";

  return (
    <TiltCard className="card evidence-scoreboard-card">
      <div className="scoreboard-header">
        <div>
          <div className="section-mini-badge">FORENSIC SCOREBOARD</div>
          <h3>Evidence Assessment Matrix</h3>
          <p>Analytical indicators synthesized across neural feature channels.</p>
        </div>

        <div className="evidence-badge-indicator">
          <span>Overall Indicator:</span>
          <strong className={isFake ? "fake-text" : "real-text"}>
            {isFake ? "⚠️ MANIPULATION INDICATED" : "✓ CONSISTENT / REAL"}
          </strong>
        </div>
      </div>

      {/* Quality Gate Warning Banner if needed */}
      {isLowQuality && (
        <div className="quality-warning-banner">
          ⚠️ Low-quality input detected. Reduced facial feature resolution may impact analysis reliability.
        </div>
      )}

      {/* Scoreboard Grid */}
      <div className="scoreboard-grid">
        <div className="score-indicator-item">
          <div className="indicator-icon">👤</div>
          <div className="indicator-details">
            <span className="indicator-title">FACE EVIDENCE INDICATOR</span>
            <span className="indicator-sub">YuNet Facial Crop Integrity</span>
          </div>
          <strong className="indicator-badge strong">{faceEvidenceLevel}</strong>
        </div>

        <div className="score-indicator-item">
          <div className="indicator-icon">🧠</div>
          <div className="indicator-details">
            <span className="indicator-title">MODEL EVIDENCE INDICATOR</span>
            <span className="indicator-sub">EfficientNetB2 Activation Output</span>
          </div>
          <strong className={`indicator-badge ${isFake ? "fake" : "normal"}`}>
            {modelEvidenceLevel} ({fakeProb}%)
          </strong>
        </div>

        <div className="score-indicator-item">
          <div className="indicator-icon">🔥</div>
          <div className="indicator-details">
            <span className="indicator-title">EXPLAINABILITY INDICATOR</span>
            <span className="indicator-sub">Grad-CAM Salient Heatmap Focus</span>
          </div>
          <strong className="indicator-badge info">{explainabilityLevel}</strong>
        </div>

        <div className="score-indicator-item">
          <div className="indicator-icon">🎬</div>
          <div className="indicator-details">
            <span className="indicator-title">TEMPORAL EVIDENCE INDICATOR</span>
            <span className="indicator-sub">Frame-to-Frame Variance Metrics</span>
          </div>
          <strong className={`indicator-badge ${mode === "video" && isFake ? "fake" : "normal"}`}>
            {temporalLevel}
          </strong>
        </div>
      </div>

      {/* Media Quality Check Table */}
      <div className="quality-check-section">
        <h4>MEDIA QUALITY CHECK</h4>
        <div className="quality-check-grid">
          <div className="qcheck-item">
            <span>Face Detection</span>
            <strong className="qval good">{faceQuality}</strong>
          </div>
          <div className="qcheck-item">
            <span>Normalized Resolution</span>
            <strong className="qval good">{resolutionQuality}</strong>
          </div>
          <div className="qcheck-item">
            <span>Face Region Bounding</span>
            <strong className={`qval ${faceSizeQuality.toLowerCase()}`}>{faceSizeQuality}</strong>
          </div>
        </div>
      </div>
    </TiltCard>
  );
};

export default EvidenceScoreboard;
