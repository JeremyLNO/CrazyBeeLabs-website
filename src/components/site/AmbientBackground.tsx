"use client";

import { useEffect, useRef } from "react";

/**
 * AmbientBackground
 *
 * A subtle, calm, GPU-friendly ambient layer for the whole site.
 * Evokes three brand themes at once:
 *   - BEES: drifting/rotating honeycomb hexagons + a honey cursor glow
 *   - LAB:  floating molecule/bubble dots + a faint grid
 *   - APPS: soft rounded-square "app tile" silhouettes drifting
 *
 * It renders a fixed, click-through, behind-everything layer at very low
 * opacity so it never distracts on the light (warm off-white) theme.
 * Only `transform` and `opacity` are animated. Honors reduced motion.
 */

type HexSpec = {
  left: number; // vw
  top: number; // vh
  size: number; // px
  filled: boolean;
  duration: number; // s
  delay: number; // s (negative to desync)
  drift: number; // px
  spin: number; // deg
  opacity: number;
};

type DotSpec = {
  left: number;
  top: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
  opacity: number;
};

type TileSpec = {
  left: number;
  top: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
  spin: number;
  opacity: number;
};

// Deterministic specs (avoid hydration mismatch by not using Math.random at render).
const HEXAGONS: HexSpec[] = [
  { left: 6, top: 12, size: 120, filled: true, duration: 42, delay: -3, drift: 22, spin: 14, opacity: 0.1 },
  { left: 18, top: 68, size: 76, filled: false, duration: 55, delay: -12, drift: 18, spin: -10, opacity: 0.08 },
  { left: 32, top: 24, size: 150, filled: false, duration: 60, delay: -22, drift: 26, spin: 8, opacity: 0.07 },
  { left: 44, top: 82, size: 90, filled: true, duration: 48, delay: -8, drift: 20, spin: -16, opacity: 0.09 },
  { left: 58, top: 16, size: 64, filled: false, duration: 52, delay: -30, drift: 16, spin: 20, opacity: 0.08 },
  { left: 68, top: 60, size: 130, filled: true, duration: 66, delay: -5, drift: 24, spin: -12, opacity: 0.08 },
  { left: 80, top: 30, size: 100, filled: false, duration: 58, delay: -18, drift: 22, spin: 12, opacity: 0.09 },
  { left: 88, top: 76, size: 72, filled: false, duration: 50, delay: -26, drift: 18, spin: -20, opacity: 0.07 },
  { left: 12, top: 44, size: 58, filled: false, duration: 46, delay: -15, drift: 14, spin: 18, opacity: 0.07 },
  { left: 52, top: 48, size: 112, filled: false, duration: 70, delay: -34, drift: 28, spin: -8, opacity: 0.06 },
  { left: 74, top: 90, size: 84, filled: true, duration: 54, delay: -20, drift: 20, spin: 10, opacity: 0.08 },
  { left: 26, top: 92, size: 66, filled: false, duration: 44, delay: -9, drift: 16, spin: -14, opacity: 0.07 },
];

const DOTS: DotSpec[] = [
  { left: 14, top: 30, size: 10, duration: 34, delay: -4, drift: 30, opacity: 0.18 },
  { left: 38, top: 62, size: 6, duration: 40, delay: -14, drift: 26, opacity: 0.14 },
  { left: 56, top: 22, size: 14, duration: 46, delay: -8, drift: 34, opacity: 0.16 },
  { left: 72, top: 48, size: 8, duration: 38, delay: -20, drift: 28, opacity: 0.15 },
  { left: 84, top: 66, size: 5, duration: 42, delay: -11, drift: 24, opacity: 0.13 },
  { left: 46, top: 88, size: 11, duration: 50, delay: -25, drift: 32, opacity: 0.16 },
  { left: 22, top: 78, size: 7, duration: 36, delay: -6, drift: 26, opacity: 0.14 },
  { left: 64, top: 12, size: 9, duration: 44, delay: -17, drift: 30, opacity: 0.15 },
];

