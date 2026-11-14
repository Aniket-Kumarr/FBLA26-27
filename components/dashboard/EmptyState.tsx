"use client";

import { motion } from "framer-motion";
import { HiLocationMarker } from "react-icons/hi";

/**
 * Shown instead of a plain "no results" line when a search matches nothing: a little GPS
 * signpost that shakes once ("no route found") with a couple of real suggestions. Reduced
 * motion drops the shake and just shows the message.
 */
export default function EmptyState({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <div className="py-12 text-center">
      <motion.div
        className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-white/15 bg-white/[0.03]"
        initial={{ rotate: 0 }}
        animate={reduceMotion ? {} : { rotate: [0, -8, 8, -6, 6, 0] }}
        transition={{ duration: 0.6, delay: 0.15 }}
      >
        <HiLocationMarker aria-hidden="true" className="h-9 w-9 text-gray-400" />
        <span aria-hidden className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-rose-400 text-xs font-extrabold text-black">
          !
        </span>
      </motion.div>
      <p className="mb-2 text-lg font-semibold text-white" role="status">
        No route found
      </p>
      <p className="mx-auto max-w-sm text-sm text-gray-300">Try a shorter word, a category such as &quot;STEM&quot;, or a neighborhood name.</p>
    </div>
  );
}
