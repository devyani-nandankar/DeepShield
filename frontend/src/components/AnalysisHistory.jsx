import React, { useState, useEffect } from "react";
import TiltCard from "./TiltCard";
import "./AnalysisHistory.css";

const HISTORY_KEY = "deepshield_analysis_history";

export const saveAnalysisToHistory = (item) => {
  try {
    const existing = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    const newItem = {
      id: item.id || `DS-${new Date().getFullYear()}-${(Math.random()*10000).toFixed(0)}`,
      date: new Date().toLocaleString(),
      mode: item.mode,
      prediction: item.prediction,
      fakeProbability: item.fake_probability,
      temporalScore: item.temporal_suspicion_score,
      fileName: item.fileName || "Uploaded File",
    };
    const updated = [newItem, ...existing].slice(0, 10); // keep last 10
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error("LocalStorage save error", e);
    return [];
  }
};

const AnalysisHistory = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    try {
      const items = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
      setHistory(items);
    } catch (e) {
      setHistory([]);
    }
  }, []);

  const handleClear = () => {
    localStorage.removeItem(HISTORY_KEY);
    setHistory([]);
  };

  return (
    <section className="analysis-history-section">
      <TiltCard className="card history-card">
        <div className="history-header">
          <div>
            <div className="section-mini-badge">LOCAL SESSION MANAGEMENT</div>
            <h3>Recent Forensic Analyses</h3>
            <p>Metadata history stored locally in your browser. No media files are stored.</p>
          </div>

          {history.length > 0 && (
            <button className="btn-clear-history" onClick={handleClear}>
              🗑️ Clear History
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="empty-history-box">
            <span>No previous session analyses recorded. Perform an image or video analysis above.</span>
          </div>
        ) : (
          <div className="history-table-wrapper">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Analysis ID</th>
                  <th>Date & Time</th>
                  <th>Type</th>
                  <th>File Name</th>
                  <th>Prediction</th>
                  <th>Probability</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <code className="history-id-code">{item.id}</code>
                    </td>
                    <td>{item.date}</td>
                    <td>
                      <span className="type-badge">{item.mode.toUpperCase()}</span>
                    </td>
                    <td>{item.fileName}</td>
                    <td>
                      <strong className={item.prediction === "FAKE" ? "pred-fake" : "pred-real"}>
                        {item.prediction === "FAKE" ? "⚠️ FAKE" : "✓ REAL"}
                      </strong>
                    </td>
                    <td>{item.fakeProbability}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="privacy-note-footer">
          🔒 <strong>Media Privacy Note:</strong> Uploaded media is processed strictly for inference. The browser does not permanently store original images or videos in history.
        </div>
      </TiltCard>
    </section>
  );
};

export default AnalysisHistory;
