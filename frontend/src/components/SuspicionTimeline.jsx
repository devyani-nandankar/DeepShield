import React, { useState } from "react";
import TiltCard from "./TiltCard";
import "./SuspicionTimeline.css";

const SuspicionTimeline = ({ frameProbabilities = [], threshold = 7 }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (!frameProbabilities || frameProbabilities.length === 0) return null;

  const probs = frameProbabilities.map((p) => Number(p) || 0);
  const maxProb = Math.max(...probs, 0);
  const numThreshold = Number(threshold) || 7;
  
  const suspiciousCount = probs.filter((p) => p >= numThreshold).length;
  const totalFrames = probs.length;

  return (
    <TiltCard className="card timeline-card-container">
      {/* Title Header */}
      <div className="timeline-header">
        <div className="section-mini-badge">VIDEO FORENSICS</div>
        <h3>TEMPORAL SUSPICION TIMELINE</h3>
        <p>
          Frame-level fake probability across the analyzed video. Frames above
          the decision threshold are marked suspicious.
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
              Decision Threshold: {numThreshold}%
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

              return (
                <div
                  key={index}
                  className={`frame-card-column ${isHovered ? "hovered" : ""}`}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
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
                        animationDelay: `${index * 55}ms`,
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
          <span className="sum-label">Threshold</span>
          <strong className="sum-value thresh-val">{numThreshold}%</strong>
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
      </div>
    </TiltCard>
  );
};

export default SuspicionTimeline;
