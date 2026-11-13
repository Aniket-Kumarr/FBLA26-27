"use client";

import { useEffect, useRef, useState } from "react";
import Gps, { preloadMap } from "./Gps";
import { useListings } from "@/lib/useListings";

/**
 * Home page: "A GPS for Charlotte's community".
 * The listings (and the map code) are requested only when this section is close to the
 * screen, so visitors who never scroll this far download nothing extra.
 */
export default function GpsSection() {
  const ref = useRef<HTMLElement>(null);
  const [near, setNear] = useState(false);
  const { listings, status } = useListings(near);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setNear(true);
        preloadMap();
        io.disconnect();
      },
      { rootMargin: "300px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} id="map" aria-labelledby="map-heading" className="relative z-10 scroll-mt-24 overflow-hidden px-4 py-28 md:px-12">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-[30rem] w-[60rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-400/[0.07] blur-[140px]" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-gray-300">
            Find your way
          </span>
          <h2 id="map-heading" className="mt-6 text-4xl font-extrabold tracking-tight text-white md:text-6xl" style={{ fontFamily: "Nunito, sans-serif" }}>
            A GPS for Charlotte&apos;s <span className="text-shimmer">community</span>
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-gray-300 md:text-xl">
            You would not drive across the city without directions. Finding a club, a tutor or a place to volunteer should work the same way: say
            what you are looking for, and see where it is.
          </p>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-gray-300">
            Press the screen on the GPS to pull the map out and see every listing on the hub.
          </p>
        </div>

        <Gps listings={listings} status={status} />
      </div>
    </section>
  );
}
