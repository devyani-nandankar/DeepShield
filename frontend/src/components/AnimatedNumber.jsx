import React, { useEffect, useState } from "react";

/**
 * AnimatedNumber - Smoothly animates a numeric value from 0 to target using requestAnimationFrame.
 */
const AnimatedNumber = ({ target = 0, duration = 1200, decimals = 1, suffix = "%", className = "" }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const numTarget = Number(target) || 0;
    let animationFrameId;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic animation formula
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentVal = easeProgress * numTarget;

      setDisplayValue(currentVal);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [target, duration]);

  return (
    <span className={className}>
      {displayValue.toFixed(decimals)}
      {suffix}
    </span>
  );
};

export default AnimatedNumber;
