import React, { useState, useRef } from "react";
import "./ComparisonSlider.css";

const ComparisonSlider = ({ originalSrc, gradcamSrc, labelLeft = "ORIGINAL FACE", labelRight = "MODEL ATTENTION (GRAD-CAM)" }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handleMove = (clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let pos = (x / rect.width) * 100;
    if (pos < 0) pos = 0;
    if (pos > 100) pos = 100;
    setSliderPosition(pos);
  };

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleTouchMove = (e) => {
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  };

  return (
    <div className="comparison-slider-container">
      <div className="comparison-title-bar">
        <span className="comp-label left">{labelLeft}</span>
        <span className="comp-hint">Drag slider to compare visual attention</span>
        <span className="comp-label right">{labelRight}</span>
      </div>

      <div
        ref={containerRef}
        className="comparison-stage"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
      >
        {/* Underneath Layer: Grad-CAM heatmap */}
        <div className="comparison-layer right-layer">
          <img src={gradcamSrc} alt={labelRight} />
        </div>

        {/* Clipped Top Layer: Original Face */}
        <div
          className="comparison-layer left-layer"
          style={{ width: `${sliderPosition}%` }}
        >
          <img src={originalSrc} alt={labelLeft} />
        </div>

        {/* Divider Slider Handle */}
        <div
          className="comparison-divider"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="divider-line"></div>
          <div className="divider-handle">
            <span className="handle-arrow">◀</span>
            <span className="handle-arrow">▶</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonSlider;
