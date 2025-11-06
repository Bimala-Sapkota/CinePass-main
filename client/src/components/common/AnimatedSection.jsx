import React from "react";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";

function AnimatedSection({
  children,
  className = "",
  animation = "slideUp",
  delay = 0,
  duration = 600,
  reversible = false,
}) {
  const [ref, isVisible] = useScrollAnimation({
    triggerOnce: !reversible,
  });

  const getAnimationClasses = () => {
    const baseClasses = `transition-all ease-out duration-${duration}`;

    switch (animation) {
      case "slideUp":
        return `${baseClasses} ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`;
      case "slideLeft":
        return `${baseClasses} ${
          isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
        }`;
      case "slideRight":
        return `${baseClasses} ${
          isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
        }`;
      case "fadeIn":
        return `${baseClasses} ${isVisible ? "opacity-100" : "opacity-0"}`;
      case "scaleIn":
        return `${baseClasses} ${
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`;
      default:
        return `${baseClasses} ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`;
    }
  };
  return (
    <div
      ref={ref}
      className={`${getAnimationClasses()} ${className}`}
      style={{
        transitionDelay: `${delay}ms`,
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
}

export default AnimatedSection;
