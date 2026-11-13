"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { useA11y } from "@/components/a11y/A11yProvider";

/**
 * How the hub manages resources, as a journey: a road laid out in 3D with one stop per
 * step. As the visitor scrolls, the route is drawn, a marker drives along it, and each stop
 * (and its card underneath) lights up when the marker reaches it — Collect, Organize,
 * Discover, Connect, in order.
 *
 * One tilted plane with an SVG road on it; the stop markers stand upright on the plane.
 * Only transforms, opacity and one stroke length change while scrolling (no WebGL).
 * The road is decoration: the steps themselves are an ordinary ordered list. With "Reduce
 * motion" on, the whole route is shown complete.
 */

type Step = { title: string; body: string; Icon: React.ComponentType<{ className?: string }> };

const ROAD = "M 40 330 C 200 330, 220 120, 380 150 S 560 340, 700 250 S 880 60, 960 90";
const VIEW = { w: 1000, h: 400 };
const TILT = 58;
/** How far along the road each stop sits (0–1). */
const STOP_AT = [0.04, 0.36, 0.68, 0.98];

export default function RouteSteps({ steps }: { steps: Step[] }) {
  const { prefs } = useA11y();
  const ref = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.8", "end 0.6"] });
  const complete = useMotionValue(1);
  const p = prefs.reduceMotion ? complete : scrollYProgress;

  const [stops, setStops] = useState<{ x: number; y: number }[]>([]);
  const [reached, setReached] = useState(prefs.reduceMotion ? steps.length - 1 : -1);
  const markerX = useMotionValue("4%");
  const markerY = useMotionValue("82%");
  const drawn = useTransform(p, [0, 1], [0, 1]);

  const place = (v: number) => {
    const path = pathRef.current;
    if (!path) return;
    const pt = path.getPointAtLength(path.getTotalLength() * Math.min(1, Math.max(0, v)));
    markerX.set(`${(pt.x / VIEW.w) * 100}%`);
    markerY.set(`${(pt.y / VIEW.h) * 100}%`);
    // light up every stop the marker has passed (state only changes when a new stop is reached)
    let idx = -1;
    STOP_AT.forEach((at, i) => {
      if (v >= at - 0.02) idx = i;
    });
    setReached((r) => (r === idx ? r : idx));
  };

  // work out where the stops are on the road once it has been drawn
  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const len = path.getTotalLength();
    setStops(
      STOP_AT.map((at) => {
        const pt = path.getPointAtLength(len * at);
        return { x: (pt.x / VIEW.w) * 100, y: (pt.y / VIEW.h) * 100 };
      })
    );
    place(p.get());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefs.reduceMotion]);

  useMotionValueEvent(p, "change", place);

  const upright = { transform: `translate(-50%, -100%) rotateX(-${TILT}deg)`, transformOrigin: "50% 100%" } as const;

  return (
    <div ref={ref}>
      {/* the road */}
      <div aria-hidden="true" className="relative mx-auto mb-10 hidden h-[300px] max-w-5xl [perspective:1100px] sm:block">
        <div className="absolute inset-x-0 top-[-22%] h-[125%]" style={{ transform: `rotateX(${TILT}deg)`, transformStyle: "preserve-3d" }}>
          <svg viewBox={`0 0 ${VIEW.w} ${VIEW.h}`} className="absolute inset-0 h-full w-full overflow-visible" preserveAspectRatio="none">
            <defs>
              <linearGradient id="route-progress" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0" stopColor="#a5b4fc" />
                <stop offset="1" stopColor="#5eead4" />
              </linearGradient>
            </defs>
            <path d={ROAD} fill="none" stroke="#1c2036" strokeWidth="46" strokeLinecap="round" />
            <path d={ROAD} fill="none" stroke="#343a5c" strokeWidth="2" strokeDasharray="14 16" />
            <motion.path ref={pathRef} d={ROAD} fill="none" stroke="url(#route-progress)" strokeWidth="10" strokeLinecap="round" style={{ pathLength: drawn }} />
          </svg>

          {/* stops, standing upright on the road */}
          {stops.map((s, i) => {
            const on = i <= reached;
            return (
              <div key={i} className="absolute" style={{ left: `${s.x}%`, top: `${s.y}%`, ...upright }}>
                <div className={`flex flex-col items-center transition-all duration-500 ${on ? "scale-110 opacity-100" : "scale-90 opacity-50"}`}>
                  <span
                    className={`whitespace-nowrap rounded-full border px-3 py-1 text-sm font-extrabold transition-colors duration-500 ${
                      on ? "border-white bg-white text-black shadow-[0_0_30px_-4px_rgba(165,180,252,0.9)]" : "border-white/25 bg-black text-gray-300"
                    }`}
                  >
                    {i + 1}. {steps[i]?.title}
                  </span>
                  <span className={`h-10 w-0.5 transition-colors duration-500 ${on ? "bg-white" : "bg-white/30"}`} />
                  <span className={`h-2.5 w-2.5 rounded-full transition-colors duration-500 ${on ? "bg-teal-300" : "bg-white/40"}`} />
                </div>
              </div>
            );
          })}

          {/* the traveller */}
          <motion.div className="absolute" style={{ left: markerX, top: markerY, transformStyle: "preserve-3d" }}>
            <div style={upright}>
              <span className="block h-5 w-5 rounded-full border-2 border-white bg-teal-300 shadow-[0_0_24px_6px_rgba(94,234,212,0.7)]" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* the steps themselves */}
      <ol className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, i) => {
          const Icon = step.Icon;
          const on = i <= reached;
          return (
            <li
              key={step.title}
              className={`relative rounded-3xl border p-7 transition-colors duration-500 ${on ? "border-white/35 bg-white/[0.07]" : "border-white/10 bg-white/[0.03]"}`}
            >
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-gradient-to-br from-white/15 to-white/[0.02]">
                  <Icon aria-hidden="true" className={`h-6 w-6 transition-colors duration-500 ${on ? "text-teal-300" : "text-indigo-300"}`} />
                </span>
                <span className="text-sm font-bold uppercase tracking-[0.2em] text-gray-300">Step {i + 1}</span>
              </div>
              <h4 className="mb-2 text-2xl font-bold text-white">{step.title}</h4>
              <p className="leading-relaxed text-gray-300">{step.body}</p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
