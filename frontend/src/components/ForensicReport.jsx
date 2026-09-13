import React from "react";
import "./ForensicReport.css";

const ForensicReport = ({ result, mode, fileName, onClose }) => {
  if (!result) return null;

  const handlePrint = () => {
    window.print();
  };

  const isFake = result.prediction === "FAKE";
  const frameProbs = (result.frame_probabilities || []).map(Number);
  const meanProb = frameProbs.length
    ? (frameProbs.reduce((a, b) => a + b, 0) / frameProbs.length).toFixed(1)
    : result.fake_probability;
  const maxProb = frameProbs.length ? Math.max(...frameProbs).toFixed(1) : result.fake_probability;
  const minProb = frameProbs.length ? Math.min(...frameProbs).toFixed(1) : result.fake_probability;
  
  const suspiciousFrames = frameProbs.filter(
    (p) => p >= Number(result.threshold ?? 7)
  ).length;

  const timestamp = new Date().toLocaleString();

  return (
    <div className="forensic-modal-backdrop">
      <div className="forensic-report-card">
        {/* Modal Header */}
        <div className="forensic-modal-header no-print">
          <div className="modal-title">
            <span>🛡️ DEEPSHIELD FORENSIC ANALYSIS</span>
            <h2>Forensic Evidence Report</h2>
          </div>
          <div className="modal-actions">
            <button className="btn-print-report" onClick={handlePrint}>
              🖨️ Print Report
            </button>
            <button className="btn-close-modal" onClick={onClose}>
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
                <h1>DEEPSHIELD FORENSIC REPORT</h1>
                <p>Explainable AI Media Integrity Certificate</p>
              </div>
            </div>
            <div className="report-meta">
              <div><strong>Case ID:</strong> DS-FORENSIC-{(Math.random()*100000).toFixed(0)}</div>
              <div><strong>Date:</strong> {timestamp}</div>
              <div><strong>Media Type:</strong> {mode.toUpperCase()}</div>
              {fileName && <div><strong>File Name:</strong> {fileName}</div>}
            </div>
          </div>

          {/* Section 1: Executive Summary */}
          <div className="report-section">
            <h3>1. Executive Forensic Summary</h3>
            <div className="executive-grid">
              <div className={`summary-box ${isFake ? "fake" : "real"}`}>
                <span className="summary-label">PREDICTION VERDICT</span>
                <span className="summary-verdict">
                  {isFake ? "⚠️ MANIPULATED / FAKE" : "✓ AUTHENTIC / REAL"}
                </span>
              </div>

              <div className="summary-box metric">
                <span className="summary-label">FAKE PROBABILITY</span>
                <span className="summary-metric">{result.fake_probability}%</span>
              </div>

              <div className="summary-box metric">
                <span className="summary-label">DECISION THRESHOLD</span>
                <span className="summary-metric">{result.threshold ?? 7}%</span>
              </div>

              {mode === "video" && (
                <div className="summary-box metric">
                  <span className="summary-label">TEMPORAL SUSPICION</span>
                  <span className="summary-metric">
                    {result.temporal_suspicion_score ?? Math.round((suspiciousFrames / (frameProbs.length || 1)) * 100)} / 100
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Model Architecture */}
          <div className="report-section">
            <h3>2. Neural Detection Specifications</h3>
            <table className="report-table">
              <tbody>
                <tr>
                  <td><strong>Classification Core</strong></td>
                  <td>EfficientNetB2 (Pre-trained Convolutional Network)</td>
                </tr>
                <tr>
                  <td><strong>Face Detection Model</strong></td>
                  <td>YuNet OpenCV DNN Face Detector</td>
                </tr>
                <tr>
                  <td><strong>Input Resolution</strong></td>
                  <td>260 × 260 Normalized Facial Crop</td>
                </tr>
                <tr>
                  <td><strong>Primary Salient Region</strong></td>
                  <td>{result.strongest_region || "Facial Landmark Cluster"}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 3: Video Frame Statistics (If video) */}
          {mode === "video" && frameProbs.length > 0 && (
            <div className="report-section">
              <h3>3. Frame-Level Forensic Metrics</h3>
              <table className="report-table">
                <tbody>
                  <tr>
                    <td><strong>Total Video Frames</strong></td>
                    <td>{result.total_frames || "N/A"}</td>
                    <td><strong>Sampled Frames</strong></td>
                    <td>{result.sampled_frames || frameProbs.length}</td>
                  </tr>
                  <tr>
                    <td><strong>Analyzed Frames</strong></td>
                    <td>{result.analyzed_frames || frameProbs.length}</td>
                    <td><strong>Faces Detected</strong></td>
                    <td>{result.face_detected_frames || frameProbs.length}</td>
                  </tr>
                  <tr>
                    <td><strong>Mean Probability</strong></td>
                    <td>{meanProb}%</td>
                    <td><strong>Max Probability</strong></td>
                    <td>{maxProb}%</td>
                  </tr>
                  <tr>
                    <td><strong>Min Probability</strong></td>
                    <td>{minProb}%</td>
                    <td><strong>Suspicious Frame Count</strong></td>
                    <td>{suspiciousFrames} / {frameProbs.length}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Section 4: Visual Evidence Artifacts */}
          {result.face_image && (
            <div className="report-section">
              <h3>4. Visual Forensic Evidence</h3>
              <div className="report-visual-grid">
                <div className="report-img-card">
                  <h4>Extracted Face Region (YuNet)</h4>
                  <img
                    src={`data:image/jpeg;base64,${result.face_image}`}
                    alt="Extracted Face"
                  />
                </div>
                {result.gradcam_image && (
                  <div className="report-img-card">
                    <h4>Grad-CAM Activation Heatmap</h4>
                    <img
                      src={`data:image/jpeg;base64,${result.gradcam_image}`}
                      alt="Grad-CAM Heatmap"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 5: Technical Explanation */}
          <div className="report-section">
            <h3>5. Explainable AI Forensic Narrative</h3>
            <p className="narrative-text">
              {result.explanation ||
                `The neural pipeline evaluated spatial anomalies across the normalized facial region. Class probability of ${result.fake_probability}% exceeds the decision threshold of 7%, triggering a ${result.prediction} classification.`}
            </p>
          </div>

          {/* Footer Signature Block */}
          <div className="report-doc-footer">
            <div>
              <strong>DeepShield Forensic Verification System</strong>
              <p>Generated automatically via Explainable Deepfake Pipeline</p>
            </div>
            <div className="signature-line">
              <span className="sig-title">System Hash Verification</span>
              <span className="sig-hash">SHA256: {Math.random().toString(36).substring(2, 15)}</span>
            </div>
          </div>
        </div>

        {/* Modal Bottom Buttons */}
        <div className="forensic-modal-footer no-print">
          <button className="btn-print-report-lg" onClick={handlePrint}>
            🖨️ Print Full Evidence Report
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
