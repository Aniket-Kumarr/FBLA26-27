"use client";

import { AnimatePresence, motion, useScroll, useSpring, useTransform } from "framer-motion";
import { HiChevronUp } from "react-icons/hi";
import { useEffect, useState } from "react";

const R = 18;
const CIRC = 2 * Math.PI * R;

/** Floating "back to top" button with a ring that fills as you scroll down the page. */
export default function BackToTop({ reduceMotion }: { reduceMotion: boolean }) {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30 });
  const dashoffset = useTransform(progress, (v) => CIRC * (1 - v));
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" })}
          aria-label="Back to top"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.7 }}
          transition={{ duration: 0.25 }}
          className="fixed bottom-6 left-6 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-black/80 text-white backdrop-blur transition-colors hover:border-white/40 hover:bg-black"
        >
          <svg viewBox="0 0 40 40" className="absolute inset-0 h-full w-full -rotate-90">
            <circle cx={20} cy={20} r={R} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={2.5} />
            <motion.circle cx={20} cy={20} r={R} fill="none" stroke="#5eead4" strokeWidth={2.5} strokeLinecap="round" strokeDasharray={CIRC} style={{ strokeDashoffset: dashoffset }} />
          </svg>
          <HiChevronUp aria-hidden="true" className="relative h-5 w-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
