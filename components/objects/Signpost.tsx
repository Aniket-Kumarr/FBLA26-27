"use client";

import { useRef } from "react";
import { motion, useMotionValue, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useA11y } from "@/components/a11y/A11yProvider";
import { KINDS, KIND_ORDER } from "@/lib/communityData";

/**
 * The problem, as an object: a street signpost whose signs point in four different
 * directions — the four places people currently have to look. As the visitor scrolls, each
 * sign swings around the pole until they all point the same way, relabelled as the four
 * kinds of resource, under a single "CLT CommunityHub" sign.
 *
 * Built from plain elements with CSS 3D transforms (no WebGL); only transforms and opacity
 * change while scrolling. Decorative for assistive technology: a text description sits
 * beside it. With "Reduce motion" on it is shown already sorted.
 */

/** Where people look today (from the problem statement), and the way each sign starts out pointing. */
const SIGNS = [
  { before: "Social media", ry: 34, rz: -5 },
  { before: "Their own websites", ry: 205, rz: 4 },
  { before: "Paper flyers", ry: -52, rz: 6 },
  { before: "Group chats", ry: 158, rz: -6 },
];

const AIMED = -14; // every sign ends up pointing this way

function Face({ back, before, after, color, swap }: { back?: boolean; before: string; after: string; color: string; swap: MotionValue<number> }) {
  const beforeOpacity = useTransform(swap, (v) => 1 - v);
  return (
    <span className={`sign-face ${back ? "sign-face-back" : ""} bg-zinc-700`}>
      <motion.span className="absolute inset-0" style={{ background: color, opacity: swap }} />
      <motion.span className="relative whitespace-nowrap text-sm font-bold text-gray-100 sm:text-base" style={{ opacity: beforeOpacity }}>
        {before}
      </motion.span>
      <motion.span className={`absolute whitespace-nowrap text-sm font-extrabold text-black sm:text-base ${back ? "right-[1.1rem]" : "left-[1.1rem]"}`} style={{ opacity: swap }}>
        {after}
      </motion.span>
    </span>
  );
}

function Sign({ i, p }: { i: number; p: MotionValue<number> }) {
  const sign = SIGNS[i];
  const kind = KINDS[KIND_ORDER[i]];
  const start = 0.12 + i * 0.09;
  const rotateY = useTransform(p, [start, start + 0.45], [sign.ry, AIMED]);
  const rotateZ = useTransform(p, [start, start + 0.45], [sign.rz, 0]);
  const swap = useTransform(p, [start + 0.3, start + 0.5], [0, 1]);
  return (
    <motion.div
      className="absolute left-1/2 h-11 w-[min(46vw,230px)] sm:h-12"
      style={{ top: `${22 + i * 17}%`, rotateY, rotateZ, transformOrigin: "0% 50%", transformStyle: "preserve-3d" }}
    >
      <Face before={sign.before} after={kind.plural} color={kind.hex} swap={swap} />
      <Face back before={sign.before} after={kind.plural} color={kind.hex} swap={swap} />
    </motion.div>
  );
}

export default function Signpost() {
  const { prefs } = useA11y();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.62", "start 0.12"] });
  const sorted = useMotionValue(1);
  const p = prefs.reduceMotion ? sorted : scrollYProgress;

  const topOpacity = useTransform(p, [0.7, 0.9], [0, 1]);
  const topScale = useTransform(p, [0.7, 0.9], [0.8, 1]);
  const beforeCaption = useTransform(p, [0.3, 0.5], [1, 0]);
  const afterCaption = useTransform(p, [0.7, 0.9], [0, 1]);

  return (
    <div ref={ref} className="relative mx-auto w-full max-w-md">
      <p className="sr-only">
        Illustration: a signpost with four signs pointing in different directions, labelled social media, their own websites, paper flyers and group
        chats. The signs turn to point the same way and become Clubs, Non-profits, Events and Services under one CLT CommunityHub sign.
      </p>

      <div aria-hidden="true" className="relative h-[400px] [perspective:1100px] sm:h-[440px]">
        <div className="absolute inset-0" style={{ transform: "rotateX(4deg)", transformStyle: "preserve-3d" }}>
          {/* pole + base */}
          <span className="absolute bottom-[6%] left-1/2 top-[4%] w-3 -translate-x-1/2 rounded-full bg-gradient-to-r from-zinc-500 via-zinc-200 to-zinc-600" />
          <span className="absolute bottom-[3%] left-1/2 h-5 w-32 -translate-x-1/2 rounded-[50%] bg-zinc-800" />
          <span className="absolute bottom-0 left-1/2 h-8 w-56 -translate-x-1/2 rounded-[50%] bg-indigo-400/20 blur-2xl" />

          {/* the one sign that replaces the confusion */}
          <motion.div
            className="absolute left-1/2 top-[4%] -translate-x-1/2 whitespace-nowrap rounded-xl border border-white/40 bg-white px-5 py-2.5 text-base font-extrabold text-black shadow-[0_0_40px_-6px_rgba(165,180,252,0.9)] sm:text-lg"
            style={{ opacity: topOpacity, scale: topScale }}
          >
            CLT CommunityHub
          </motion.div>

          {SIGNS.map((_, i) => (
            <Sign key={i} i={i} p={p} />
          ))}
        </div>
      </div>

      <div aria-hidden="true" className="relative mt-2 h-7 text-center text-sm font-semibold uppercase tracking-[0.2em]">
        <motion.p className="absolute inset-x-0 text-gray-300" style={{ opacity: beforeCaption }}>
          Today: four places to look
        </motion.p>
        <motion.p className="absolute inset-x-0 text-teal-200" style={{ opacity: afterCaption }}>
          With the hub: one direction
        </motion.p>
      </div>
    </div>
  );
}
