import { useState, useEffect, useRef } from "react";
import Sidebar from "./components/Sidebar";
import TiltCard from "./components/TiltCard";
import HeroShield3D from "./components/HeroShield3D";
import ScanOverlay from "./components/ScanOverlay";
import ForensicTabs from "./components/ForensicTabs";
import HowItWorks from "./components/HowItWorks";
import ModelInspector from "./components/ModelInspector";
import ResearchDashboard from "./components/ResearchDashboard";
import AnalysisHistory, { saveAnalysisToHistory } from "./components/AnalysisHistory";
import ForensicReport from "./components/ForensicReport";
import MovingForensicBackground from "./components/MovingForensicBackground";
import "./App.css";
const API_URL = import.meta.env.VITE_API_URL;
if (!API_URL) {
  console.error("VITE_API_URL is not configured.");
}

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

  const fileInputRef = useRef(null);

  // Apply theme to document root on change
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("deepshield_theme", theme);
  }, [theme]);

  // Check backend availability on mount and periodically
  useEffect(() => {
    if (!API_URL) {
  console.error("VITE_API_URL is not configured.");
  setBackendOnline(false);
  return;
}
      fetch(`${API_URL}/`)
        .then((res) => {
          if (res.ok) setBackendOnline(true);
          else setBackendOnline(false);
        })
        .catch(() => setBackendOnline(false));
    };

    checkBackend();
    const interval = setInterval(checkBackend, 15000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.key === "Escape") {
        setShowReport(false);
      } else if (e.key === "1") {
        changeMode("image");
      } else if (e.key === "2") {
        changeMode("video");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    // Validate type
    if (mode === "image" && !selected.type.startsWith("image/") && !selected.name.match(/\.(jpe?g|png|webp)$/i)) {
      setError("Please upload a supported image file (JPG, JPEG, PNG).");
      return;
    }
    if (mode === "video" && !selected.type.startsWith("video/") && !selected.name.match(/\.(mp4|mov|avi|webm)$/i)) {
      setError("Please upload a supported video file (MP4, MOV, AVI).");
      return;
    }

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
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const analyzeFile = async () => {
    if (!file) {
      setError(`Please select ${mode === "image" ? "an image" : "a video"} file first.`);
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    let endpoint;
    if (mode === "image") {
      // For image analysis, send the file under the "file" key to the live backend URL
      formData.append("file", file);
      endpoint = "https://deepshield-api-bgo3.onrender.com/predict";
    } else {
      // Keep video analysis unchanged, using environment‑based URL
      formData.append("video", file);
      endpoint = `${API_URL}/predict_video`;
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed on backend.");
      }

      setBackendOnline(true);
      // Generate unique forensic analysis tracking ID
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

      // Smooth scroll to forensics results
      setTimeout(() => {
        document.getElementById("forensics")?.scrollIntoView({ behavior: "smooth" });
      }, 150);
    } catch (err) {
      if (err.name === "TypeError" && err.message.includes("fetch")) {
        setBackendOnline(false);
        setError("DeepShield AI service is temporarily unavailable. Please try again in a moment.");
      } else {
        setError(err.message || "An unexpected error occurred during media analysis.");
      }
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
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
                <div className="nav-brand-subtitle">AI-Powered Digital Media Forensics</div>
              </div>
            </div>

            <div className="navbar-right-group">
              <div className="top-nav-links">
                <a href="#home">Home</a>
                <a href="#detection">Detection</a>
                <a href="#forensics">Forensics</a>
                <a href="#research">Research</a>
                <a href="#model">Model</a>
                <a href="#about">About</a>
              </div>

              <div
                className="nav-status"
                title={
                  backendOnline
                ? "DeepShield AI service is online"
                : "DeepShield AI service is offline"
                }
              >
                <span className={`status-dot ${backendOnline ? "online" : "offline"}`}></span>
                <span>{backendOnline ? "SYSTEM ONLINE" : "SYSTEM OFFLINE"}</span>
              </div>

              {/* Theme Toggle Button (Dark / Light) */}
              <button
                className="theme-toggle-btn"
                onClick={toggleTheme}
                aria-label="Toggle dark and light mode"
                title="Toggle Dark / Light Theme"
              >
                {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
              </button>
            </div>
          </nav>

          {/* HERO SECTION */}
          <section id="home" className="hero">
            <HeroShield3D />

            <div className="hero-badge">
              🔬 AI-POWERED DIGITAL MEDIA FORENSIC PLATFORM
            </div>

            <h1>
              Detect <span>Deepfakes</span>.<br />
              Understand the Evidence.
            </h1>

            <p>
              DeepShield combines face-centric deep neural networks, temporal frame analysis, and visual explainability to detect and investigate manipulated digital media.
            </p>

            <div className="hero-feature-tags">
              <span className="hero-tag">🎯 Face-Centric Analysis</span>
              <span className="hero-tag">🧠 EfficientNetB2 Core</span>
              <span className="hero-tag">🔥 Grad-CAM Explainability</span>
              <span className="hero-tag">🎬 Temporal Frame Verification</span>
            </div>

            <div className="hero-cta-group">
              <button
                className="hero-btn primary"
                onClick={() => {
                  changeMode("image");
                  document.getElementById("detection")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                🔍 Analyze Image
              </button>
              <button
                className="hero-btn secondary"
                onClick={() => {
                  changeMode("video");
                  document.getElementById("detection")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                🎬 Analyze Video
              </button>
            </div>
          </section>

          {/* FEATURE STRIP (4 COMPACT CARDS) */}
          <div className="feature-strip-grid">
            <div className="feature-strip-card">
              <div className="feature-icon-box">🎯</div>
              <div>
                <h4>High Accuracy</h4>
                <p>EfficientNetB2 CNN architecture</p>
              </div>
            </div>

            <div className="feature-strip-card">
              <div className="feature-icon-box">🔥</div>
              <div>
                <h4>Explainable AI</h4>
                <p>Grad-CAM salient attention heatmaps</p>
              </div>
            </div>

            <div className="feature-strip-card">
              <div className="feature-icon-box">🎬</div>
              <div>
                <h4>Temporal Analysis</h4>
                <p>Frame-by-frame anomaly detection</p>
              </div>
            </div>

            <div className="feature-strip-card">
              <div className="feature-icon-box">📋</div>
              <div>
                <h4>Forensic Report</h4>
                <p>Exportable PDF audit report</p>
              </div>
            </div>
          </div>

          {/* MAIN WORKSPACE CONTAINER */}
          <main className="main-container">
            {/* UPLOAD WORKSPACE CARDS */}
            <section id="detection" style={{ scrollMarginTop: "90px" }}>
              <div className="section-heading" style={{ marginBottom: "20px" }}>
                <div className="section-badge">FORENSIC WORKSPACE</div>
                <h2>Media Analysis Intake</h2>
                <p>Select image or video media for automated facial localization, feature extraction, and manipulation scoring.</p>
              </div>

              <div className="mode-selector">
                <button
                  className={mode === "image" ? "mode-button active" : "mode-button"}
                  onClick={() => changeMode("image")}
                >
                  🖼️ IMAGE FORENSIC ANALYSIS
                </button>

                <button
                  className={mode === "video" ? "mode-button active" : "mode-button"}
                  onClick={() => changeMode("video")}
                >
                  🎬 VIDEO FORENSIC ANALYSIS
                </button>
              </div>

              {/* CARD: Image & Video Analysis Workspace */}
              <TiltCard className="card upload-card">
                <label className="drop-zone">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={
                      mode === "image"
                        ? ".jpg,.jpeg,.png,image/jpeg,image/png"
                        : ".mp4,.mov,.avi,video/*"
                    }
                    onChange={handleFileChange}
                  />

                  <div className="upload-icon">
                    {mode === "image" ? "🖼️" : "🎬"}
                  </div>

                  <h3>
                    {file
                      ? file.name
                      : `Select or Drop ${mode === "image" ? "Image" : "Video"} Here`}
                  </h3>

                  <p>
                    {mode === "image"
                      ? "Deep neural inspection with YuNet face alignment and Grad-CAM explainability."
                      : "Multi-frame temporal consistency and frame-level anomaly investigation."}
                  </p>

                  <small>
                    {mode === "image"
                      ? "Supported Formats: JPG, JPEG, PNG (Processed at 260 × 260)"
                      : "Supported Formats: MP4, MOV, AVI (Multi-Frame Video Decoding)"}
                  </small>
                </label>

                {/* FILE DETAILS SUMMARY */}
                {file && (
                  <div className="file-details-panel">
                    <div className="file-detail-item">
                      <span className="file-detail-label">File:</span>
                      <span className="file-detail-val" title={file.name}>{file.name}</span>
                    </div>
                    <div className="file-detail-item">
                      <span className="file-detail-label">Size:</span>
                      <span className="file-detail-val">
                        {file.size > 1024 * 1024
                          ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
                          : `${(file.size / 1024).toFixed(1)} KB`}
                      </span>
                    </div>
                    <div className="file-detail-item">
                      <span className="file-detail-label">Type:</span>
                      <span className="file-detail-val">{file.type || (mode === "image" ? "image/jpeg" : "video/mp4")}</span>
                    </div>
                  </div>
                )}

                {/* PREVIEW WITH AI SCANNING OVERLAY */}
                {preview && (
                  <div className="selected-preview">
                    <h3>Media Preview</h3>

                    <div className="preview-media-wrapper">
                      {mode === "image" ? (
                        <img src={preview} alt="Selected forensic intake" />
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
                        Running AI Forensic Pipeline...
                      </>
                    ) : (
                      <>🔍 Analyze {mode === "image" ? "Image" : "Video"}</>
                    )}
                  </button>

                  {file && !loading && (
                    <button className="reset-button" onClick={resetAnalysis}>
                      ↺ Reset Media
                    </button>
                  )}
                </div>

                {/* ERROR DISPLAY */}
                {error && (
                  <div className="error-box">
                    <div className="error-icon" style={{ fontSize: "20px" }}>⚠️</div>
                    <div className="error-content" style={{ fontSize: "13px", lineHeight: "1.5" }}>
                      <strong style={{ display: "block", marginBottom: "3px" }}>Analysis Notification</strong>
                      <div>{error}</div>
                      
                    </div>
                  </div>
                )}
              </TiltCard>
            </section>

            {/* FORENSIC RESULT WORKSTATION & TABS */}
            {result ? (
              <section id="forensics" className="forensics-results-section">
                <ForensicTabs
                  result={result}
                  mode={mode}
                  fileName={file?.name}
                  onOpenReport={() => setShowReport(true)}
                />
              </section>
            ) : (
              <section id="forensics" className="forensics-results-empty">
                <div className="forensics-empty-card">
                  <div className="empty-icon">🛡️</div>
                  <h3>Forensic Evidence Workspace Ready</h3>
                  <p>
                    Select an image or video above and initiate analysis to inspect detected face crops, Grad-CAM attention heatmaps, temporal timelines, and evidence scoreboards.
                  </p>
                </div>
              </section>
            )}

            {/* DEDICATED HOW IT WORKS SECTION */}
            <HowItWorks />

            {/* MODEL INSPECTOR */}
            <ModelInspector threshold={result?.threshold ?? 7} />

            {/* TECHNOLOGY STACK SHOWCASE */}
            <section id="tech-stack" className="tech-stack-section">
              <div className="section-heading text-center" style={{ textAlign: "center", marginBottom: "20px" }}>
                <div className="section-badge">CORE STACK</div>
                <h2>Forensic Technology Architecture</h2>
                <p>Production-grade computer vision, neural networks, and explainability frameworks powering DeepShield.</p>
              </div>

              <div className="tech-stack-grid">
                <div className="tech-card">
                  <div className="tech-header">
                    <div className="tech-icon">🧠</div>
                    <div className="tech-info">
                      <span className="tech-name">EfficientNetB2</span>
                      <span className="tech-badge">Deep Neural Network</span>
                    </div>
                  </div>
                  <p className="tech-desc">
                    Pretrained deep convolutional network fine-tuned for high-sensitivity forensic facial artifact detection at 260 × 260 resolution.
                  </p>
                </div>

                <div className="tech-card">
                  <div className="tech-header">
                    <div className="tech-icon">🎯</div>
                    <div className="tech-info">
                      <span className="tech-name">OpenCV YuNet</span>
                      <span className="tech-badge">Face Detection DNN</span>
                    </div>
                  </div>
                  <p className="tech-desc">
                    High-speed ONNX face detector providing 5-point facial landmark alignment and margin-scaled bounding box crops.
                  </p>
                </div>

                <div className="tech-card">
                  <div className="tech-header">
                    <div className="tech-icon">🔥</div>
                    <div className="tech-info">
                      <span className="tech-name">Grad-CAM</span>
                      <span className="tech-badge">Explainable AI</span>
                    </div>
                  </div>
                  <p className="tech-desc">
                    Gradient-weighted Class Activation Mapping computed from the top activation layer to provide visual audit trails of manipulation regions.
                  </p>
                </div>

                <div className="tech-card">
                  <div className="tech-header">
                    <div className="tech-icon">⚡</div>
                    <div className="tech-info">
                      <span className="tech-name">Flask REST API</span>
                      <span className="tech-badge">Backend Engine</span>
                    </div>
                  </div>
                  <p className="tech-desc">
                    Lightweight Python server hosting the neural inference pipeline, temporal aggregation algorithms, and Base64 artifact streams.
                  </p>
                </div>

                <div className="tech-card">
                  <div className="tech-header">
                    <div className="tech-icon">⚛️</div>
                    <div className="tech-info">
                      <span className="tech-name">React + Vite</span>
                      <span className="tech-badge">Frontend Workstation</span>
                    </div>
                  </div>
                  <p className="tech-desc">
                    Responsive dark-mode forensic workstation with interactive Grad-CAM sliders, temporal timelines, and audit report generation.
                  </p>
                </div>

                <div className="tech-card">
                  <div className="tech-header">
                    <div className="tech-icon">🐍</div>
                    <div className="tech-info">
                      <span className="tech-name">Python 3</span>
                      <span className="tech-badge">Scientific Runtime</span>
                    </div>
                  </div>
                  <p className="tech-desc">
                    TensorFlow and NumPy environment executing accelerated tensor mathematics and numerical suspicion calculations.
                  </p>
                </div>

                <div className="tech-card">
                  <div className="tech-header">
                    <div className="tech-icon">👁️</div>
                    <div className="tech-info">
                      <span className="tech-name">OpenCV</span>
                      <span className="tech-badge">Computer Vision</span>
                    </div>
                  </div>
                  <p className="tech-desc">
                    Color space conversions (BGR/RGB), OpenCV colormaps (JET), and multi-frame video decoders.
                  </p>
                </div>
              </div>
            </section>

            {/* RESEARCH & SCIENTIFIC EVALUATION DASHBOARD */}
            <section id="research" style={{ scrollMarginTop: "90px", marginBottom: "45px" }}>
              <ResearchDashboard />
            </section>

            {/* ABOUT SECTION */}
            <section id="about" className="about-section" style={{ scrollMarginTop: "90px" }}>
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
                      <p>Local media processing & zero permanent data retention</p>
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

                {/* PRIVACY & DATA HANDLING NOTICE */}
                <div className="privacy-notice-banner">
                  <div className="privacy-icon">🔒</div>
                  <div className="privacy-content">
                    <strong>Privacy & Data Handling Notice</strong>
                    <p>
                      Uploaded media is sent to the DeepShield analysis backend for processing. Avoid uploading sensitive or private media. DeepShield does not permanently store raw uploaded media files on the server.
                    </p>
                  </div>
                </div>

                {/* METHODOLOGICAL SCOPE & LIMITATIONS */}
                <div style={{ marginTop: "16px", padding: "14px 18px", borderRadius: "12px", background: "var(--feature-card-bg)", border: "1px solid var(--border-color)", fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                  ⚖️ <strong>Methodological Scope & Limitations:</strong> DeepShield provides assistive forensic probability estimation based on learned facial representations. Deepfake detection models can exhibit variability under extreme compression, motion blur, or adversarial noise. Findings should be corroborated with multi-source forensic evidence before reaching definitive conclusions.
                </div>
              </TiltCard>
            </section>

            {/* ANALYSIS SESSION HISTORY */}
            <AnalysisHistory />
          </main>

          {/* FOOTER */}
          <footer>
            <div>
              🛡️ <strong>DeepShield</strong> — AI-Powered Digital Media Forensics
            </div>
            <p>© 2026 DeepShield. Digital Media Forensic Analysis Platform.</p>
            <div className="footer-links">
              <a href="#about">Privacy</a>
              <a href="#about">Methodology</a>
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