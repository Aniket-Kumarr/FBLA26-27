"use client";

import { motion } from "framer-motion";

type Props = {
  children: React.ReactNode;
  index: number;
  reduceMotion: boolean;
};

/** Premium wrapper for the Spotlight section's featured listings: a slowly rotating
 *  conic-gradient border (CSS `@property`, not mouse-tracked), a gentle float, and a
 *  shimmering "Featured" badge. High contrast swaps the rotating border for a plain
 *  solid-white one (see globals.css) so nothing glows over the text. */
export default function SpotlightCard({ children, index, reduceMotion }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className={reduceMotion ? "" : "animate-float"}
      style={reduceMotion ? undefined : { animationDelay: `${index * 0.5}s` }}
    >
      <div className="spotlight-border rounded-2xl p-[2px]">
        <div className="rounded-[14px] bg-black p-6 w-full">{children}</div>
      </div>
    </motion.div>
  );
}
