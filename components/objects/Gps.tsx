"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { HiArrowRight, HiCursorClick, HiSearch, HiX } from "react-icons/hi";
import { useA11y } from "@/components/a11y/A11yProvider";
import { useDialog } from "@/lib/useDialog";
import { KINDS, KIND_ORDER } from "@/lib/communityData";
import type { MapListing } from "@/lib/useListings";

/**
 * A 3D GPS unit that holds the site's map (used on the home page and on the dashboard).
 *
 * Story: finding a resource should work like asking a GPS for directions. The unit tilts
 * toward the pointer, its screen shows what it is searching for (or the chosen destination),
 * and pressing the screen pulls the map out of the device until it fills the page as a real,
 * pannable map of Charlotte with every listing on it.
 *
 * Performance: the unit is plain elements with CSS 3D transforms (no WebGL). The map library
 * is downloaded ahead of time but only set up after the panel has finished flying out, and
 * the drawing inside the flying panel holds still, so the fly-out stays at full frame rate.
 *
 * Accessibility: the screen is a real <button>; the map opens in a modal dialog with a focus
 * trap and Escape to close; every pin is also a button in a searchable list, so the map never
 * has to be operated with a mouse. With "Reduce motion" on, the unit holds still and the map
 * opens without the fly-out.
 */

// the real map (Leaflet) is only set up once the visitor opens it
const CharlotteMap = dynamic(() => import("./CharlotteMap"), {
  ssr: false,
  loading: () => <p className="absolute inset-x-0 bottom-4 text-center text-sm font-semibold text-gray-200">Loading the map…</p>,
});

/** Download the map code early so opening the map never waits on the network. */
export function preloadMap() {
  void import("./CharlotteMap");
}

/** Things people actually look for, taken from the listings on the hub. */
const SEARCHES = ["free tutoring", "coding clubs", "volunteering", "charity races", "mental wellness groups"];

const DEPTH_SLICES = 9; // stacked copies of the body that give the unit its thickness
const BASE_TILT = { x: 7, y: -17 };

/* ---------- the little map drawn on the device's screen ---------- */

/**
 * `moving` animates the dashed route. It is on for the small screen on the device and off
 * for the full-size copy that flies out: redrawing a full-screen drawing every frame while
 * it is also being scaled is what makes a pull-out stutter.
 */
function ScreenMap({ moving = false }: { moving?: boolean }) {
  const pins: { x: number; y: number; kind: (typeof KIND_ORDER)[number] }[] = [
    { x: 78, y: 62, kind: "club" },
    { x: 236, y: 48, kind: "nonprofit" },
    { x: 196, y: 150, kind: "service" },
    { x: 112, y: 138, kind: "event" },
  ];
  return (
    <svg viewBox="0 0 320 200" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="320" height="200" fill="#0b1020" />
      {/* blocks */}
      <g fill="#111935">
        <rect x="18" y="20" width="70" height="42" rx="4" />
        <rect x="104" y="14" width="56" height="34" rx="4" />
        <rect x="214" y="78" width="84" height="46" rx="4" />
        <rect x="26" y="112" width="60" height="60" rx="4" />
        <rect x="132" y="162" width="96" height="30" rx="4" />
      </g>
      {/* streets */}
      <g stroke="#27325a" strokeWidth="5" strokeLinecap="round" fill="none">
        <path d="M-10 78 H330" />
        <path d="M-10 150 Q150 120 330 168" />
        <path d="M96 -10 V210" />
        <path d="M206 -10 Q190 100 240 210" />
        <path d="M-10 20 L330 110" />
      </g>
      {/* the ring road around the center city */}
      <ellipse cx="160" cy="100" rx="58" ry="40" fill="none" stroke="#3a4a85" strokeWidth="4" />
      {/* route from "you" to a listing */}
      <path
        className={moving ? "gps-route" : undefined}
        d="M40 176 Q70 120 96 110 T160 100 T236 48"
        fill="none"
        stroke="#5eead4"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="7 9"
      />
      {pins.map((p) => (
        <g key={p.kind}>
          <circle cx={p.x} cy={p.y} r="9" fill={KINDS[p.kind].hex} opacity="0.25" />
          <circle cx={p.x} cy={p.y} r="4.5" fill={KINDS[p.kind].hex} stroke="#0b1020" strokeWidth="1.5" />
        </g>
      ))}
      {/* you are here */}
      <path d="M40 166 l8 18 -8 -5 -8 5 z" fill="#ffffff" />
      <text x="160" y="104" textAnchor="middle" fontSize="9" fontWeight="700" letterSpacing="3" fill="#8b93c9">
        CHARLOTTE
      </text>
    </svg>
  );
}