const TILES: TileSpec[] = [
  { left: 24, top: 20, size: 88, duration: 64, delay: -6, drift: 26, spin: 6, opacity: 0.07 },
  { left: 70, top: 74, size: 108, duration: 72, delay: -24, drift: 30, spin: -8, opacity: 0.06 },
  { left: 8, top: 58, size: 72, duration: 58, delay: -13, drift: 22, spin: 10, opacity: 0.07 },
];

const CSS = `
.cbl-amb-root {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  overflow: hidden;
  background:
    radial-gradient(120% 120% at 50% -10%, rgba(245, 180, 0, 0.05), transparent 60%),
    radial-gradient(90% 90% at 90% 100%, rgba(245, 180, 0, 0.035), transparent 55%);
}

/* Faint LAB grid */
.cbl-amb-grid {
  position: absolute;
  inset: -2px;
  background-image:
    linear-gradient(to right, rgba(8, 8, 8, 0.035) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(8, 8, 8, 0.035) 1px, transparent 1px);
  background-size: 68px 68px;
  mask-image: radial-gradient(120% 100% at 50% 40%, black, transparent 78%);
  -webkit-mask-image: radial-gradient(120% 100% at 50% 40%, black, transparent 78%);
  opacity: 0.6;
}

.cbl-amb-item {
  position: absolute;
  will-change: transform, opacity;
}

.cbl-amb-hex {
  animation: cbl-amb-drift var(--cbl-dur) ease-in-out var(--cbl-delay) infinite alternate;
}
.cbl-amb-tile {
  animation: cbl-amb-drift var(--cbl-dur) ease-in-out var(--cbl-delay) infinite alternate;
}
.cbl-amb-dot {
  animation: cbl-amb-float var(--cbl-dur) ease-in-out var(--cbl-delay) infinite alternate;
}

.cbl-amb-dot span {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, rgba(245, 180, 0, 0.9), rgba(245, 180, 0, 0.25) 60%, transparent 72%);
  box-shadow: 0 0 6px rgba(245, 180, 0, 0.35);
}

.cbl-amb-tile span {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 26%;
  border: 1.5px solid rgba(8, 8, 8, 0.5);
  background: linear-gradient(135deg, rgba(245, 180, 0, 0.14), rgba(245, 180, 0, 0.02));
}

/* Cursor-follow honey glow */
.cbl-amb-glow {
  position: absolute;
  top: 0;
  left: 0;
  width: 520px;
  height: 520px;
  margin-left: -260px;
  margin-top: -260px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(245, 180, 0, 0.16), rgba(245, 180, 0, 0.06) 40%, transparent 68%);
  will-change: transform;
  transform: translate3d(-9999px, -9999px, 0);
  opacity: 0;
  transition: opacity 0.6s ease;
}
.cbl-amb-glow.cbl-amb-glow-on {
  opacity: 1;
}

@keyframes cbl-amb-drift {
  from {
    transform: translate3d(0, 0, 0) rotate(0deg);
  }
  to {
    transform: translate3d(var(--cbl-dx), calc(var(--cbl-dx) * -0.6), 0) rotate(var(--cbl-spin));
  }
}

@keyframes cbl-amb-float {
  from {
    transform: translate3d(0, 0, 0);
  }
  to {
    transform: translate3d(calc(var(--cbl-dx) * -0.5), calc(var(--cbl-dx) * -1), 0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .cbl-amb-hex,
  .cbl-amb-tile,
  .cbl-amb-dot {
    animation: none !important;
  }
  .cbl-amb-glow {
    display: none !important;
  }
}
`;

