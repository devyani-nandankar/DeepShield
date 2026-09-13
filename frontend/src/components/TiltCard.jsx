import React, { useRef } from "react";
import "./TiltCard.css";

/**
 * TiltCard - wraps children with a subtle 3D tilt based on mouse position.
 * Max rotation: ~6deg, returns smoothly to neutral on mouse leave.
 */
const TiltCard = ({ children, className = "" }) => {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.innerWidth < 768) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; // mouse X relative to card
    const y = e.clientY - rect.top;  // mouse Y relative to card

    const halfWidth = rect.width / 2;
    const halfHeight = rect.height / 2;

    const rotateX = ((y - halfHeight) / halfHeight) * -6; // max 6deg
    const rotateY = ((x - halfWidth) / halfWidth) * 6;   // max 6deg

    card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.01, 1.01, 1.01)`;
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;

    card.style.transition = "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)";
    card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";

    const cleanup = () => {
      if (card) card.style.transition = "";
      card.removeEventListener("transitionend", cleanup);
    };

    card.addEventListener("transitionend", cleanup);
  };

  return (
    <div
      ref={cardRef}
      className={`tilt-card ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
};

export default TiltCard;
