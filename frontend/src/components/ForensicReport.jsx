import React from "react";
import "./ForensicReport.css";

const ForensicReport = ({ result, mode, fileName, onClose }) => {
  if (!result) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    window.print();
  };

  const isFake = result.prediction === "FAKE";
  const fakeProb = Number(result.fake_probability) || 0;
  const threshold = Number(result.threshold ?? 7);
  const frameProbs = (result.frame_probabilities || []).map(Number);
  
  const meanProb = result.mean_frame_probability ?? (
    frameProbs.length
      ? (frameProbs.reduce((a, b) => a + b, 0) / frameProbs.length).toFixed(2)
      : fakeProb
  );
  
  const medianProb = result.median_frame_probability ?? (
    frameProbs.length
      ? [...frameProbs].sort((a, b) => a - b)[Math.floor(frameProbs.length / 2)].toFixed(2)
      : fakeProb
  );
  
  const maxProb = result.max_frame_probability ?? (
    frameProbs.length ? Math.max(...frameProbs).toFixed(2) : fakeProb
  );

  const suspiciousCount = result.suspicious_frame_count ?? frameProbs.filter((p) => p >= threshold).length;
  const suspiciousPercentage = result.suspicious_frame_percentage ?? (
    frameProbs.length > 0 ? ((suspiciousCount / frameProbs.length) * 100).toFixed(2) : (isFake ? "100.00" : "0.00")
  );

  const temporalScore = result.temporal_suspicion_score ?? (
    frameProbs.length > 0
      ? Math.round((suspiciousCount / frameProbs.length) * 100)
      : Math.round(fakeProb)
  );

  const analysisId = result.analysisId || `DS-2026-${(Math.random() * 9000 + 1000).toFixed(0)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const timestamp = new Date().toLocaleString();

  return (
    <div className="forensic-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="report-title">
      <div className="forensic-report-card">
        {/* Modal Header Actions (Excluded when printing) */}
        <div className="forensic-modal-header no-print">
          <div className="modal-title">
            <span>🛡️ DEEPSHIELD FORENSIC WORKSTATION</span>
            <h2 id="report-title">Digital Media Forensic Analysis Report</h2>
          </div>
          <div className="modal-actions">
            <button className="btn-save-report" onClick={handleSave} title="Save report as PDF">
              💾 Save Report
            </button>
            <button className="btn-print-report" onClick={handlePrint} title="Print report">
              🖨️ Print Report
            </button>
            <button className="btn-close-modal" onClick={onClose} aria-label="Close report">
              ✕
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="printable-report-body">
          {/* Header Banner */}
          <div className="report-doc-header">
            <div className="report-brand">
              <div className="brand-logo-icon">🛡️</div>
              <div>
                <h1 className="report-main-title">DEEPSHIELD</h1>
                <h2 className="report-sub-title">DIGITAL MEDIA FORENSIC REPORT</h2>
                <p className="report-tagline">AI-Powered Explainable Media Integrity Audit</p>
              </div>
            </div>
            <div className="report-meta-grid">
              <div><strong>Analysis ID:</strong> <code>{analysisId}</code></div>
              <div><strong>Date & Time:</strong> {timestamp}</div>
              <div><strong>Media Type:</strong> {mode === "video" ? "VIDEO STREAM" : "IMAGE ARTIFACT"}</div>
              {fileName && <div><strong>Source File:</strong> {fileName}</div>}
            </div>
          </div>

          {/* Section 1: Executive Forensic Summary */}
          <div className="report-section">
            <h3 className="section-title">1. Executive Forensic Summary</h3>
            <div className="executive-grid">
              <div className={`summary-box ${isFake ? "fake" : "real"}`}>
                <span className="summary-label">PREDICTION</span>
                <span className="summary-verdict">
                  {isFake ? "⚠️ FAKE" : "✓ REAL"}
                </span>
              </div>

              <div className="summary-box metric">
                <span className="summary-label">FAKE PROBABILITY</span>
                <span className="summary-metric">{fakeProb}%</span>
              </div>

              <div className="summary-box metric">
                <span className="summary-label">DECISION THRESHOLD</span>
                <span className="summary-metric">{threshold}%</span>
              </div>

              {mode === "video" && (
                <div className="summary-box metric">
                  <span className="summary-label">TEMPORAL SUSPICION SCORE</span>
                  <span className="summary-metric">{temporalScore} / 100</span>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Evidence Summary Table */}
          <div className="report-section">
            <h3 className="section-title">2. Evidence Summary</h3>
            <table className="report-table">
              <tbody>
                <tr>
                  <td><strong>Detected Face</strong></td>
                  <td>{result.face_detected !== false && result.face_image ? "Yes (YuNet Aligned)" : "Detected"}</td>
                  <td><strong>Media Quality</strong></td>
                  <td>Normalized (260 × 260 RGB)</td>
                </tr>
                {mode === "video" && (
                  <>
                    <tr>
                      <td><strong>Total Video Frames</strong></td>
                      <td>{result.total_frames ?? "N/A"}</td>
                      <td><strong>Sampled Frames</strong></td>
                      <td>{result.sampled_frames ?? frameProbs.length}</td>
                    </tr>
                    <tr>
                      <td><strong>Suspicious Frames</strong></td>
                      <td>{suspiciousCount} / {frameProbs.length || 1}</td>
                      <td><strong>Suspicious Frame %</strong></td>
                      <td>{suspiciousPercentage}%</td>
                    </tr>
                    <tr>
                      <td><strong>Mean Probability</strong></td>
                      <td>{meanProb}%</td>
                      <td><strong>Median Probability</strong></td>
                      <td>{medianProb}%</td>
                    </tr>
                    <tr>
                      <td><strong>Maximum Probability</strong></td>
                      <td>{maxProb}%</td>
                      <td><strong>Temporal Standard Dev</strong></td>
                      <td>{result.temporal_std ?? "N/A"}%</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>

          {/* Section 3: Model & Detector Information */}
          <div className="report-section">
            <h3 className="section-title">3. Model Information & Configuration</h3>
            <table className="report-table">
              <tbody>
                <tr>
                  <td><strong>Classification Model</strong></td>
                  <td>EfficientNetB2 (Convolutional Feature Extractor)</td>
                </tr>
                <tr>
                  <td><strong>Face Detector</strong></td>
                  <td>YuNet OpenCV DNN Face Detector</td>
                </tr>
                <tr>
                  <td><strong>Explainability Method</strong></td>
                  <td>Grad-CAM (Gradient-weighted Class Activation Mapping)</td>
                </tr>
                <tr>
                  <td><strong>Target Layer</strong></td>
                  <td>top_activation</td>
                </tr>
                <tr>
                  <td><strong>Input Size</strong></td>
                  <td>260 × 260</td>
                </tr>
                <tr>
                  <td><strong>Class Mapping</strong></td>
                  <td>0 → REAL, 1 → FAKE</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 4: Visual Forensic Evidence */}
          {(result.face_image || result.gradcam_image) && (
            <div className="report-section">
              <h3 className="section-title">4. Visual Forensic Evidence Artifacts</h3>
              <div className="report-visual-grid">
                {result.face_image && (
                  <div className="report-img-card">
                    <h4>Detected Face Region (YuNet Crop)</h4>
                    <img
                      src={`data:image/jpeg;base64,${result.face_image}`}
                      alt="Detected Face Region"
                    />
                  </div>
                )}
                {result.gradcam_image && (
                  <div className="report-img-card">
                    <h4>Grad-CAM Activation Heatmap</h4>
                    <img
                      src={`data:image/jpeg;base64,${result.gradcam_image}`}
                      alt="Grad-CAM Activation Heatmap"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 5: Narrative Explanation */}
          <div className="report-section">
            <h3 className="section-title">5. Analytical Reasoning & Narrative</h3>
            <p className="narrative-text">
              {result.explanation ||
                `The facial crop was processed through EfficientNetB2 with Grad-CAM gradient explainability. The fake probability of ${fakeProb}% ${
                  isFake ? "exceeds" : "remains below"
                } the operational decision threshold of ${threshold}%, resulting in a classification of ${result.prediction}.`}
            </p>
          </div>

          {/* Section 6: Limitations & Disclaimer */}
          <div className="report-section limitations-section">
            <h3 className="section-title">6. Limitations & Methodological Scope</h3>
            <ul className="limitations-list">
              <li>
                <strong>Probabilistic Inference:</strong> This analysis represents an AI-based probabilistic assessment derived from learned facial features and gradient attention heatmaps.
              </li>
              <li>
                <strong>Compression & Quality Sensitivity:</strong> Heavy lossy compression, motion blur, partial facial occlusion, or extreme illumination conditions can affect detection accuracy.
              </li>
              <li>
                <strong>Non-Legal Certification:</strong> This document is an automated technical evaluation report designed to assist forensic researchers and investigators; it does not constitute an absolute legal guarantee.
              </li>
            </ul>
          </div>

          {/* Footer Signature & Hash */}
          <div className="report-doc-footer">
            <div>
              <strong>DeepShield AI Forensic Analysis Engine</strong>
              <p>Generated automatically via Face-Centric Explainable Pipeline</p>
            </div>
            <div className="signature-line">
              <span className="sig-title">Audit Reference ID</span>
              <span className="sig-hash">{analysisId}</span>
            </div>
          </div>
        </div>

        {/* Modal Bottom Buttons */}
        <div className="forensic-modal-footer no-print">
          <button className="btn-save-report-lg" onClick={handleSave}>
            💾 Save Report
          </button>
          <button className="btn-print-report-lg" onClick={handlePrint}>
            🖨️ Print Report
          </button>
          <button className="btn-close-lg" onClick={onClose}>
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForensicReport;
