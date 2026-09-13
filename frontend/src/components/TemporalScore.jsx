import React, { useEffect, useState } from "react";
import AnimatedNumber from "./AnimatedNumber";
import "./TemporalScore.css";

const TemporalScore = ({
  score = 0,
  suspiciousCount = 0,
  totalFrames = 0,
}) => {
  const [currentScore, setCurrentScore] = useState(0);

  useEffect(() => {
    // Animate score state
    let start = 0;
    const duration = 1200;
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const val = Math.round(start + (score - start) * progress);
      setCurrentScore(val);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [score]);

  // SVG Circumference calculation
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (currentScore / 100) * circumference;

  const isHighSuspicion = score >= 50;

  return (
    <div className="temporal-score-card">
      <div className="temporal-score-header">
        <div className="section-mini-badge">TEMPORAL FORENSICS</div>
        <h3>Temporal Suspicion Score</h3>
        <p>Aggregate temporal anomaly metric derived across analyzed frames.</p>
      </div>

      <div className="temporal-score-body">
        {/* Ring SVG */}
        <div className="ring-container">
          <svg className="score-ring-svg" viewBox="0 0 120 120">
            <circle
              className="ring-bg"
              cx="60"
              cy="60"
              r={radius}
            />
            <circle
              className={`ring-fill ${isHighSuspicion ? "high" : "low"}`}
              cx="60"
              cy="60"
              r={radius}
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: strokeDashoffset,
              }}
            />
          </svg>
          <div className="ring-text-center">
            <span className="score-val">{currentScore}</span>
            <span className="score-max">/ 100</span>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="temporal-stats-list">
          <div className="tstat-item">
            <span className="tstat-label">Temporal Score</span>
            <strong className="tstat-value">{currentScore} / 100</strong>
          </div>

          <div className="tstat-item">
            <span className="tstat-label">Suspicious Frames</span>
            <strong className="tstat-value highlight">
              {suspiciousCount} / {totalFrames}
            </strong>
          </div>

          <div className="tstat-item">
            <span className="tstat-label">Anomaly Level</span>
            <span className={`tstat-badge ${isHighSuspicion ? "high" : "normal"}`}>
              {isHighSuspicion ? "⚠️ Elevated Anomaly" : "✓ Low Anomaly"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemporalScore;
