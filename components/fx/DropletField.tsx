"use client";

import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * Glass droplets that stay with the visitor.
 *
 * A layer pinned to the screen (position: fixed) holding big, clear droplets (pure CSS, see
 * `.droplet` in globals.css), spread mostly around the edges so the middle stays readable.
 * It sits *behind* the page content: the night sections (hero, GPS map, closing card, footer)
 * cover it, so the droplets appear as you scroll out of the dark hero into the light page, and
 * never sit on top of text or buttons.
 *
 * Motion:
 * - As you scroll, every droplet floats upward at its own speed. Bigger ones are "closer", so they
 *   move faster (parallax depth). When one leaves the top of the screen it comes back in from the
 *   bottom, so the droplets are always with you.
 * - Each droplet sways gently from side to side as it rises (moving in arcs) and also bobs and
 *   wobbles slowly on its own (squash & stretch), at its own pace.
 * - Only transform animates, so scrolling stays smooth.
 *
 * Reduced motion: the droplets stay where they are.
 */

type Drop = {
  x: number; // % of screen width
  y: number; // % of screen height at the top of the page
  size: number; // px
  speed: number; // how fast it rises compared with scrolling
  sway: number; // px side to side
  delay: number; // s, so the bobbing is out of step
  dur: number; // s, one bob
  desktopOnly?: boolean; // keep phones uncluttered
};

// arranged like the reference: big ones hugging the edges, small ones scattered between
const DROPS: Drop[] = [
  { x: 4, y: 18, size: 150, speed: 0.55, sway: 18, delay: -1.2, dur: 8 },
  { x: 14, y: 62, size: 58, speed: 0.3, sway: 10, delay: -3.5, dur: 6.5 },
  { x: 8, y: 92, size: 96, speed: 0.42, sway: 14, delay: -0.4, dur: 8, desktopOnly: true },
  { x: 24, y: 36, size: 34, speed: 0.2, sway: 8, delay: -2.1, dur: 6 },
  { x: 30, y: 80, size: 70, speed: 0.36, sway: 12, delay: -4.4, dur: 7.5, desktopOnly: true },
  { x: 47, y: 8, size: 42, speed: 0.24, sway: 9, delay: -1.8, dur: 6.5, desktopOnly: true },
  { x: 55, y: 70, size: 52, speed: 0.28, sway: 10, delay: -5.2, dur: 6.5, desktopOnly: true },
  { x: 72, y: 88, size: 120, speed: 0.5, sway: 16, delay: -2.7, dur: 9, desktopOnly: true },
  { x: 80, y: 14, size: 110, speed: 0.46, sway: 15, delay: -0.9, dur: 8.5 },
  { x: 88, y: 26, size: 64, speed: 0.32, sway: 11, delay: -3.1, dur: 7 },
  { x: 96, y: 54, size: 84, speed: 0.4, sway: 13, delay: -4.8, dur: 7.5 },
  { x: 86, y: 74, size: 40, speed: 0.22, sway: 8, delay: -2.4, dur: 6 },
  { x: 64, y: 40, size: 30, speed: 0.18, sway: 7, delay: -1.1, dur: 5.5, desktopOnly: true },
  { x: 38, y: 52, size: 26, speed: 0.16, sway: 6, delay: -3.9, dur: 5, desktopOnly: true },
];

function Droplet({ d, scrollY, viewH, still }: { d: Drop; scrollY: MotionValue<number>; viewH: number; still: boolean }) {
  const span = viewH + d.size * 2; // distance before it wraps back to the bottom
  const start = (d.y / 100) * viewH;

  // rise with scrolling, wrapping around so the droplet is always on screen somewhere
  const y = useTransform(scrollY, (s) => {
    const raw = start - s * d.speed + d.size; // + size so it fully leaves before wrapping
    return (((raw % span) + span) % span) - d.size;
  });
  // gentle arc side to side as it rises
  const x = useTransform(scrollY, (s) => Math.sin((s * d.speed) / 220 + d.delay) * d.sway);

  return (
    <motion.div
      className={`absolute left-0 top-0 ${d.desktopOnly ? "hidden md:block" : ""}`}
      style={{ left: `${d.x}%`, y: still ? start : y, x: still ? 0 : x }}
    >
      {/* centre the droplet on its x position (separate element so it doesn't clash with the sway) */}
      <div className="-translate-x-1/2">
        <div
          className={`droplet ${still ? "" : "animate-droplet-bob"}`}
          style={{ width: d.size, height: d.size, fontSize: d.size, animationDelay: `${d.delay}s`, animationDuration: `${d.dur}s` }}
        />
      </div>
    </motion.div>
  );
}

export default function DropletField({ reduceMotion = false }: { reduceMotion?: boolean }) {
  const { scrollY } = useScroll();
  const [viewH, setViewH] = useState(900);

  useEffect(() => {
    const update = () => setViewH(window.innerHeight);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {DROPS.map((d, i) => (
        <Droplet key={i} d={d} scrollY={scrollY} viewH={viewH} still={reduceMotion} />
      ))}
    </div>
  );
}
