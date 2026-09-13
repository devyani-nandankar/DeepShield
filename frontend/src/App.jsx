import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import TiltCard from "./components/TiltCard";
import HeroShield3D from "./components/HeroShield3D";
import ScanOverlay from "./components/ScanOverlay";
import ForensicTabs from "./components/ForensicTabs";
import HowItWorks from "./components/HowItWorks";
import ModelInspector from "./components/ModelInspector";
import AnalysisHistory, { saveAnalysisToHistory } from "./components/AnalysisHistory";
import ForensicReport from "./components/ForensicReport";
import MovingForensicBackground from "./components/MovingForensicBackground";
import "./App.css";

function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("deepshield_theme") || "dark";
  });
  const [activeSection, setActiveSection] = useState("home");
  const [mode, setMode] = useState("image");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showReport, setShowReport] = useState(false);
  const [backendOnline, setBackendOnline] = useState(true);

  // Apply theme to document root on change
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("deepshield_theme", theme);
  }, [theme]);

  // Check backend availability on mount
  useEffect(() => {
    fetch("http://127.0.0.1:5000/predict", { method: "OPTIONS" })
      .then(() => setBackendOnline(true))
      .catch(() => setBackendOnline(false));
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];

    if (!selected) return;

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setResult(null);
    setError("");
  };

  const changeMode = (newMode) => {
    setMode(newMode);
    setFile(null);
    setPreview(null);
    setResult(null);
    setError("");
  };

  const analyzeFile = async () => {
    if (!file) {
      setError(
        `Please select ${mode === "image" ? "an image" : "a video"} first.`
      );
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    const formData = new FormData();

    if (mode === "image") {
      formData.append("image", file);
    } else {
      formData.append("video", file);
    }

    const endpoint =
      mode === "image"
        ? "http://127.0.0.1:5000/predict"
        : "http://127.0.0.1:5000/predict_video";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed.");
      }

      // Generate unique analysis ID
      const analysisId = `DS-${new Date().getFullYear()}-${(Math.random() * 10000).toFixed(0)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const enrichedResult = { ...data, analysisId };

      setResult(enrichedResult);

      // Save metadata to local browser history
      saveAnalysisToHistory({
        id: analysisId,
        mode,
        prediction: data.prediction,
        fake_probability: data.fake_probability,
        temporal_suspicion_score: data.temporal_suspicion_score,
        fileName: file.name,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetAnalysis = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError("");
    setShowReport(false);
  };

  return (
    <div className="app">
      {/* 24/7 Animated Background */}
      <MovingForensicBackground />

      {/* DASHBOARD LAYOUT: SIDEBAR + MAIN CONTENT */}
      <div className="dashboard-layout">
        {/* Sleek Vertical Sidebar */}
        <Sidebar activeSection={activeSection} onSelectSection={setActiveSection} />

        {/* Dashboard Main Viewport */}
        <div className="dashboard-main-content">
          {/* Top Navbar */}
          <nav className="top-navbar">
            <div className="brand-header-group">
              <div>
                <div className="nav-brand-title">DeepShield</div>
                <div className="nav-brand-subtitle">AI for Media Integrity</div>
              </div>
            </div>

            <div className="navbar-right-group">
              <div className="top-nav-links">
                <a href="#home">Home</a>
                <a href="#detection">Detection</a>
                <a href="#how-it-works">How It Works</a>
                <a href="#model">Model</a>
                <a href="#about">About</a>
              </div>

              <div className="nav-status">
                <span className={`status-dot ${backendOnline ? "online" : "offline"}`}></span>
                {backendOnline ? "System Online" : "System Standby"}
              </div>

              {/* Theme Toggle Button (Dark / Light) */}
              <button
                className="theme-toggle-btn"
                onClick={toggleTheme}
                aria-label="Toggle dark and light mode"
                title="Toggle Dark / Light Theme"
              >
                {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
              </button>
            </div>
          </nav>

          {/* HERO SECTION */}
          <section id="home" className="hero">
            <HeroShield3D />

            <div className="hero-badge">
              🔬 EXPLAINABLE AI DIGITAL MEDIA FORENSICS
            </div>

            <h1>
              Detect <span>Deepfakes</span>.<br />
              Understand the Evidence.
            </h1>

            <p>
              DeepShield combines face-centric deep learning, temporal analysis and visual explainability to investigate manipulated media.
            </p>

            <div className="hero-cta-group">
              <a href="#detection" className="hero-btn primary">
                ⚡ Start Forensic Analysis
              </a>
              <a href="#model" className="hero-btn secondary">
                🧠 Model Architecture
              </a>
            </div>
          </section>

          {/* FEATURE STRIP (4 COMPACT CARDS) */}
          <div className="feature-strip-grid">
            <div className="feature-strip-card">
              <div className="feature-icon-box">🎯</div>
              <div>
                <h4>High Accuracy</h4>
                <p>Advanced deep learning</p>
              </div>
            </div>

            <div className="feature-strip-card">
              <div className="feature-icon-box">🔥</div>
              <div>
                <h4>Explainable AI</h4>
                <p>Grad-CAM visualization</p>
              </div>
            </div>

            <div className="feature-strip-card">
              <div className="feature-icon-box">🎬</div>
              <div>
                <h4>Temporal Analysis</h4>
                <p>Frame-level investigation</p>
              </div>
            </div>

            <div className="feature-strip-card">
              <div className="feature-icon-box">📋</div>
              <div>
                <h4>Forensic Report</h4>
                <p>Exportable PDF audit</p>
              </div>
            </div>
          </div>

          {/* MAIN WORKSPACE CONTAINER */}
          <main className="main-container">
            {/* UPLOAD WORKSPACE CARDS */}
            <section id="detection">
              <div className="section-heading" style={{ marginBottom: "20px" }}>
                <h2>Forensic Analysis Workspace</h2>
                <p>Select image or video media for forensic neural inspection.</p>
              </div>

              <div className="mode-selector">
                <button
                  className={mode === "image" ? "mode-button active" : "mode-button"}
                  onClick={() => changeMode("image")}
                >
                  🖼️ Image Analysis
                </button>

                <button
                  className={mode === "video" ? "mode-button active" : "mode-button"}
                  onClick={() => changeMode("video")}
                >
                  🎬 Video Analysis
                </button>
              </div>

              {/* CARD 1 & CARD 2: Image & Video Analysis Workspace */}
              <TiltCard className="card upload-card">
                <label className="drop-zone">
                  <input
                    type="file"
                    accept={
                      mode === "image"
                        ? ".jpg,.jpeg,.png,image/jpeg,image/png"
                        : "video/*"
                    }
                    onChange={handleFileChange}
                  />

                  <div className="upload-icon">
                    {mode === "image" ? "🖼️" : "🎬"}
                  </div>

                  <h3>
                    {file
                      ? file.name
                      : `Upload ${mode === "image" ? "Image" : "Video"}`}
                  </h3>

                  <p>
                    Upload an {mode === "image" ? "image" : "video"} to detect manipulation and view Grad-CAM explanation.
                  </p>

                  <small>
                    {mode === "image"
                      ? "Supported Formats: JPG, JPEG, PNG (YuNet & EfficientNetB2)"
                      : "Supported Formats: MP4, MOV, AVI (Frame-Level Temporal Analysis)"}
                  </small>
                </label>

                {/* PREVIEW WITH AI SCANNING OVERLAY */}
                {preview && (
                  <div className="selected-preview">
                    <h3>Selected Media Preview</h3>

                    <div className="preview-media-wrapper">
                      {mode === "image" ? (
                        <img src={preview} alt="Selected" />
                      ) : (
                        <video src={preview} controls />
                      )}

                      {/* AI Scanning overlay while analyzing */}
                      {loading && <ScanOverlay mode={mode} />}
                    </div>
                  </div>
                )}

                {/* ACTION BUTTONS */}
                <div className="button-row">
                  <button
                    className="analyze-button"
                    onClick={analyzeFile}
                    disabled={!file || loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner"></span>
                        Executing Forensic Neural Pipeline...
                      </>
                    ) : (
                      <>🔍 Analyze {mode === "image" ? "Image" : "Video"}</>
                    )}
                  </button>

                  {file && !loading && (
                    <button className="reset-button" onClick={resetAnalysis}>
                      Reset
                    </button>
                  )}
                </div>

                {/* ERROR DISPLAY */}
                {error && <div className="error-box">⚠️ {error}</div>}
              </TiltCard>
            </section>

            {/* DEDICATED HOW IT WORKS SECTION */}
            <HowItWorks />

            {/* FORENSIC RESULT WORKSTATION & TABS */}
            {result && (
              <ForensicTabs
                result={result}
                mode={mode}
                fileName={file?.name}
                onOpenReport={() => setShowReport(true)}
              />
            )}

            {/* MODEL INSPECTOR */}
            <ModelInspector threshold={result?.threshold ?? 7} />

            {/* ABOUT SECTION */}
            <section id="about" className="about-section">
              <TiltCard className="card about-card">
                <div className="about-header-group">
                  <div className="section-badge">🛡️ ABOUT PLATFORM</div>
                  <h2>About <span>DeepShield</span> Engine</h2>
                  <p className="about-lead">
                    DeepShield is an explainable AI digital media forensic platform engineered for high-precision detection of manipulated images and videos. By combining face-centric deep neural networks, temporal frame aggregation, and gradient-based heatmaps, DeepShield provides transparent, audit-ready evidence for digital media integrity.
                  </p>
                </div>

                <div className="details-grid">
                  <div className="detail-card">
                    <div className="detail-icon">🧠</div>
                    <div className="detail-info">
                      <span className="detail-label">Classifier Model</span>
                      <strong className="detail-value">EfficientNetB2</strong>
                      <p className="detail-desc">260 × 260 facial feature extraction neural architecture</p>
                    </div>
                  </div>

                  <div className="detail-card">
                    <div className="detail-icon">🎯</div>
                    <div className="detail-info">
                      <span className="detail-label">Face Detector</span>
                      <strong className="detail-value">YuNet OpenCV DNN</strong>
                      <p className="detail-desc">Real-time landmark alignment & high-accuracy face crop pipeline</p>
                    </div>
                  </div>

                  <div className="detail-card">
                    <div className="detail-icon">🔥</div>
                    <div className="detail-info">
                      <span className="detail-label">Explainability</span>
                      <strong className="detail-value">Grad-CAM Activation</strong>
                      <p className="detail-desc">Gradient attention heatmaps highlighting facial manipulation regions</p>
                    </div>
                  </div>

                  <div className="detail-card">
                    <div className="detail-icon">⚡</div>
                    <div className="detail-info">
                      <span className="detail-label">Backend Infrastructure</span>
                      <strong className="detail-value">Python + Flask Server</strong>
                      <p className="detail-desc">Asynchronous media processing & temporal metrics engine</p>
                    </div>
                  </div>
                </div>

                <div className="about-pillars-strip">
                  <div className="pillar-item">
                    <span className="pillar-icon">🔒</span>
                    <div>
                      <strong>Privacy First</strong>
                      <p>Local media processing & zero data retention</p>
                    </div>
                  </div>
                  <div className="pillar-item">
                    <span className="pillar-icon">📊</span>
                    <div>
                      <strong>Temporal Metrics</strong>
                      <p>Multi-frame consistency & suspicion scoring</p>
                    </div>
                  </div>
                  <div className="pillar-item">
                    <span className="pillar-icon">📋</span>
                    <div>
                      <strong>Forensic Audits</strong>
                      <p>Exportable PDF forensic evidence reports</p>
                    </div>
                  </div>
                </div>
              </TiltCard>
            </section>

            {/* ANALYSIS SESSION HISTORY */}
            <AnalysisHistory />
          </main>

          {/* FOOTER */}
          <footer>
            <div>
              🛡️ <strong>DeepShield</strong> — AI for Media Integrity
            </div>
            <p>© 2026 DeepShield. Digital Media Forensic Analysis Platform.</p>
            <div className="footer-links">
              <a href="#about">Privacy</a>
              <a href="#about">Terms</a>
              <a href="#about">Contact</a>
            </div>
          </footer>
        </div>
      </div>

      {/* FORENSIC REPORT MODAL */}
      {showReport && (
        <ForensicReport
          result={result}
          mode={mode}
          fileName={file?.name}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  );
}

export default App;