"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { HiArrowRight } from "react-icons/hi";
import { CONNECTED_ORGS, FALLING_NONPROFITS } from "@/lib/communityTree";

const CommunityTree = dynamic(() => import("@/components/three/CommunityTree"), { ssr: false });

/**
 * Half the canopy is every business on the hub, joined together.
 * The other half is empty. A falling leaf is one non-profit, named the
 * same way the staircase names one step.
 */
export default function CommunityTreeSection() {
  const ref = useRef<HTMLElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setNear(true);
        io.disconnect();
      },
      { rootMargin: "280px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} id="community-tree" aria-labelledby="tree-heading" className="relative z-10 scroll-mt-24 overflow-hidden px-4 py-28 md:px-12">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/3 h-[32rem] w-[56rem] -translate-x-1/2 rounded-full bg-rose-300/10 blur-[140px]" />

      <div className="relative mx-auto mb-14 max-w-4xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-gray-300">
          One canopy
        </span>
        <h2 id="tree-heading" className="mt-6 text-4xl font-extrabold tracking-tight text-white md:text-6xl" style={{ fontFamily: "Nunito, sans-serif" }}>
          Connected on one side. <span className="text-shimmer">Empty on the other.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-400 md:text-xl">
          The full half is every club, business, and non-profit on CLT CommunityHub, linked to each other. The bare half is Charlotte that still is not on the hub. When a leaf falls, it is one non-profit — the same way the staircase names one step at a time.
        </p>
      </div>

      <div className="relative mx-auto grid max-w-7xl items-stretch gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="relative min-h-[26rem] overflow-hidden rounded-[2rem] border border-white/10 bg-black md:min-h-[34rem]">
          {near ? <CommunityTree className="absolute inset-0" /> : <div className="flex h-full min-h-[26rem] items-center justify-center text-sm text-gray-500">Loading tree…</div>}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-between bg-gradient-to-t from-black via-black/70 to-transparent p-5 text-xs font-semibold uppercase tracking-[0.18em] text-gray-300 md:p-6">
            <span className="text-teal-200">Linked together</span>
            <span className="text-gray-500">Not on the hub yet</span>
          </div>
        </div>

        <div className="flex flex-col rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-400">A falling leaf</p>
          <h3 className="mt-3 text-2xl font-extrabold text-white" style={{ fontFamily: "Nunito, sans-serif" }}>
            One non-profit at a time
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-gray-400">
            {FALLING_NONPROFITS.length} non-profits take turns leaving the canopy so you can see a single organization. The other {CONNECTED_ORGS.length - FALLING_NONPROFITS.length} listings stay woven into the same side.
          </p>
          <ul className="mt-6 space-y-2">
            {FALLING_NONPROFITS.map((o) => (
              <li key={o.name} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/20 px-3.5 py-3">
                <span aria-hidden className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: o.color }} />
                <div>
                  <p className="text-sm font-semibold text-white">{o.name}</p>
                  <p className="mt-0.5 text-xs text-gray-500">{o.blurb}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-auto flex flex-wrap gap-3 pt-8">
            <Link href="/get-started" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-black transition hover:bg-teal-200">
              Add your org
              <HiArrowRight aria-hidden className="h-4 w-4" />
            </Link>
            <Link href="#explore" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-white/40">
              Browse listings
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
