"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { animate, motion, useInView } from "framer-motion";
import { HiChatAlt2, HiMap, HiViewGrid } from "react-icons/hi";
import Magnetic from "@/components/fx/Magnetic";
import Marquee from "@/components/fx/Marquee";
import { DASHBOARD_SECTIONS, SECTION_STYLE, type DashboardSection } from "@/lib/communityData";
import type { Club } from "@/app/dashboard/page";

const EASE = [0.22, 1, 0.36, 1] as const;

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Good night";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

/** Count-up span; animates once, from 0 to `to`. */
function Count({ to, reduceMotion }: { to: number; reduceMotion: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20px" });
  const [val, setVal] = useState(reduceMotion ? to : 0);
  useEffect(() => {
    if (!inView || reduceMotion) return;
    const controls = animate(0, to, { duration: 0.9, ease: EASE, onUpdate: (v) => setVal(Math.round(v)) });
    return () => controls.stop();
  }, [inView, to, reduceMotion]);
  return <span ref={ref}>{val}</span>;
}

type Props = {
  clubs: Club[];
  loading: boolean;
  reduceMotion: boolean;
  onOpenMap: () => void;
  onBrowseCategories: () => void;
};

export default function DashboardHero({ clubs, loading, reduceMotion, onOpenMap, onBrowseCategories }: Props) {
  const { data: session } = useSession();
  const firstName = session?.user?.name?.trim().split(/\s+/)[0];

  const counts = DASHBOARD_SECTIONS.map((section) => ({
    section,
    n: clubs.filter((c) => (DASHBOARD_SECTIONS.includes(c.category as DashboardSection) ? c.category : "Other") === section).length,
  }));
  const busiest = counts.reduce((a, b) => (b.n > a.n ? b : a), counts[0]);

  const tickerItems = clubs.map((c) => {
    const key = DASHBOARD_SECTIONS.includes(c.category as DashboardSection) ? (c.category as DashboardSection) : "Other";
    return { label: c.name, color: SECTION_STYLE[key].hex };
  });

  const openAssistant = () => {
    document.getElementById("clt-chatbot-trigger")?.click();
  };

  return (
    <section className="mb-12">
      <motion.p className="mb-6 text-lg text-gray-300" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }}>
        {greeting()}
        {firstName ? (
          <>
            , <span className="text-shimmer font-semibold">{firstName}</span>
          </>
        ) : (
          "!"
        )}
      </motion.p>

      {/* real-data stat chips */}
      {!loading && clubs.length > 0 && (
        <motion.div
          className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
        >
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="text-3xl font-extrabold text-white" style={{ fontFamily: "Nunito, sans-serif" }}>
              <Count to={clubs.length} reduceMotion={reduceMotion} />
            </div>
            <p className="text-xs text-gray-400">Listings on the hub</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="text-3xl font-extrabold text-white" style={{ fontFamily: "Nunito, sans-serif" }}>
              <Count to={DASHBOARD_SECTIONS.length} reduceMotion={reduceMotion} />
            </div>
            <p className="text-xs text-gray-400">Categories to browse</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="text-3xl font-extrabold" style={{ fontFamily: "Nunito, sans-serif", color: SECTION_STYLE[busiest.section].hex }}>
              <Count to={busiest.n} reduceMotion={reduceMotion} />
            </div>
            <p className="text-xs text-gray-400">In {busiest.section}, the busiest category</p>
          </div>
        </motion.div>
      )}

      {/* real listing names, color-coded, ticking by */}
      {!loading && tickerItems.length > 0 && (
        <motion.div className="mt-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.2 }}>
          <Marquee items={tickerItems} duration={65} paused={reduceMotion} />
        </motion.div>
      )}

      <motion.div
        className="mt-8 flex flex-col gap-3 sm:flex-row"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3, ease: EASE }}
      >
        <Magnetic>
          <button type="button" onClick={onOpenMap} className="btn-primary group w-full px-6 py-3 text-base sm:w-auto">
            <HiMap aria-hidden="true" className="relative z-10 h-5 w-5" />
            <span className="relative z-10">Open the map</span>
            <span aria-hidden className="btn-sheen" />
          </button>
        </Magnetic>
        <Magnetic>
          <button type="button" onClick={openAssistant} className="btn-glass w-full px-6 py-3 text-base sm:w-auto">
            <HiChatAlt2 aria-hidden="true" className="h-5 w-5" />
            Ask the assistant
          </button>
        </Magnetic>
        <Magnetic>
          <button type="button" onClick={onBrowseCategories} className="btn-glass w-full px-6 py-3 text-base sm:w-auto">
            <HiViewGrid aria-hidden="true" className="h-5 w-5" />
            Browse categories
          </button>
        </Magnetic>
      </motion.div>
    </section>
  );
}
