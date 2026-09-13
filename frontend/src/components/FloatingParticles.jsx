import React from "react";
import "./FloatingParticles.css";

const FloatingParticles = () => {
  return (
    <div className="floating-bg-container" aria-hidden="true">
      {/* Radial Gradient Glows */}
      <div className="bg-glow top-left-glow"></div>
      <div className="bg-glow bottom-right-glow"></div>
      <div className="bg-glow center-glow"></div>

      {/* Cyber Grid Lines */}
      <div className="bg-cyber-grid"></div>

      {/* Floating Particles */}
      <div className="bg-particles">
        <span className="bp bp1"></span>
        <span className="bp bp2"></span>
        <span className="bp bp3"></span>
        <span className="bp bp4"></span>
        <span className="bp bp5"></span>
        <span className="bp bp6"></span>
        <span className="bp bp7"></span>
        <span className="bp bp8"></span>
      </div>
    </div>
  );
};

export default FloatingParticles;
