import React, { useState } from "react";
import TiltCard from "./TiltCard";
import "./TemporalInvestigation.css";

const TemporalInvestigation = ({ frameProbabilities = [], threshold = 7, faceImage, gradcamImage }) => {
  const [selectedFrameIndex, setSelectedFrameIndex] = useState(0);

  if (!frameProbabilities || frameProbabilities.length === 0) return null;

  const probs = frameProbabilities.map(p => Number(p) || 0);
  const rawThreshold = Number(threshold);
  const numThreshold = !isNaN(rawThreshold)
    ? (rawThreshold <= 1 ? Number((rawThreshold * 100).toFixed(2)) : rawThreshold)
    : 7;
  const currentProb = probs[selectedFrameIndex] || 0;
  const isSelectedSuspicious = currentProb >= numThreshold;

  return (
    <TiltCard className="card temporal-investigation-card">
      <div className="investigation-header">
        <div>
          <div className="section-mini-badge">TEMPORAL FORENSIC WORKSPACE</div>
          <h3>Temporal Investigation Mode</h3>
          <p>Click any video frame to inspect frame-level neural attention and probability evidence.</p>
        </div>
      </div>

      {/* TEMPORAL ACTIVITY MAP (Heatmap strip) */}
      <div className="temporal-activity-map-container">
        <div className="activity-map-title">
          <span>TEMPORAL ACTIVITY MAP</span>
          <div className="map-legend-scale">
            <span>LOW (0%)</span>
            <div className="gradient-scale-bar"></div>
            <span>HIGH (100%)</span>
          </div>
        </div>

        {/* Heatmap Blocks */}
        <div className="heatmap-blocks-strip">
          {probs.map((prob, idx) => {
            const isSusp = prob >= numThreshold;
            const opacityVal = Math.max(prob / 100, 0.15);
            return (
              <div
                key={idx}
                className={`heatmap-block ${idx === selectedFrameIndex ? "active" : ""}`}
                style={{
                  backgroundColor: isSusp
                    ? `rgba(239, 68, 68, ${opacityVal})`
                    : `rgba(56, 189, 248, ${opacityVal})`,
                }}
                onClick={() => setSelectedFrameIndex(idx)}
                title={`Frame ${idx + 1}: ${prob.toFixed(1)}%`}
              >
                <span className="block-frame-num">{idx + 1}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* SELECTED FRAME INSPECTOR PANEL */}
      <div className="selected-frame-inspector">
        <div className="inspector-meta-box">
          <div className="meta-left">
            <span className="meta-frame-tag">FRAME {selectedFrameIndex + 1} INSPECTOR</span>
            <div className="meta-prob-row">
              <span className="prob-value">{currentProb.toFixed(1)}%</span>
              <span className="prob-label">Fake Probability</span>
            </div>
          </div>

          <div className="meta-right">
            <span className={`status-badge-lg ${isSelectedSuspicious ? "suspicious" : "normal"}`}>
              {isSelectedSuspicious ? "⚠️ SUSPICIOUS FRAME" : "✓ NORMAL FRAME"}
            </span>
            <span className="thresh-ref">Decision Threshold: {numThreshold}%</span>
          </div>
        </div>

        {/* Frame Artifact Visuals */}
        <div className="inspector-visuals">
          <div className="inspector-img-box">
            <span>Extracted Face Region (Frame {selectedFrameIndex + 1})</span>
            {faceImage ? (
              <img src={`data:image/jpeg;base64,${faceImage}`} alt="Frame Face" />
            ) : (
              <div className="img-placeholder">Face Crop Available</div>
            )}
          </div>

          <div className="inspector-img-box">
            <span>Grad-CAM Attention Heatmap (Frame {selectedFrameIndex + 1})</span>
            {gradcamImage ? (
              <img src={`data:image/jpeg;base64,${gradcamImage}`} alt="Frame Grad-CAM" />
            ) : (
              <div className="img-placeholder">Grad-CAM Heatmap Available</div>
            )}
          </div>
        </div>
      </div>
    </TiltCard>
  );
};

export default TemporalInvestigation;
