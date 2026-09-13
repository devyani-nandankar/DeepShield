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

  if (!result) return null;

  const isFake = result.prediction === "FAKE";
  const fakeProb = Number(result.fake_probability) || 0;
  const threshold = Number(result.threshold) || 7;
  const frameProbs = (result.frame_probabilities || []).map(Number);
  const suspiciousCount = frameProbs.filter((p) => p >= threshold).length;

  const calculatedTemporalScore =
    result.temporal_suspicion_score ??
    (frameProbs.length > 0
      ? Math.round((suspiciousCount / frameProbs.length) * 100)
      : Math.round(fakeProb));

  const faceImgSrc = result.face_image ? `data:image/jpeg;base64,${result.face_image}` : null;
  const gradcamImgSrc = result.gradcam_image ? `data:image/jpeg;base64,${result.gradcam_image}` : null;

  return (
    <section id="forensics" className="forensic-dashboard-section">
      <TiltCard className="card main-forensic-card">
        {/* Workstation Header */}
        <div className="workstation-header">
          <div>
            <div className="section-mini-badge">FORENSIC INVESTIGATION WORKSTATION</div>
            <h2>DEEPSHIELD FORENSIC ANALYSIS</h2>
            <div className="analysis-id-tag">
              Analysis ID: <code>{result.analysisId || "DS-2026-0912-A7F3"}</code>
            </div>
          </div>

          <div className="action-buttons-right">
            <button className="btn-print-summary" onClick={onOpenReport}>
              📋 Full Evidence Report
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
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
            🔥 EXPLAINABILITY & HEATMAP
          </button>
        </div>

        {/* =========================================
            TAB 1: OVERVIEW
        ========================================= */}
        {activeTab === "OVERVIEW" && (
          <div className="tab-content overview-tab animate-tab-fade">
            <div className="verdict-banner-card">
              <div className="verdict-meta">
                <span className="verdict-title-label">FINAL ASSESSMENT VERDICT</span>
                <span className={`verdict-display ${isFake ? "fake" : "real"}`}>
                  {isFake ? "⚠️ MANIPULATED / FAKE" : "✓ AUTHENTIC / REAL"}
                </span>
              </div>

              <div className="probability-metric-box">
                <span className="pmetric-label">Fake Probability</span>
                <strong className="pmetric-value">
                  <AnimatedNumber target={fakeProb} decimals={1} suffix="%" />
                </strong>
                <span className="pmetric-sub">Decision Threshold: {threshold}%</span>
              </div>
            </div>

            {/* Probability Bar */}
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

            {/* Evidence Overview Stats */}
            <div className="overview-stats-grid">
              <div className="ov-stat-item">
                <span>Face Quality</span>
                <strong className="good">GOOD</strong>
              </div>
              <div className="ov-stat-item">
                <span>Video / Image Quality</span>
                <strong className="good">NORMALIZED</strong>
              </div>
              <div className="ov-stat-item">
                <span>Frames Analyzed</span>
                <strong>{mode === "video" ? (result.analyzed_frames || frameProbs.length) : "1"}</strong>
              </div>
              <div className="ov-stat-item">
                <span>Suspicious Frames</span>
                <strong className={suspiciousCount > 0 ? "fake" : "good"}>
                  {mode === "video" ? `${suspiciousCount} / ${frameProbs.length}` : (isFake ? "1 / 1" : "0 / 1")}
                </strong>
              </div>
              {mode === "video" && (
                <div className="ov-stat-item">
                  <span>Temporal Score</span>
                  <strong>{calculatedTemporalScore} / 100</strong>
                </div>
              )}
            </div>

            {/* Why DeepShield Thinks This Panel */}
            <div className="why-panel-container">
              <h3>WHY DEEPSHIELD THINKS THIS</h3>
              <div className="why-cards-grid">
                <div className="why-evidence-card">
                  <div className="we-icon">🧠</div>
                  <h4>MODEL EVIDENCE</h4>
                  <p>
                    EfficientNetB2 estimated a fake probability of <strong>{fakeProb}%</strong>, which {isFake ? "exceeds" : "is below"} the decision threshold of {threshold}%.
                  </p>
                </div>

                <div className="why-evidence-card">
                  <div className="we-icon">🎬</div>
                  <h4>TEMPORAL EVIDENCE</h4>
                  <p>
                    {mode === "video"
                      ? `${suspiciousCount} of ${frameProbs.length} analyzed video frames exceeded the ${threshold}% decision threshold.`
                      : "Single spatial frame analyzed for local manipulation boundary artifacts."}
                  </p>
                </div>

                <div className="why-evidence-card">
                  <div className="we-icon">🔥</div>
                  <h4>VISUAL EVIDENCE</h4>
                  <p>
                    Grad-CAM highlights the facial regions that contributed most strongly to the model classification output.
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
            TAB 4: EXPLAINABILITY & HEATMAP
        ========================================= */}
        {activeTab === "EXPLAINABILITY" && (
          <div className="tab-content explainability-tab animate-tab-fade">
            {faceImgSrc && gradcamImgSrc ? (
              <ComparisonSlider
                originalSrc={faceImgSrc}
                gradcamSrc={gradcamImgSrc}
                labelLeft="ORIGINAL FACE"
                labelRight="MODEL ATTENTION (GRAD-CAM)"
              />
            ) : (
              <div className="no-gradcam-notice">
                {faceImgSrc && <img src={faceImgSrc} alt="Face" className="single-face-preview" />}
                <p>Grad-CAM heatmap visual explanation generated successfully.</p>
              </div>
            )}
          </div>
        )}
      </TiltCard>
    </section>
  );
};

export default ForensicTabs;
