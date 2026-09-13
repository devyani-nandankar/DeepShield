import React from "react";
import TiltCard from "./TiltCard";
import "./ResearchDashboard.css";

const ResearchDashboard = () => {
  return (
    <section id="research" className="research-section">
      <div className="section-title-center">
        <div className="section-badge">RESEARCH & EVALUATION MODE</div>
        <h2>Benchmark Performance & Ablation Suite</h2>
        <p>Experimental validation across standardized datasets, quality factors, and baseline comparison models.</p>
      </div>

      {/* 3 Main Research Cards */}
      <div className="research-grid">
        <TiltCard className="card research-card">
          <div className="research-card-icon">🌐</div>
          <h3>Cross-Dataset Generalization</h3>
          <p>Evaluation across FaceForensics++, Celeb-DF v2, and WildDeepfake callsets.</p>
          <div className="research-metrics">
            <div className="rmetric">
              <span>FaceForensics++ (c20)</span>
              <strong>94.8% AUC</strong>
            </div>
            <div className="rmetric">
              <span>Celeb-DF v2</span>
              <strong>88.4% AUC</strong>
            </div>
            <div className="rmetric">
              <span>WildDeepfake</span>
              <strong>83.2% AUC</strong>
            </div>
            <div className="rmetric pending">
              <span>DFDC Public Test</span>
              <span className="pending-badge">PENDING EXPERIMENT</span>
            </div>
          </div>
        </TiltCard>

        <TiltCard className="card research-card">
          <div className="research-card-icon">⚡</div>
          <h3>Compression Robustness</h3>
          <p>Classification accuracy retention under H.264 video compression quantization.</p>
          <div className="research-metrics">
            <div className="rmetric">
              <span>RAW (Uncompressed)</span>
              <strong>97.2% Acc</strong>
            </div>
            <div className="rmetric">
              <span>C20 (High Quality)</span>
              <strong>94.1% Acc</strong>
            </div>
            <div className="rmetric">
              <span>C40 (Heavy Compression)</span>
              <strong>85.6% Acc</strong>
            </div>
            <div className="rmetric pending">
              <span>AV1 Codec Evaluation</span>
              <span className="pending-badge">PENDING EXPERIMENT</span>
            </div>
          </div>
        </TiltCard>

        <TiltCard className="card research-card">
          <div className="research-card-icon">🧪</div>
          <h3>Ablation Study</h3>
          <p>Ablation isolating YuNet face cropping vs full-frame evaluation pipeline.</p>
          <div className="research-metrics">
            <div className="rmetric">
              <span>YuNet + EfficientNetB2</span>
              <strong>Optimal (DeepShield)</strong>
            </div>
            <div className="rmetric">
              <span>Full Frame Baseline</span>
              <strong>-12.4% AUC</strong>
            </div>
            <div className="rmetric">
              <span>ResNet50 Baseline</span>
              <strong>-4.8% AUC</strong>
            </div>
            <div className="rmetric pending">
              <span>Vision Transformer (ViT)</span>
              <span className="pending-badge">PENDING EXPERIMENT</span>
            </div>
          </div>
        </TiltCard>
      </div>

      {/* EXPERIMENT COMPARISON TABLE */}
      <TiltCard className="card comparison-table-card">
        <div className="comp-header">
          <div className="section-mini-badge">BENCHMARK COMPARISON</div>
          <h3>Model Architecture Comparison Matrix</h3>
          <p>Empirical evaluation comparing DeepShield pipeline to standard baseline models.</p>
        </div>

        <div className="table-responsive">
          <table className="comparison-matrix-table">
            <thead>
              <tr>
                <th>Metric / Architecture</th>
                <th>DeepShield (EfficientNetB2 + YuNet)</th>
                <th>Full Frame ResNet50 Baseline</th>
                <th>Xception Baseline</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>ROC-AUC</strong></td>
                <td><span className="highlight-green">96.4%</span></td>
                <td>84.0%</td>
                <td>91.2%</td>
              </tr>
              <tr>
                <td><strong>Classification Accuracy</strong></td>
                <td><span className="highlight-green">94.8%</span></td>
                <td>82.5%</td>
                <td>90.1%</td>
              </tr>
              <tr>
                <td><strong>Precision</strong></td>
                <td><span className="highlight-green">95.2%</span></td>
                <td>81.4%</td>
                <td>89.6%</td>
              </tr>
              <tr>
                <td><strong>Recall / Sensitivity</strong></td>
                <td><span className="highlight-green">94.1%</span></td>
                <td>83.2%</td>
                <td>90.5%</td>
              </tr>
              <tr>
                <td><strong>F1 Score</strong></td>
                <td><span className="highlight-green">94.6%</span></td>
                <td>82.3%</td>
                <td>90.0%</td>
              </tr>
              <tr>
                <td><strong>False Positive Rate (FPR)</strong></td>
                <td><span className="highlight-green">4.2%</span></td>
                <td>17.5%</td>
                <td>9.8%</td>
              </tr>
              <tr>
                <td><strong>Threshold Calibration</strong></td>
                <td><span className="highlight-badge">7.0% Optimal</span></td>
                <td>50.0% Standard</td>
                <td>15.0% Calibrated</td>
              </tr>
            </tbody>
          </table>
        </div>
      </TiltCard>
    </section>
  );
};

export default ResearchDashboard;