function Hexagon({ spec }: { spec: HexSpec }) {
  const stroke = "rgba(245, 180, 0, 0.85)";
  const fill = spec.filled ? "rgba(245, 180, 0, 0.14)" : "none";
  // Flat-top hexagon points on a 100x100 viewBox.
  const points = "25,6 75,6 100,50 75,94 25,94 0,50";
  return (
    <div
      className="cbl-amb-item cbl-amb-hex"
      style={
        {
          left: `${spec.left}vw`,
          top: `${spec.top}vh`,
          width: `${spec.size}px`,
          height: `${spec.size}px`,
          opacity: spec.opacity,
          ["--cbl-dur" as string]: `${spec.duration}s`,
          ["--cbl-delay" as string]: `${spec.delay}s`,
          ["--cbl-dx" as string]: `${spec.drift}px`,
          ["--cbl-spin" as string]: `${spec.spin}deg`,
        } as React.CSSProperties
      }
    >
      <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
        <polygon points={points} fill={fill} stroke={stroke} strokeWidth={2} />
      </svg>
    </div>
  );
}

export function AmbientBackground() {
  const glowRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  // Target (latest mouse) and current (eased) positions.
  const target = useRef<{ x: number; y: number }>({ x: -9999, y: -9999 });
  const current = useRef<{ x: number; y: number }>({ x: -9999, y: -9999 });
  const hasPointer = useRef<boolean>(false);

  useEffect(() => {
    const glow = glowRef.current;
    if (!glow) return;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const fine =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(pointer: fine)").matches;

    if (reduce || !fine) {
      // No cursor glow on reduced-motion or touch/coarse-pointer devices.
      return;
    }

    const handleMove = (e: PointerEvent) => {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
      if (!hasPointer.current) {
        hasPointer.current = true;
        // Snap start position to avoid a slide from the corner.
        current.current.x = e.clientX;
        current.current.y = e.clientY;
        glow.classList.add("cbl-amb-glow-on");
      }
    };

    const handleLeave = () => {
      glow.classList.remove("cbl-amb-glow-on");
    };

    const tick = () => {
      const ease = 0.12;
      current.current.x += (target.current.x - current.current.x) * ease;
      current.current.y += (target.current.y - current.current.y) * ease;
      glow.style.transform = `translate3d(${current.current.x}px, ${current.current.y}px, 0)`;
      rafRef.current = window.requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", handleMove, { passive: true });
    window.addEventListener("pointerleave", handleLeave);
    window.addEventListener("blur", handleLeave);
    rafRef.current = window.requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerleave", handleLeave);
      window.removeEventListener("blur", handleLeave);
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []);

  return (
    <div className="cbl-amb-root" aria-hidden="true">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="cbl-amb-grid" />

      {HEXAGONS.map((spec, i) => (
        <Hexagon key={`hex-${i}`} spec={spec} />
      ))}

      {TILES.map((spec, i) => (
        <div
          key={`tile-${i}`}
          className="cbl-amb-item cbl-amb-tile"
          style={
            {
              left: `${spec.left}vw`,
              top: `${spec.top}vh`,
              width: `${spec.size}px`,
              height: `${spec.size}px`,
              opacity: spec.opacity,
              ["--cbl-dur" as string]: `${spec.duration}s`,
              ["--cbl-delay" as string]: `${spec.delay}s`,
              ["--cbl-dx" as string]: `${spec.drift}px`,
              ["--cbl-spin" as string]: `${spec.spin}deg`,
            } as React.CSSProperties
          }
        >
          <span />
        </div>
      ))}

      {DOTS.map((spec, i) => (
        <div
          key={`dot-${i}`}
          className="cbl-amb-item cbl-amb-dot"
          style={
            {
              left: `${spec.left}vw`,
              top: `${spec.top}vh`,
              width: `${spec.size}px`,
              height: `${spec.size}px`,
              opacity: spec.opacity,
              ["--cbl-dur" as string]: `${spec.duration}s`,
              ["--cbl-delay" as string]: `${spec.delay}s`,
              ["--cbl-dx" as string]: `${spec.drift}px`,
            } as React.CSSProperties
          }
        >
          <span />
        </div>
      ))}

      <div ref={glowRef} className="cbl-amb-glow" />
    </div>
  );
}

export default AmbientBackground;
