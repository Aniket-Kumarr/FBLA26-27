"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

/**
 * Thin glowing route line between dashboard sections — the same idea as the GPS's own
 * route-drawing animation, used here to connect one section to the next as you scroll.
 * Pure SVG `pathLength`; aria-hidden, purely decorative.
 */
export default function RouteDivider({ reduceMotion }: { reduceMotion: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const drawn = reduceMotion || inView;

  return (
    <div ref={ref} aria-hidden="true" className="px-4 md:px-12">
      <svg viewBox="0 0 400 16" preserveAspectRatio="none" className="h-4 w-full overflow-visible">
        <defs>
          <linearGradient id="route-divider-grad" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#a5b4fc" stopOpacity="0" />
            <stop offset="0.5" stopColor="#5eead4" stopOpacity="0.9" />
            <stop offset="1" stopColor="#a5b4fc" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path
          d="M 0 8 Q 100 -2 200 8 T 400 8"
          fill="none"
          stroke="url(#route-divider-grad)"
          strokeWidth={2}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: drawn ? 1 : 0 }}
          transition={{ duration: reduceMotion ? 0 : 1, ease: "easeOut" }}
        />
      </svg>
    </div>
  );
}
