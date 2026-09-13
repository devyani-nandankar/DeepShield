import React, { useState, useEffect } from "react";
import TiltCard from "./TiltCard";
import "./AnalysisHistory.css";

const HISTORY_KEY = "deepshield_analysis_history";

export const saveAnalysisToHistory = (item) => {
  try {
    const existing = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    const newItem = {
      id: item.id || `DS-${new Date().getFullYear()}-${(Math.random() * 10000).toFixed(0)}`,
      date: new Date().toLocaleString(),
      mode: item.mode || "image",
      prediction: item.prediction || "UNKNOWN",
      fakeProbability: item.fake_probability ?? item.fakeProbability ?? 0,
      threshold: item.threshold !== undefined
        ? (Number(item.threshold) <= 1 ? Number((Number(item.threshold) * 100).toFixed(2)) : Number(item.threshold))
        : 7,
    };
    const updated = [newItem, ...existing].slice(0, 15);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error("LocalStorage save error", e);
    return [];
  }
};

const AnalysisHistory = ({ onSelectHistoryItem }) => {
  const [history, setHistory] = useState([]);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);

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
    setSelectedHistoryItem(null);
  };

  return (
    <section id="history" className="analysis-history-section">
      <TiltCard className="card history-card">
        <div className="history-header">
          <div>
            <div className="section-mini-badge">LOCAL SESSION LOGS</div>
            <h3>RECENT ANALYSES</h3>
            <p>Non-sensitive analysis metadata stored locally in browser session storage.</p>
          </div>

          {history.length > 0 && (
            <button className="btn-clear-history" onClick={handleClear}>
              🗑️ Clear History
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="empty-history-box">
            <span>No previous analyses.</span>
          </div>
        ) : (
          <div className="history-table-wrapper">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Analysis ID</th>
                  <th>Date / Time</th>
                  <th>Media Type</th>
                  <th>Prediction</th>
                  <th>Fake Probability</th>
                  <th>Actions</th>
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
                      <span className="type-badge">{(item.mode || "image").toUpperCase()}</span>
                    </td>
                    <td>
                      <strong className={item.prediction === "FAKE" ? "pred-fake" : "pred-real"}>
                        {item.prediction === "FAKE" ? "⚠️ FAKE" : "✓ REAL"}
                      </strong>
                    </td>
                    <td>{item.fakeProbability}%</td>
                    <td>
                      <button
                        className="btn-view-result"
                        onClick={() => setSelectedHistoryItem(item)}
                        title="View result metadata"
                      >
                        👁️ View Result
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Selected History Item Detail Modal */}
        {selectedHistoryItem && (
          <div className="history-detail-overlay">
            <div className="history-detail-card">
              <div className="history-detail-header">
                <h4>Analysis Details: {selectedHistoryItem.id}</h4>
                <button
                  className="btn-close-hist-detail"
                  onClick={() => setSelectedHistoryItem(null)}
                >
                  ✕
                </button>
              </div>
              <div className="history-detail-body">
                <div className="hdetail-row">
                  <span>Analysis ID:</span>
                  <code>{selectedHistoryItem.id}</code>
                </div>
                <div className="hdetail-row">
                  <span>Timestamp:</span>
                  <strong>{selectedHistoryItem.date}</strong>
                </div>
                <div className="hdetail-row">
                  <span>Media Type:</span>
                  <strong>{(selectedHistoryItem.mode || "image").toUpperCase()}</strong>
                </div>
                <div className="hdetail-row">
                  <span>Prediction Verdict:</span>
                  <strong className={selectedHistoryItem.prediction === "FAKE" ? "pred-fake" : "pred-real"}>
                    {selectedHistoryItem.prediction}
                  </strong>
                </div>
                <div className="hdetail-row">
                  <span>Fake Probability:</span>
                  <strong>{selectedHistoryItem.fakeProbability}%</strong>
                </div>
              </div>
              <div className="history-detail-footer">
                <button
                  className="btn-close-lg"
                  onClick={() => setSelectedHistoryItem(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="privacy-note-footer">
          🔒 <strong>Privacy Assurance:</strong> Original media images and videos are never retained in browser storage.
        </div>
      </TiltCard>
    </section>
  );
};

export default AnalysisHistory;
