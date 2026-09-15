import React, { useState } from "react";
import TiltCard from "./TiltCard";
import AnimatedNumber from "./AnimatedNumber";
import ComparisonSlider from "./ComparisonSlider";
import EvidenceScoreboard from "./EvidenceScoreboard";
import TemporalScore from "./TemporalScore";
import SuspicionTimeline from "./SuspicionTimeline";
import TemporalInvestigation from "./TemporalInvestigation";
import "./ForensicTabs.css";

const ForensicTabs = ({ result, mode, fileName, onOpenReport }) => {
  const [activeTab, setActiveTab] = useState("OVERVIEW");
  const [mediaViewerMode, setMediaViewerMode] = useState("slider"); // "slider", "original", "face", "gradcam"

  if (!result) return null;

  const isFake = result.prediction === "FAKE";
  const fakeProb = Number(result.fake_probability) || 0;
  const rawThreshold = Number(result.threshold);
  const threshold = !isNaN(rawThreshold)
    ? (rawThreshold <= 1 ? Number((rawThreshold * 100).toFixed(2)) : rawThreshold)
    : 7;
  const frameProbs = (result.frame_probabilities || []).map(Number);
  const suspiciousCount = result.suspicious_frame_count ?? frameProbs.filter((p) => p >= threshold).length;

  const calculatedTemporalScore =
    result.temporal_suspicion_score ??
    (frameProbs.length > 0
      ? Math.round((suspiciousCount / frameProbs.length) * 100)
      : Math.round(fakeProb));

  const faceImgSrc = result.face_image ? `data:image/jpeg;base64,${result.face_image}` : null;
  const gradcamImgSrc = result.gradcam_image ? `data:image/jpeg;base64,${result.gradcam_image}` : null;
  const analysisId = result.analysisId || `DS-2026-0912-A7F3`;
  const analysisDateTime = new Date().toLocaleString();

  return (
    <section id="forensics" className="forensic-dashboard-section">
      <TiltCard className="card main-forensic-card">
        {/* Workstation Header */}
        <div className="workstation-header">
          <div>
            <div className="section-mini-badge">FORENSIC INVESTIGATION WORKSTATION</div>
            <h2>FORENSIC ANALYSIS RESULT</h2>
            <div className="analysis-id-tag">
              Analysis ID: <code>{analysisId}</code> • {analysisDateTime}
            </div>
          </div>

          <div className="action-buttons-right">
            <button className="btn-print-summary" onClick={onOpenReport}>
              📋 Full Forensic Report
            </button>
          </div>
        </div>

        {/* Tab Navigation: Overview, Evidence, Temporal, Explainability, Report */}
        <div className="forensic-nav-tabs">
          <button
            className={`tab-btn ${activeTab === "OVERVIEW" ? "active" : ""}`}
            onClick={() => setActiveTab("OVERVIEW")}
          >
            📊 OVERVIEW
          </button>
          <button
            className={`tab-btn ${activeTab === "EVIDENCE" ? "active" : ""}`}
            onClick={() => setActiveTab("EVIDENCE")}
          >
            🛡️ EVIDENCE SCOREBOARD
          </button>
          {mode === "video" && (
            <button
              className={`tab-btn ${activeTab === "TEMPORAL" ? "active" : ""}`}
              onClick={() => setActiveTab("TEMPORAL")}
            >
              🎬 TEMPORAL FORENSICS
            </button>
          )}
          <button
            className={`tab-btn ${activeTab === "EXPLAINABILITY" ? "active" : ""}`}
            onClick={() => setActiveTab("EXPLAINABILITY")}
          >
            🔥 EXPLAINABILITY & VIEWER
          </button>
          <button
            className="tab-btn report-tab-btn"
            onClick={onOpenReport}
          >
            📑 REPORT
          </button>
        </div>

        {/* =========================================
            TAB 1: OVERVIEW (FEATURE 7 & 15)
        ========================================= */}
        {activeTab === "OVERVIEW" && (
          <div className="tab-content overview-tab animate-tab-fade">
            {/* Primary Result Card */}
            <div className="verdict-banner-card">
              <div className="verdict-meta">
                <span className="verdict-title-label">PREDICTION</span>
                <span className={`verdict-display ${isFake ? "fake" : "real"}`}>
                  {isFake ? "⚠️ FAKE" : "✓ REAL"}
                </span>
              </div>

              <div className="probability-metric-box">
                <span className="pmetric-label">Fake Probability</span>
                <strong className="pmetric-value">
                  <AnimatedNumber target={fakeProb} decimals={1} suffix="%" />
                </strong>
                <span className="pmetric-sub">Operational Threshold: {threshold}%</span>
              </div>
            </div>

            {/* Probability Progress Track */}
            <div className="overview-prob-bar-box">
              <div className="progress-background">
                <div
                  className="progress-bar animated-bar-fill"
                  style={{ width: `${Math.min(fakeProb, 100)}%` }}
                ></div>
                <div className="threshold-marker" style={{ left: `${threshold}%` }}>
                  <span className="threshold-pin">{threshold}%</span>
                </div>
              </div>
            </div>

            {/* Metadata Summary Grid */}
            <div className="overview-stats-grid">
              <div className="ov-stat-item">
                <span>Media Type</span>
                <strong className="uppercase-val">{mode === "video" ? "Video Stream" : "Digital Image"}</strong>
              </div>
              <div className="ov-stat-item">
                <span>Detected Face</span>
                <strong className="good">{result.face_detected !== false ? "YuNet Aligned" : "Not Detected"}</strong>
              </div>
              <div className="ov-stat-item">
                <span>Threshold</span>
                <strong>{threshold}%</strong>
              </div>
              <div className="ov-stat-item">
                <span>Frames Analyzed</span>
                <strong>{mode === "video" ? (result.analyzed_frames || frameProbs.length) : "1"}</strong>
              </div>
              {mode === "video" && (
                <div className="ov-stat-item">
                  <span>Temporal Suspicion Score</span>
                  <strong>{calculatedTemporalScore} / 100</strong>
                </div>
              )}
            </div>

            {/* WHY DEEPSHIELD THINKS THIS (FEATURE 15) */}
            <div className="why-panel-container">
              <h3>WHY DEEPSHIELD THINKS THIS</h3>
              <p className="why-subtitle">
                System reasoning derived strictly from extracted neural features and gradient activations:
              </p>
              <div className="why-cards-grid">
                <div className="why-evidence-card">
                  <div className="we-icon">👤</div>
                  <h4>FACE-BASED ANALYSIS</h4>
                  <p>
                    {result.face_detected !== false
                      ? "YuNet detected and extracted the facial region, which was normalized to 260 × 260 for model classification."
                      : "No clear facial boundary detected in the media input."}
                  </p>
                </div>

                <div className="why-evidence-card">
                  <div className="we-icon">🧠</div>
                  <h4>MODEL PREDICTION</h4>
                  <p>
                    EfficientNetB2 computed a Fake Probability of <strong>{fakeProb}%</strong>, which {isFake ? "exceeds" : "remains below"} the {threshold}% decision threshold.
                  </p>
                </div>

                <div className="why-evidence-card">
                  <div className="we-icon">🎬</div>
                  <h4>TEMPORAL EVIDENCE</h4>
                  <p>
                    {mode === "video"
                      ? `${suspiciousCount} of ${frameProbs.length} sampled video frames exceeded the threshold, yielding a Temporal Suspicion Score of ${calculatedTemporalScore} / 100.`
                      : "Spatial single-frame evaluation conducted on normalized facial crop."}
                  </p>
                </div>

                <div className="why-evidence-card">
                  <div className="we-icon">🔥</div>
                  <h4>EXPLAINABILITY</h4>
                  <p>
                    {result.strongest_region
                      ? `Grad-CAM indicates elevated neural activation focused on the ${result.strongest_region} region.`
                      : "Grad-CAM visual heatmap demonstrates spatial distribution of model attention."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================
            TAB 2: EVIDENCE SCOREBOARD
        ========================================= */}
        {activeTab === "EVIDENCE" && (
          <div className="tab-content evidence-tab animate-tab-fade">
            <EvidenceScoreboard result={result} mode={mode} />
          </div>
        )}

        {/* =========================================
            TAB 3: TEMPORAL FORENSICS
        ========================================= */}
        {activeTab === "TEMPORAL" && mode === "video" && (
          <div className="tab-content temporal-tab animate-tab-fade">
            <TemporalScore
              score={calculatedTemporalScore}
              suspiciousCount={suspiciousCount}
              totalFrames={frameProbs.length}
            />

            <SuspicionTimeline
              frameProbabilities={result.frame_probabilities}
              threshold={threshold}
              faceImage={result.face_image}
              gradcamImage={result.gradcam_image}
            />

            <TemporalInvestigation
              frameProbabilities={result.frame_probabilities}
              threshold={threshold}
              faceImage={result.face_image}
              gradcamImage={result.gradcam_image}
            />
          </div>
        )}

        {/* =========================================
            TAB 4: EXPLAINABILITY & VIEWER (FEATURES 13 & 14)
        ========================================= */}
        {activeTab === "EXPLAINABILITY" && (
          <div className="tab-content explainability-tab animate-tab-fade">
            <div className="media-viewer-subtabs">
              <button
                className={`mv-btn ${mediaViewerMode === "slider" ? "active" : ""}`}
                onClick={() => setMediaViewerMode("slider")}
              >
                ↔ Comparison Slider
              </button>
              <button
                className={`mv-btn ${mediaViewerMode === "face" ? "active" : ""}`}
                onClick={() => setMediaViewerMode("face")}
              >
                👤 Detected Face Crop
              </button>
              <button
                className={`mv-btn ${mediaViewerMode === "gradcam" ? "active" : ""}`}
                onClick={() => setMediaViewerMode("gradcam")}
              >
                🔥 Grad-CAM Heatmap
              </button>
            </div>

            {mediaViewerMode === "slider" && (
              faceImgSrc && gradcamImgSrc ? (
                <ComparisonSlider
                  originalSrc={faceImgSrc}
                  gradcamSrc={gradcamImgSrc}
                  labelLeft="ORIGINAL FACE CROP"
                  labelRight="GRAD-CAM ATTENTION HEATMAP"
                />
              ) : (
                <div className="no-gradcam-notice">
                  <p>Grad-CAM comparison slider requires both face crop and heatmap images.</p>
                </div>
              )
            )}

            {mediaViewerMode === "face" && (
              <div className="single-view-container">
                <h4>Detected Face Crop (YuNet)</h4>
                {faceImgSrc ? (
                  <img src={faceImgSrc} alt="Detected Face Crop" className="inspected-media-img" />
                ) : (
                  <div className="no-gradcam-notice">Face crop unavailable for this media.</div>
                )}
              </div>
            )}

            {mediaViewerMode === "gradcam" && (
              <div className="single-view-container">
                <h4>Grad-CAM Activation Heatmap</h4>
                {gradcamImgSrc ? (
                  <img src={gradcamImgSrc} alt="Grad-CAM Activation Heatmap" className="inspected-media-img" />
                ) : (
                  <div className="no-gradcam-notice">Grad-CAM unavailable for this analysis.</div>
                )}
              </div>
            )}
          </div>
        )}
      </TiltCard>
    </section>
  );
};

export default ForensicTabs;
