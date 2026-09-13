import React, { useState } from "react";
import TiltCard from "./TiltCard";
import "./SuspicionTimeline.css";

const SuspicionTimeline = ({
  frameProbabilities = [],
  threshold = 7,
  faceImage = null,
  gradcamImage = null,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!frameProbabilities || frameProbabilities.length === 0) return null;

  const probs = frameProbabilities.map((p) => Number(p) || 0);
  const maxProb = Math.max(...probs, 0);
  const numThreshold = Number(threshold) || 7;

  const suspiciousCount = probs.filter((p) => p >= numThreshold).length;
  const totalFrames = probs.length;

  const currentSelectedProb = probs[selectedIndex] ?? probs[0];
  const isSelectedSuspicious = currentSelectedProb >= numThreshold;

  return (
    <TiltCard className="card timeline-card-container">
      {/* Title Header */}
      <div className="timeline-header">
        <div className="section-mini-badge">VIDEO FORENSICS</div>
        <h3>TEMPORAL SUSPICION TIMELINE</h3>
        <p>
          Frame-level fake probability across the analyzed video. Click any frame bar to inspect its face crop, Grad-CAM attention, and forensic status.
        </p>
      </div>

      {/* Main Chart Area with Y-Axis */}
      <div className="timeline-chart-stage">
        {/* Y-Axis Labels */}
        <div className="timeline-y-axis">
          <span>100%</span>
          <span>75%</span>
          <span>50%</span>
          <span>25%</span>
          <span>0%</span>
        </div>

        {/* Horizontal Scrollable Chart Area */}
        <div className="timeline-chart-viewport">
          {/* Threshold Line */}
          <div
            className="timeline-threshold-line"
            style={{ bottom: `${Math.min(Math.max(numThreshold, 0), 100)}%` }}
          >
            <span className="threshold-label">
              Threshold: {numThreshold}%
            </span>
          </div>

          {/* Grid Lines */}
          <div className="timeline-grid-line gl-75" style={{ bottom: "75%" }}></div>
          <div className="timeline-grid-line gl-50" style={{ bottom: "50%" }}></div>
          <div className="timeline-grid-line gl-25" style={{ bottom: "25%" }}></div>

          {/* Frame Bar Columns */}
          <div className="timeline-bars-track">
            {probs.map((prob, index) => {
              const percentage = Math.min(Math.max(prob, 0), 100);
              const isSuspicious = percentage >= numThreshold;
              const isHovered = hoveredIndex === index;
              const isSelected = selectedIndex === index;

              return (
                <div
                  key={index}
                  className={`frame-card-column ${isHovered ? "hovered" : ""} ${
                    isSelected ? "selected-frame" : ""
                  }`}
                  onClick={() => setSelectedIndex(index)}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") setSelectedIndex(index);
                  }}
                  aria-label={`Frame ${index + 1}: ${percentage.toFixed(1)}% fake probability`}
                >
                  {/* Frame Header */}
                  <div className="frame-card-header">
                    <span className="frame-tag">F{index + 1}</span>
                  </div>

                  {/* Vertical Bar Track */}
                  <div className="frame-bar-track">
                    <div
                      className={`frame-bar-fill ${
                        isSuspicious ? "suspicious pulse-suspicious" : "normal"
                      }`}
                      style={{
                        height: `${Math.max(percentage, 4)}%`,
                        animationDelay: `${index * 40}ms`,
                      }}
                    >
                      {/* Suspicious Warning Icon inside Bar if tall enough */}
                      {isSuspicious && percentage > 35 && (
                        <span className="bar-suspicious-icon">⚠️</span>
                      )}
                    </div>
                  </div>

                  {/* Percentage Below Bar */}
                  <div className="frame-card-footer">
                    <span
                      className={`frame-prob-text ${
                        isSuspicious ? "text-suspicious" : ""
                      }`}
                    >
                      {percentage.toFixed(1)}%
                    </span>
                  </div>

                  {/* Hover Tooltip Card */}
                  {isHovered && (
                    <div className="timeline-hover-tooltip">
                      <div className="tooltip-row header">
                        <strong>Frame: F{index + 1}</strong>
                      </div>
                      <div className="tooltip-row">
                        <span>Fake Probability:</span>
                        <strong>{percentage.toFixed(1)}%</strong>
                      </div>
                      <div className="tooltip-row">
                        <span>Status:</span>
                        <span
                          className={`tooltip-status-badge ${
                            isSuspicious ? "suspicious" : "normal"
                          }`}
                        >
                          {isSuspicious ? "⚠️ Suspicious" : "✓ Normal"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="timeline-summary-cards">
        <div className="summary-stat-card">
          <span className="sum-label">Highest Frame</span>
          <strong className="sum-value high-val">{maxProb.toFixed(1)}%</strong>
        </div>

        <div className="summary-stat-card">
          <span className="sum-label">Suspicious Frames</span>
          <strong className="sum-value susp-val">
            {suspiciousCount} / {totalFrames}
          </strong>
        </div>

        <div className="summary-stat-card">
          <span className="sum-label">Decision Threshold</span>
          <strong className="sum-value thresh-val">{numThreshold}%</strong>
        </div>
      </div>

      {/* SELECTED FRAME INSPECTOR DETAIL PANEL */}
      <div className="timeline-selected-panel">
        <div className="selected-panel-header">
          <div className="panel-title-group">
            <span className="panel-badge">SELECTED FRAME INSPECTION</span>
            <h4>Frame F{selectedIndex + 1} Analysis</h4>
          </div>
          <div className="panel-metric-group">
            <div className="metric-cell">
              <span className="cell-label">Probability</span>
              <strong className="cell-value">{currentSelectedProb.toFixed(1)}%</strong>
            </div>
            <div className="metric-cell">
              <span className="cell-label">Status</span>
              <span className={`status-pill ${isSelectedSuspicious ? "suspicious" : "normal"}`}>
                {isSelectedSuspicious ? "⚠️ Suspicious" : "✓ Normal"}
              </span>
            </div>
          </div>
        </div>

        <div className="selected-visuals-row">
          <div className="selected-visual-box">
            <span className="visual-caption">Face Crop (Frame F{selectedIndex + 1})</span>
            {faceImage ? (
              <img
                src={faceImage.startsWith("data:") ? faceImage : `data:image/jpeg;base64,${faceImage}`}
                alt={`Face Crop Frame F${selectedIndex + 1}`}
                className="selected-crop-img"
              />
            ) : (
              <div className="placeholder-visual">Face crop unavailable</div>
            )}
          </div>

          <div className="selected-visual-box">
            <span className="visual-caption">Grad-CAM (Frame F{selectedIndex + 1})</span>
            {gradcamImage ? (
              <img
                src={gradcamImage.startsWith("data:") ? gradcamImage : `data:image/jpeg;base64,${gradcamImage}`}
                alt={`Grad-CAM Frame F${selectedIndex + 1}`}
                className="selected-crop-img"
              />
            ) : (
              <div className="placeholder-visual">Grad-CAM unavailable</div>
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="timeline-legend-row">
        <div className="legend-item">
          <span className="legend-swatch normal"></span>
          <span>Below Threshold (Normal)</span>
        </div>
        <div className="legend-item">
          <span className="legend-swatch suspicious"></span>
          <span>Above Threshold (Suspicious)</span>
        </div>
        <div className="legend-item">
          <span className="legend-swatch selected-legend"></span>
          <span>Currently Selected Frame</span>
        </div>
      </div>
    </TiltCard>
  );
};

export default SuspicionTimeline;
