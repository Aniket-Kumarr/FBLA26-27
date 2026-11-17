"use client";

import { useMemo, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const SKY =
  "linear-gradient(to bottom, #0b1020 0%, #161a3a 8%, #2a2350 16%, #4a3360 25%, #6f4767 34%, #925b6e 43%, #b57475 52%, #d29182 61%, #e8b195 70%, #f4cdb2 79%, #f9e4d2 88%, #fbf2e8 95%, #fbf7f1 100%)";

const W = 1440;
const G = 420;

type Tower = { x: number; w: number; top: number; d?: string };

/** Uptown Charlotte, stylized. `d` overrides the plain box for towers with a recognisable crown. */
const TOWERS: Tower[] = [
  { x: 120, w: 50, top: 292 },
  { x: 176, w: 66, top: 252 },
  { x: 250, w: 46, top: 300 },
  { x: 300, w: 58, top: 262 },
  { x: 362, w: 40, top: 316 },
  // Carillon: pyramid peak
  { x: 410, w: 52, top: 214, d: "M410 420V214L436 172L462 214V420Z" },
  { x: 468, w: 44, top: 270 },
  // Hearst Tower: flared crown
  { x: 520, w: 62, top: 160, d: "M526 420V176L520 160H582L576 176V420Z" },
  { x: 590, w: 48, top: 248 },
  { x: 644, w: 50, top: 226 },
  // Bank of America Corporate Center: stepped body under a crown of rods
  { x: 700, w: 76, top: 132, d: "M700 420V132L710 120V104L720 96H756L766 104V120L776 132V420Z" },
  { x: 784, w: 44, top: 238 },
  // Duke Energy Center: sloped roof
  { x: 836, w: 84, top: 156, d: "M836 420V186L920 156V420Z" },
  { x: 928, w: 56, top: 214 },
  // 300 South Tryon: notched top
  { x: 990, w: 60, top: 196, d: "M990 420V208L1002 196H1038L1050 208V420Z" },
  { x: 1056, w: 42, top: 276 },
  { x: 1104, w: 64, top: 244 },
  { x: 1174, w: 40, top: 300 },
  { x: 1220, w: 58, top: 258 },
  { x: 1284, w: 46, top: 298 },
];

/** BofA crown rods, tallest in the middle. */
const RODS = [0, 1, 2, 3, 4, 5].map((i) => {
  const x = 724 + i * 6;
  const h = 18 + (i < 3 ? i : 5 - i) * 8;
  return { x, y: 96 - h, h };
});

function hash(n: number) {
  const s = Math.sin(n * 127.1) * 43758.5453;
  return s - Math.floor(s);
}

/** Low, hazy blocks behind the towers for depth. */
const BACKDROP = (() => {
  let d = "";
  for (let x = 0, i = 0; x < W; i++) {
    const w = 30 + Math.floor(hash(i + 3) * 50);
    const top = G - (60 + Math.floor(hash(i + 11) * 110));
    d += `M${x} ${G}V${top}H${x + w}V${G}Z`;
    x += w + 4;
  }
  return d;
})();

export default function NightToDay({ reduceMotion = false }: { reduceMotion?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const glowY = useTransform(scrollYProgress, [0, 1], ["25%", "-15%"]);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 0.9, 0.5]);
  const sunY = useTransform(scrollYProgress, [0.15, 0.8], [470, 120]);
  const sunGlow = useTransform(scrollYProgress, [0.15, 0.8], [0.2, 0.9]);
  const lightsOn = useTransform(scrollYProgress, [0.3, 0.75], [1, 0]);

  const windows = useMemo(() => {
    const out: { x: number; y: number }[] = [];
    TOWERS.forEach((t, ti) => {
      for (let y = t.top + 16; y < G - 40; y += 14) {
        for (let x = t.x + 8; x < t.x + t.w - 8; x += 10) {
          if (hash(ti * 1000 + x * 7 + y) > 0.62) out.push({ x, y });
        }
      }
    });
    return out;
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none relative -mt-px h-[34rem] overflow-hidden md:h-[48rem]"
      style={{ background: SKY }}
    >
      <div
        className="absolute inset-0"
        style={{
          maskImage: "linear-gradient(to bottom, transparent 0%, black 35%, black 65%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 35%, black 65%, transparent 100%)",
        }}
      >
        <motion.div
          className="absolute left-1/2 top-[38%] h-[24rem] w-[120%] -translate-x-1/2 rounded-[50%] blur-[100px]"
          style={{
            background: "radial-gradient(closest-side, rgba(255, 190, 140, 0.6), rgba(255, 170, 130, 0.2) 60%, transparent)",
            y: reduceMotion ? "5%" : glowY,
            opacity: reduceMotion ? 0.7 : glowOpacity,
          }}
        />
      </div>

      <svg
        viewBox={`0 0 ${W} ${G}`}
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-x-0 bottom-0 h-[48%] w-full overflow-visible"
      >
        <defs>
          <radialGradient id="ntd-sun">
            <stop offset="0%" stopColor="#fff8e7" />
            <stop offset="55%" stopColor="#ffe0b0" />
            <stop offset="100%" stopColor="#ffb98a" />
          </radialGradient>
          <radialGradient id="ntd-sun-glow">
            <stop offset="0%" stopColor="#ffd3a0" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ffb98a" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="ntd-city" x1="0" y1="60" x2="0" y2={G} gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2a2148" />
            <stop offset="45%" stopColor="#4a3560" />
            <stop offset="75%" stopColor="#a7798a" />
            <stop offset="100%" stopColor="#fbf7f1" />
          </linearGradient>
          <linearGradient id="ntd-haze" x1="0" y1="250" x2="0" y2={G} gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#8a5f78" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#fbf7f1" stopOpacity="1" />
          </linearGradient>
        </defs>

        <motion.circle cx={1010} r={210} fill="url(#ntd-sun-glow)" cy={reduceMotion ? 260 : sunY} style={{ opacity: reduceMotion ? 0.6 : sunGlow }} />
        <motion.circle cx={1010} r={62} fill="url(#ntd-sun)" cy={reduceMotion ? 260 : sunY} />

        <path d={BACKDROP} fill="url(#ntd-haze)" />

        <g fill="url(#ntd-city)">
          {TOWERS.map((t) => (
            <path key={t.x} d={t.d ?? `M${t.x} ${G}V${t.top}H${t.x + t.w}V${G}Z`} />
          ))}
          {RODS.map((r) => (
            <rect key={r.x} x={r.x} y={r.y} width={3} height={r.h} rx={1} />
          ))}
        </g>

        <motion.g fill="#ffd89a" style={{ opacity: reduceMotion ? 0.5 : lightsOn }}>
          {windows.map((w) => (
            <rect key={`${w.x}-${w.y}`} x={w.x} y={w.y} width={4} height={6} rx={0.5} />
          ))}
        </motion.g>
      </svg>

      <div
        className="grain absolute inset-0"
        style={{
          maskImage: "linear-gradient(to bottom, black 60%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 60%, transparent 100%)",
        }}
      />
    </div>
  );
}