/* ---------- the map, pulled out of the device ---------- */

type Rect = { x: number; y: number; w: number; h: number };

type GpsProps = {
  listings: MapListing[];
  /** "loading" | "ready" | "error" — shown in the list beside the map */
  status: "idle" | "loading" | "ready" | "error";
  /** a listing chosen elsewhere (the dashboard's search) becomes the destination */
  selectedId?: string | null;
  /** members see where and when listings meet; visitors are invited to sign up */
  member?: boolean;
};

function MapDialog({ origin, onClose, listings, status, selectedId, member }: GpsProps & { origin: Rect; onClose: () => void }) {
  const { prefs } = useA11y();
  const titleId = useId();
  const filterId = useId();
  const [activeId, setActiveId] = useState<string | null>(selectedId ?? null);
  const [filter, setFilter] = useState("");
  // The live map is heavy to set up, so it is mounted only after the panel has landed and
  // removed before the panel flies back. In flight, only the lightweight drawing moves.
  const [landed, setLanded] = useState(false);
  const close = () => {
    setLanded(false);
    requestAnimationFrame(onClose);
  };
  const dialogRef = useDialog<HTMLDivElement>(true, close);

  const shown = useMemo(() => {
    const q = filter.trim().toLowerCase();
    const list = q ? listings.filter((l) => l.name.toLowerCase().includes(q) || l.location.toLowerCase().includes(q)) : listings;
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }, [listings, filter]);

  // where the panel starts: exactly on top of the GPS screen it came out of
  const inset = window.innerWidth < 640 ? 10 : 24;
  const target = { w: window.innerWidth - inset * 2, h: window.innerHeight - inset * 2 };
  const from = {
    x: origin.x + origin.w / 2 - window.innerWidth / 2,
    y: origin.y + origin.h / 2 - window.innerHeight / 2,
    scaleX: origin.w / target.w,
    scaleY: origin.h / target.h,
    rotateY: BASE_TILT.y,
    rotateX: BASE_TILT.x,
    opacity: 0.4,
  };

  return (
    <motion.div
      className="fixed inset-0 z-[130] bg-black/75"
      onClick={close}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="fixed flex flex-col overflow-hidden rounded-3xl border border-white/15 bg-[#0b1020] shadow-2xl lg:flex-row"
        style={{ inset, transformPerspective: 1400 }}
        initial={from}
        animate={{ x: 0, y: 0, scaleX: 1, scaleY: 1, rotateY: 0, rotateX: 0, opacity: 1 }}
        // closing is quicker than opening: the map snaps back into the device
        exit={{ ...from, transition: { duration: 0.38, ease: [0.4, 0, 0.6, 1] } }}
        transition={{ type: "spring", stiffness: 95, damping: 19, mass: 1 }}
        onAnimationComplete={(definition) => {
          if (typeof definition === "object" && "scaleX" in definition && definition.scaleX === 1) setLanded(true);
        }}
      >
        {/* the map */}
        <div className="relative min-h-[42%] flex-1" role="region" aria-label="Map of listing locations in Charlotte">
          {/* the screen's own drawing rides out with the panel, then the real map loads over it */}
          <div className="absolute inset-0">
            <ScreenMap />
          </div>
          {landed && (
            <motion.div className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
              <CharlotteMap listings={listings} activeId={activeId} onPick={setActiveId} animate={!prefs.reduceMotion} showDetails={!!member} />
            </motion.div>
          )}
        </div>

        {/* every pin on the map is also a button in this list */}
        <div className="flex min-h-0 w-full shrink-0 flex-col gap-4 border-t border-white/10 p-5 sm:p-6 lg:w-[380px] lg:border-l lg:border-t-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-teal-300">Map of Charlotte</p>
              <h2 id={titleId} className="text-2xl font-extrabold text-white" style={{ fontFamily: "Nunito, sans-serif" }}>
                {member ? "Resource locations" : "One city, one map"}
              </h2>
            </div>
            <button
              type="button"
              data-autofocus
              onClick={close}
              className="rounded-xl border border-white/15 p-2 text-gray-200 transition-colors hover:bg-white/10 hover:text-white"
            >
              <HiX className="h-5 w-5" aria-hidden="true" />
              <span className="sr-only">Close the map</span>
            </button>
          </div>

          <p className="hidden leading-relaxed text-gray-300 sm:block">
            {member
              ? "Pick a listing to fly to it, or drag and zoom the map yourself."
              : "Every dot is a listing on the hub. Pick one to fly to it, or drag and zoom the map yourself."}
          </p>

          <div className="relative">
            <label htmlFor={filterId} className="sr-only">
              Filter the list of listings
            </label>
            <HiSearch aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              id={filterId}
              type="search"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter listings"
              autoComplete="off"
              className="w-full rounded-xl border border-white/15 bg-black/40 py-2.5 pl-9 pr-3 text-sm text-white placeholder-gray-400 focus:border-teal-300"
            />
          </div>

          <div className="min-h-[6rem] flex-1 overflow-y-auto pr-1" aria-live="polite">
            {status === "loading" && <p className="text-sm text-gray-300">Loading listings…</p>}
            {status === "error" && <p className="text-sm text-gray-300">The listings could not be loaded right now. You can still explore the map.</p>}
            {status === "ready" && shown.length === 0 && <p className="text-sm text-gray-300">No listings match that filter.</p>}
            <ul className="space-y-1.5">
              {shown.map((l) => {
                const on = l.id === activeId;
                return (
                  <li key={l.id}>
                    <button
                      type="button"
                      onClick={() => setActiveId(l.id)}
                      aria-pressed={on}
                      className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition-colors ${
                        on ? "border-teal-300 bg-teal-300/15 text-white" : "border-white/10 text-gray-200 hover:border-white/40 hover:text-white"
                      }`}
                    >
                      <span className="block font-semibold">{l.name}</span>
                      {member && l.location && l.location !== "TBD" && l.location !== "Location TBD" && (
                        <span className="block text-xs text-gray-300">{l.location}</span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {!member && (
            <Link href="/get-started" className="btn-primary group shrink-0 px-5 py-3 text-sm">
              <span className="relative z-10">Create a free account for meeting times and places</span>
              <HiArrowRight aria-hidden="true" className="relative z-10 h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" />
              <span aria-hidden className="btn-sheen" />
            </Link>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ---------- the GPS unit ---------- */

export default function Gps(props: GpsProps) {
  const { listings, status, selectedId } = props;
  const { prefs } = useA11y();
  const still = prefs.reduceMotion;
  const screenRef = useRef<HTMLButtonElement>(null);
  const [origin, setOrigin] = useState<Rect | null>(null);
  const open = origin !== null;
  const [search, setSearch] = useState(0);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const destination = selectedId ? listings.find((l) => l.id === selectedId) : undefined;

  // tilt toward the pointer, eased with a spring
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 120, damping: 16, mass: 0.5 });
  const sy = useSpring(py, { stiffness: 120, damping: 16, mass: 0.5 });
  const rotateY = useTransform(sx, [-1, 1], [BASE_TILT.y - 14, BASE_TILT.y + 14]);
  const rotateX = useTransform(sy, [-1, 1], [BASE_TILT.x + 10, BASE_TILT.x - 10]);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (still) return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set(((e.clientX - r.left) / r.width) * 2 - 1);
    py.set(((e.clientY - r.top) / r.height) * 2 - 1);
  };
  const onLeave = () => {
    px.set(0);
    py.set(0);
  };

  // the search line cycles through real things people look for
  useEffect(() => {
    if (still || open || destination) return;
    const t = window.setInterval(() => setSearch((n) => (n + 1) % SEARCHES.length), 2400);
    return () => window.clearInterval(t);
  }, [still, open, destination]);

  const press = () => {
    const r = screenRef.current?.getBoundingClientRect();
    if (r) setOrigin({ x: r.left, y: r.top, w: r.width, h: r.height });
  };

  return (
    <div onPointerMove={onMove} onPointerLeave={onLeave} onPointerEnter={preloadMap} className="relative mx-auto w-[min(86vw,480px)] pb-24 pt-10 [perspective:1400px]">
      {/* soft shadow on the "table" under the unit */}
      <div aria-hidden className="absolute inset-x-[12%] bottom-8 h-10 rounded-[50%] bg-indigo-400/25 blur-2xl" />

      <div className={still ? "" : "animate-float"}>
        <motion.div className="relative aspect-[3/2]" style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}>
          {/* thickness: copies of the body stacked back through space */}
          {Array.from({ length: DEPTH_SLICES }, (_, i) => (
            <span
              key={i}
              aria-hidden
              className="absolute inset-0 rounded-[2rem]"
              style={{ transform: `translateZ(${-(i + 1) * 5}px)`, background: i === DEPTH_SLICES - 1 ? "#07080f" : i % 2 ? "#20222e" : "#262936" }}
            />
          ))}
          {/* mounting arm behind the unit */}
          <span aria-hidden className="absolute left-1/2 top-[70%] h-[48%] w-[14%] -translate-x-1/2 rounded-b-2xl bg-[#14151d]" style={{ transform: "translateZ(-70px) rotateX(-18deg)" }} />

          {/* front face */}
          <div className="absolute inset-0 rounded-[2rem] border border-white/15 bg-gradient-to-br from-[#2e3140] to-[#171822] p-[4.5%] shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
            <button
              ref={screenRef}
              type="button"
              onClick={press}
              onFocus={preloadMap}
              aria-haspopup="dialog"
              aria-expanded={open}
              className="group relative block h-[80%] w-full overflow-hidden rounded-2xl border border-black/60 bg-[#0b1020] text-left shadow-[inset_0_0_30px_rgba(0,0,0,0.7)]"
            >
              <span className="sr-only">
                Open the map of Charlotte{destination ? `, centered on ${destination.name}` : ""}
              </span>
              <span aria-hidden="true" className={`absolute inset-0 transition-opacity duration-500 ${open ? "opacity-10" : "opacity-100"}`}>
                <ScreenMap moving={!open && !still} />
              </span>

              {/* status line */}
              <span aria-hidden="true" className="absolute inset-x-0 top-0 flex items-center gap-2 truncate bg-black/55 px-3 py-1.5 text-[11px] font-semibold text-gray-100 sm:text-xs">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-teal-300" />
                {open ? (
                  "Map opened"
                ) : destination ? (
                  <span className="truncate">
                    Destination: <span className="text-teal-200">{destination.name}</span>
                  </span>
                ) : (
                  <>
                    Searching: <span className="text-teal-200">{SEARCHES[search]}</span>
                  </>
                )}
              </span>

              {/* call to action on the glass */}
              {!open && (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-gradient-to-t from-black/85 to-transparent px-3 pb-2.5 pt-8 text-xs font-bold text-white transition-colors group-hover:text-teal-200 sm:text-sm"
                >
                  <HiCursorClick className="h-4 w-4" />
                  Tap the screen to pull out the map
                </span>
              )}
              {/* glass reflection */}
              <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.09] via-transparent to-transparent" />
            </button>

            {/* chin: brand + listing count + hardware buttons */}
            <div aria-hidden="true" className="flex h-[20%] items-center justify-between px-2 pt-[3%]">
              <span className="text-[11px] font-extrabold uppercase tracking-[0.3em] text-gray-300 sm:text-xs">CLT · NAV</span>
              <span className="flex items-center gap-2">
                {status === "ready" && <span className="mr-1 text-[10px] font-bold text-gray-300 sm:text-[11px]">{listings.length} pins</span>}
                <span className="h-2 w-2 rounded-full bg-teal-300 shadow-[0_0_8px_2px_rgba(94,234,212,0.7)]" />
                <span className="h-2.5 w-7 rounded-full bg-black/60" />
                <span className="h-2.5 w-7 rounded-full bg-black/60" />
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {mounted &&
        createPortal(
          <AnimatePresence>{origin && <MapDialog key="map" {...props} origin={origin} onClose={() => setOrigin(null)} />}</AnimatePresence>,
          document.body
        )}
    </div>
  );
}
