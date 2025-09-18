"use client";

import { FC, JSX, useEffect, useRef, useState } from "react";

interface Position {
  x: number;
  y: number;
}

export interface SmoothCursorProps {
  cursor?: JSX.Element;
  springConfig?: {
    damping: number;
    stiffness: number;
    mass: number;
    restDelta: number;
  };
}

const DefaultCursorSVG: FC = () => {
  return <RocketCursorSVG />;
};

const RocketCursorSVG: FC = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="40"
      height="40"
      viewBox="0 0 32 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-rocket"
      style={{ 
        color: 'hsl(var(--foreground))'
      }}
    >
      {/* Rotate the rocket upright (lucide points 45deg by default) */}
      <g transform="rotate(-45 12 12)">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
        <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
        <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
      </g>

      {/* Inline thrusters inside SVG, kept within 24x24 viewBox */}
      <g>
        <rect x="9.5" y="18.5" width="1.6" height="3" fill="#FF4500" rx="0.8">
          <animate attributeName="height" values="3;5;3" dur="0.33s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;1;0.6" dur="0.33s" repeatCount="indefinite" />
        </rect>
        <rect x="11.7" y="18" width="1.8" height="3.8" fill="#1E90FF" rx="0.9">
          <animate attributeName="height" values="3.8;6;3.8" dur="0.27s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;1;0.6" dur="0.27s" repeatCount="indefinite" />
        </rect>
        <rect x="14.1" y="18.5" width="1.6" height="3" fill="#FFA500" rx="0.8">
          <animate attributeName="height" values="3;5;3" dur="0.39s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;1;0.6" dur="0.39s" repeatCount="indefinite" />
        </rect>
      </g>
    </svg>
  );
};

export function SmoothCursor({
  cursor = <DefaultCursorSVG />,
  springConfig = {
    damping: 45,
    stiffness: 400,
    mass: 1,
    restDelta: 0.001,
  },
}: SmoothCursorProps) {
  const [isMoving, setIsMoving] = useState(false);
  
  const lastMousePos = useRef<Position>({ x: 0, y: 0 });
  const velocity = useRef<Position>({ x: 0, y: 0 });
  const lastUpdateTime = useRef(Date.now());
  const previousAngle = useRef(0);
  const accumulatedRotation = useRef(0);
  const cursorRef = useRef<HTMLDivElement>(null);
  const moveTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const updateVelocity = (currentPos: Position) => {
      const currentTime = Date.now();
      const deltaTime = currentTime - lastUpdateTime.current;

      if (deltaTime > 0) {
        velocity.current = {
          x: (currentPos.x - lastMousePos.current.x) / deltaTime,
          y: (currentPos.y - lastMousePos.current.y) / deltaTime,
        };
      }

      lastUpdateTime.current = currentTime;
      lastMousePos.current = currentPos;
    };

    const smoothMouseMove = (e: MouseEvent) => {
      const currentPos = { x: e.clientX, y: e.clientY };
      
      // Use RAF for position updates to sync with display refresh rate
      requestAnimationFrame(() => {
        if (cursorRef.current) {
          cursorRef.current.style.setProperty('--cursor-x', `${currentPos.x}px`);
          cursorRef.current.style.setProperty('--cursor-y', `${currentPos.y}px`);
        }
      });

      // Only calculate velocity and rotation when needed (less frequent)
      const deltaX = currentPos.x - lastMousePos.current.x;
      const deltaY = currentPos.y - lastMousePos.current.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      if (distance > 1) { // Only process if mouse moved significantly
        updateVelocity(currentPos);
        
        const speed = Math.sqrt(
          velocity.current.x * velocity.current.x + 
          velocity.current.y * velocity.current.y
        );

        if (speed > 0.1) {
          const currentAngle = Math.atan2(velocity.current.y, velocity.current.x) * (180 / Math.PI) + 90;

          let angleDiff = currentAngle - previousAngle.current;
          if (angleDiff > 180) angleDiff -= 360;
          if (angleDiff < -180) angleDiff += 360;
          accumulatedRotation.current += angleDiff;
          
          if (cursorRef.current) {
            cursorRef.current.style.setProperty('--cursor-rotation', `${accumulatedRotation.current}deg`);
            cursorRef.current.style.setProperty('--cursor-scale', '0.95');
          }
          
          previousAngle.current = currentAngle;
          setIsMoving(true);

          // Clear existing timeout
          if (moveTimeoutRef.current) {
            clearTimeout(moveTimeoutRef.current);
          }
          
          moveTimeoutRef.current = setTimeout(() => {
            if (cursorRef.current) {
              cursorRef.current.style.setProperty('--cursor-scale', '1');
            }
            setIsMoving(false);
          }, 150);
        }
      }
    };

    // Hide cursor globally
    document.body.style.cursor = "none";
    document.documentElement.style.cursor = "none";
    
    // Force cursor none on all elements
    const style = document.createElement('style');
    style.setAttribute('data-custom-cursor', 'true');
    style.textContent = '* { cursor: none !important; }';
    document.head.appendChild(style);
    
    window.addEventListener("mousemove", smoothMouseMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", smoothMouseMove);
      document.body.style.cursor = "auto";
      document.documentElement.style.cursor = "auto";
      
      // Remove the injected style
      const injectedStyle = document.querySelector('style[data-custom-cursor]');
      if (injectedStyle) {
        injectedStyle.remove();
      }
      
      if (moveTimeoutRef.current) {
        clearTimeout(moveTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      style={{
        position: "fixed",
        left: "var(--cursor-x, 0px)",
        top: "var(--cursor-y, 0px)",
        transform: "translate(-50%, -50%) rotate(var(--cursor-rotation, 0deg))",
        zIndex: 100,
        pointerEvents: "none",
        willChange: "transform",
        backfaceVisibility: "hidden",
        perspective: "1000px",
        transformStyle: "preserve-3d",
        contain: "layout style paint",
        // Initialize CSS custom properties
        "--cursor-x": "0px",
        "--cursor-y": "0px", 
        "--cursor-rotation": "0deg",
        "--cursor-scale": "1",
      } as React.CSSProperties}
    >
      <div
        style={{
          transform: "scale(var(--cursor-scale, 1))",
          transition: "transform 0.1s ease-out",
          willChange: "transform",
        }}
      >
        {cursor}
      </div>
    </div>
  );
}
