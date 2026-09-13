import React from "react";
import TiltCard from "./TiltCard";
import "./ModelInspector.css";

const ModelInspector = ({ threshold = 7 }) => {
  const rawThreshold = Number(threshold);
  const displayThreshold = !isNaN(rawThreshold)
    ? (rawThreshold <= 1 ? Number((rawThreshold * 100).toFixed(2)) : rawThreshold)
    : 7;

  return (
    <section id="model" className="model-inspector-section">
      <div className="section-title-center">
        <div className="section-badge">MODEL DIAGNOSTICS</div>
        <h2>AI Architecture & Pipeline Inspector</h2>
        <p>Technical specifications and configuration parameters of the DeepShield neural core.</p>
      </div>

      <div className="inspector-panel-grid">
        <TiltCard className="card model-spec-card">
          <div className="spec-header">
            <div className="spec-icon">🧠</div>
            <div>
              <h3>Neural Classifier Core</h3>
              <p>Convolutional Feature Extractor</p>
            </div>
          </div>
          <div className="spec-body">
            <div className="spec-row">
              <span>Architecture</span>
              <strong>EfficientNetB2</strong>
            </div>
            <div className="spec-row">
              <span>Input Resolution</span>
              <strong>260 × 260 × 3 RGB</strong>
            </div>
            <div className="spec-row">
              <span>Target Layer</span>
              <strong>top_activation</strong>
            </div>
            <div className="spec-row">
              <span>Class Mapping</span>
              <strong>0: REAL | 1: FAKE</strong>
            </div>
          </div>
        </TiltCard>

        <TiltCard className="card model-spec-card">
          <div className="spec-header">
            <div className="spec-icon">👤</div>
            <div>
              <h3>Facial Bounding & Crop</h3>
              <p>Face Localization Engine</p>
            </div>
          </div>
          <div className="spec-body">
            <div className="spec-row">
              <span>Face Detector</span>
              <strong>YuNet (OpenCV DNN)</strong>
            </div>
            <div className="spec-row">
              <span>Detection Confidence</span>
              <strong>0.60 Min Score</strong>
            </div>
            <div className="spec-row">
              <span>NMS Threshold</span>
              <strong>0.30 IoU</strong>
            </div>
            <div className="spec-row">
              <span>Landmarks Extracted</span>
              <strong>5 Point Landmarks</strong>
            </div>
          </div>
        </TiltCard>

        <TiltCard className="card model-spec-card">
          <div className="spec-header">
            <div className="spec-icon">🔥</div>
            <div>
              <h3>Explainable AI Engine</h3>
              <p>Salient Visual Heatmap</p>
            </div>
          </div>
          <div className="spec-body">
            <div className="spec-row">
              <span>Explainability Tech</span>
              <strong>Grad-CAM</strong>
            </div>
            <div className="spec-row">
              <span>Gradient Target</span>
              <strong>Predicted Class Logit</strong>
            </div>
            <div className="spec-row">
              <span>Heatmap Colormap</span>
              <strong>COLORMAP_JET (OpenCV)</strong>
            </div>
            <div className="spec-row">
              <span>Decision Threshold</span>
              <strong>{displayThreshold}%</strong>
            </div>
          </div>
        </TiltCard>
      </div>
    </section>
  );
};

export default ModelInspector;
