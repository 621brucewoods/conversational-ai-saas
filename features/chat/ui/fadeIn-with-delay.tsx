import React, { useEffect, useState } from "react";

interface FadeInWithDelayProps {
  delay: number;
  opacityDuration?: number; // Duration for opacity animation
  transformDuration?: number; // Duration for transform animation
  easing?: string; // Easing for both animations
  children: React.ReactNode;
}

const FadeInWithDelay: React.FC<FadeInWithDelayProps> = ({
  delay,
  opacityDuration = 1, // Default to 1s
  transformDuration = 1, // Default to 1s
  easing = "ease-in-out", // Default easing
  children,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timeout); // Cleanup the timeout on unmount
  }, [delay]);

  return (
    <div
      style={{
        opacity: isVisible ? 1 : 0,
        transition: `
          opacity ${opacityDuration}s ${easing},
          transform ${transformDuration}s ${easing}
        `, // Separate durations and shared easing
      }}
    >
      {children}
    </div>
  );
};

export default FadeInWithDelay;
