"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { animate, motion, useInView } from "framer-motion";
import { DASHBOARD_SECTIONS, SECTION_STYLE, type DashboardSection } from "@/lib/communityData";
import { sectionIcon } from "./sectionIcon";
import type { Club } from "@/app/dashboard/page";

/**
 * A donut chart of the dashboard's real categories: one ring, five arcs sized by how many
 * listings are actually in each category, with the real total counting up in the middle.
 *
 * Performance: one SVG, five `<circle>` arcs using stroke-dasharray/rotation (the standard
 * CSS donut-chart technique) — no charting library. The draw-in and count-up only run once,
 * the first time the ring scrolls into view (`useInView`, `once: true`).
 *
 * Accessibility: each arc is paired with an invisible, full-size `<button>` wedge isn't
 * feasible for a ring, so instead every category also has a normal labelled button in the
 * legend below the ring — that button is the real, keyboard-reachable way to filter by
 * category; the ring itself is `aria-hidden` and purely illustrative. Reduced motion shows
 * the finished ring and final count immediately. High contrast swaps per-category hues for
 * a single bright ring color plus the text labels, which already meet contrast on their own.
 */

const R = 80;
const CIRC = 2 * Math.PI * R;
const GAP = 6; // degrees of visual gap between arcs

type Props = {
  clubs: Club[];
  activeSection: DashboardSection | null;
  onSelectSection: (section: DashboardSection | null) => void;
  reduceMotion: boolean;
  highContrast: boolean;
};

export default function CategoryRings({ clubs, activeSection, onSelectSection, reduceMotion, highContrast }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const grown = reduceMotion || inView;
  const [count, setCount] = useState(reduceMotion ? clubs.length : 0);

  const counts = useMemo(() => {
    const map = new Map<DashboardSection, number>();
    DASHBOARD_SECTIONS.forEach((s) => map.set(s, 0));
    clubs.forEach((c) => {
      const key = DASHBOARD_SECTIONS.includes(c.category as DashboardSection) ? (c.category as DashboardSection) : "Other";
      map.set(key, map.get(key)! + 1);
    });
    return map;
  }, [clubs]);

  const total = clubs.length || 1;

  useEffect(() => {
    if (!grown) return;
    const controls = animate(0, clubs.length, { duration: reduceMotion ? 0 : 1.4, ease: "easeOut", onUpdate: (v) => setCount(Math.round(v)) });
    return () => controls.stop();
  }, [grown, clubs.length, reduceMotion]);

  let cumulative = 0;

  return (
    <div ref={ref} className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-center sm:gap-12">
      <div className="relative h-56 w-56 shrink-0">
        <svg viewBox="0 0 220 220" aria-hidden="true" className="h-full w-full -rotate-90">
          <circle cx={110} cy={110} r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={18} />
          {DASHBOARD_SECTIONS.map((section, i) => {
            const n = counts.get(section)!;
            const fraction = n / total;
            const gapLength = (GAP / 360) * CIRC;
            const arcLength = Math.max(0, fraction * CIRC - gapLength);
            const offset = (cumulative / CIRC) * CIRC;
            cumulative += fraction * CIRC;
            const style = SECTION_STYLE[section];
            const dimmed = activeSection !== null && activeSection !== section;
            return (
              <motion.circle
                key={section}
                cx={110}
                cy={110}
                r={R}
                fill="none"
                stroke={highContrast ? "#ffffff" : style.hex}
                strokeWidth={18}
                strokeLinecap="round"
                strokeDasharray={`${arcLength} ${CIRC - arcLength}`}
                style={{ rotate: `${(offset / CIRC) * 360}deg`, transformOrigin: "110px 110px", opacity: dimmed ? 0.25 : 1 }}
                className="cursor-pointer transition-opacity duration-300"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: grown ? 1 : 0 }}
                transition={{ duration: reduceMotion ? 0 : 1, delay: reduceMotion ? 0 : i * 0.12, ease: "easeOut" }}
                onClick={() => onSelectSection(activeSection === section ? null : section)}
              />
            );
          })}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-extrabold text-white" style={{ fontFamily: "Nunito, sans-serif" }}>
            {count}
          </span>
          <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">listed</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-1">
        {DASHBOARD_SECTIONS.map((section) => {
          const n = counts.get(section)!;
          const style = SECTION_STYLE[section];
          const Icon = sectionIcon(section);
          const on = activeSection === section;
          return (
            <button
              key={section}
              type="button"
              aria-pressed={on}
              onClick={() => onSelectSection(on ? null : section)}
              className={`flex items-center gap-2.5 rounded-xl border px-3 py-2 text-left text-sm font-semibold transition-colors ${on ? "border-white bg-white text-black" : `${style.chip} hover:border-white/50`}`}
            >
              <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
              <span className="flex-1">{section}</span>
              <span className="text-xs opacity-80">{n}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
