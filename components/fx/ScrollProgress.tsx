"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/** Thin gradient bar at the very top showing page scroll progress. */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-gradient-to-r from-white via-indigo-300 to-teal-300"
      style={{ scaleX }}
    />
  );
}
