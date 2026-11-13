"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import {
  HiUsers,
  HiMap,
  HiSearch,
  HiChat,
  HiViewGrid,
  HiGift,
  HiArrowRight,
  HiChevronDown,
  HiUserAdd,
  HiLocationMarker,
  HiSparkles,
  HiUserGroup,
  HiHeart,
  HiCalendar,
  HiSupport,
  HiAcademicCap,
  HiLockClosed,
  HiInboxIn,
  HiCollection,
  HiCursorClick,
  HiPause,
  HiPlay,
} from "react-icons/hi";
import Navbar from "@/components/Navbar";
import TiltCard from "@/components/fx/TiltCard";
import Marquee from "@/components/fx/Marquee";
import ScrollProgress from "@/components/fx/ScrollProgress";
import CursorGlow from "@/components/fx/CursorGlow";
import Magnetic from "@/components/fx/Magnetic";
import SiteFooter from "@/components/SiteFooter";
import Cite from "@/components/Cite";
import GpsSection from "@/components/objects/GpsSection";
import Signpost from "@/components/objects/Signpost";
import RouteSteps from "@/components/objects/RouteSteps";
import { useA11y } from "@/components/a11y/A11yProvider";
import { CATEGORIES, KINDS, KIND_ORDER, LISTING_COUNT, ORGS, type Category, type Kind } from "@/lib/communityData";

// WebGL only runs in the browser; keep three.js out of the server bundle
const StairsHero = dynamic(() => import("@/components/three/StairsHero"), { ssr: false });
const NetworkHero = dynamic(() => import("@/components/three/NetworkHero"), { ssr: false });

const EASE = [0.22, 1, 0.36, 1] as const;

const KIND_ICON: Record<Kind, React.ComponentType<{ className?: string }>> = {
  club: HiUserGroup,
  nonprofit: HiHeart,
  event: HiCalendar,
  service: HiSupport,
};

const PILLARS: Record<Kind, { body: string; examples: string[] }> = {
  club: {
    body: "Student and community clubs for every interest — from AI and coding to finance, medicine and mental health.",
    examples: ["CAIVO", "Aspira", "NCSteminate"],
  },
  nonprofit: {
    body: "Local organizations tackling homelessness, food insecurity, education and health — and ways you can help.",
    examples: ["ESSAM", "Snack Packs for Hope", "UpLife.CLT"],
  },
  event: {
    body: "Charity races, fundraisers, workshops and meet-ups happening across the city.",
    examples: ["Stride Forward races", "ACS fundraisers", "CAIVO workshops"],
  },
  service: {
    body: "Tutoring, volunteer connections and student-run local businesses you can use today.",
    examples: ["ESL Teen Tutors", "STEMReach", "Queen City Blendz"],
  },
};

const CLUBS_ROW_1 = ["ESSAM", "Excel Academy", "STEMReach", "CAIVO", "NCSteminate", "BrightCareKids", "Bloom and Soar", "Snack Packs for Hope", "UpLife.CLT", "T1D United", "Stride Forward Foundation", "Homeless Hearth"];
const CLUBS_ROW_2 = ["IAYL", "NCAAT", "Aspira", "CYMA", "Echelon", "MedSearch Charlotte", "Finance Club Ardrey Kell", "ESL Teen Tutors", "Project Infinite Horizons", "Thrive2gethr", "HelpingHands", "The Business Ledger"];

const BENEFITS = [
  { title: "Find Your Community", description: "Discover clubs and organizations that match your interests and connect with like-minded community members.", Icon: HiUsers },
  { title: "Interactive Map", description: "Explore club locations across Charlotte with our interactive map to find meetings near you.", Icon: HiMap, feature: true },
  { title: "Easy Search", description: "Quickly find clubs by name, location, or category with our powerful search functionality.", Icon: HiSearch },
  { title: "Stay Connected", description: "Join community members who are building connections and growing together across Charlotte.", Icon: HiChat },
  { title: "All in One Place", description: "Access all club information, meeting times, locations, and member counts in one convenient dashboard.", Icon: HiViewGrid },
];

const STEPS = [
  { title: "Create your account", body: "Sign up for free in under a minute with email or Google.", Icon: HiUserAdd },
  { title: "Explore the map", body: "Browse clubs, non-profits, events and services and see where they meet.", Icon: HiLocationMarker },
  { title: "Join & grow", body: "Connect with organizers, find your people, and promote your own ideas.", Icon: HiSparkles },
];

/** How the hub manages Charlotte's shared resources, end to end. */
const LIFECYCLE = [
  { title: "Collect", body: "Organizations submit their listing through our registration form, so information comes straight from the source.", Icon: HiInboxIn },
  { title: "Organize", body: "Every listing is tagged by type and category and pinned to a real location on the map.", Icon: HiCollection },
  { title: "Discover", body: "Members search, filter by category, browse the map or ask the AI assistant to find what they need.", Icon: HiCursorClick },
  { title: "Connect", body: "People request to join, leave reviews and come back for new events, closing the loop for organizers.", Icon: HiUserGroup },
];

/* ---------- building blocks ---------- */

function SectionDivider() {
  return (
    <div className="px-4 md:px-12">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-gray-300 backdrop-blur">
      {children}
    </span>
  );
}

function SectionHeading({ eyebrow, title, sub }: { eyebrow: string; title: React.ReactNode; sub?: string }) {
  return (
    <div className="mx-auto mb-16 max-w-4xl text-center">
      <Eyebrow>{eyebrow}</Eyebrow>
      <motion.h2
        className="mt-6 text-4xl font-extrabold tracking-tight text-white md:text-6xl lg:text-7xl"
        style={{ fontFamily: "Nunito, sans-serif" }}
        initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.8, ease: EASE }}
      >
        {title}
      </motion.h2>
      {sub && (
        <motion.p
          className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-400 md:text-xl"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
        >
          {sub}
        </motion.p>
      )}
    </div>
  );
}

function Counter({ to, prefix = "", suffix = "" }: { to: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, to, { duration: 1.6, ease: EASE, onUpdate: (v) => setVal(Math.round(v)) });
    return () => c.stop();
  }, [inView, to]);
  return (
    <span ref={ref}>
      {prefix}
      {val}
      {suffix}
    </span>
  );
}

function Word({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.15, 1]);
  const y = useTransform(progress, range, [8, 0]);
  return (
    <motion.span style={{ opacity, y }} className="mr-[0.28em] inline-block">
      {children}
    </motion.span>
  );
}

function ScrollRevealText({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.9", "end 0.55"] });
  const words = text.split(" ");
  return (
    <p ref={ref} className={`relative ${className}`}>
      {words.map((w, i) => (
        <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
          {w}
        </Word>
      ))}
    </p>
  );
}

/* ---------- explorer ---------- */

function Explorer() {
  const [cat, setCat] = useState<Category>("STEM");
  const list = ORGS.filter((o) => o.category === cat);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const slug = (c: string) => c.toLowerCase().replace(/[^a-z]+/g, "-");

  // WAI-ARIA tabs pattern: arrow keys move between categories, Home/End jump to the ends
  const onTabKey = (e: React.KeyboardEvent, i: number) => {
    const last = CATEGORIES.length - 1;
    const next =
      e.key === "ArrowRight" ? (i === last ? 0 : i + 1)
      : e.key === "ArrowLeft" ? (i === 0 ? last : i - 1)
      : e.key === "Home" ? 0
      : e.key === "End" ? last
      : -1;
    if (next < 0) return;
    e.preventDefault();
    setCat(CATEGORIES[next]);
    tabRefs.current[next]?.focus();
  };

  return (
    <div>
      <div className="mb-10 flex flex-wrap justify-center gap-2" role="tablist" aria-label="Listing categories">
        {CATEGORIES.map((c, i) => (
          <button
            key={c}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`tab-${slug(c)}`}
            aria-selected={c === cat}
            aria-controls="explore-panel"
            tabIndex={c === cat ? 0 : -1}
            onKeyDown={(e) => onTabKey(e, i)}
            onClick={() => setCat(c)}
            className={`relative rounded-full px-5 py-2.5 text-sm font-semibold transition-colors md:text-base ${
              c === cat ? "text-black" : "text-gray-400 hover:text-white"
            }`}
          >
            {c === cat && (
              <motion.span
                layoutId="explore-pill"
                className="absolute inset-0 rounded-full bg-white shadow-[0_0_30px_-6px_rgba(165,180,252,0.8)]"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            <span className="relative">{c}</span>
          </button>
        ))}
      </div>

      <div
        id="explore-panel"
        role="tabpanel"
        aria-labelledby={`tab-${slug(cat)}`}
        tabIndex={0}
        className="grid min-h-[22rem] grid-cols-1 gap-5 rounded-3xl sm:grid-cols-2 lg:grid-cols-3"
      >
        <AnimatePresence mode="popLayout">
          {list.map((o, i) => {
            const k = o.kind === "class" ? null : KINDS[o.kind];
            const Icon = o.kind === "class" ? HiAcademicCap : KIND_ICON[o.kind];
            return (
              <motion.div
                key={o.name}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.45, delay: i * 0.05, ease: EASE }}
              >
                <TiltCard className="h-full" max={6} glow={k?.glow}>
                  <div className="flex h-full flex-col p-6">
                    <span
                      className={`mb-4 inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                        k ? k.chip : "border-white/15 bg-white/5 text-gray-200"
                      }`}
                    >
                      <Icon aria-hidden="true" className="h-3.5 w-3.5" />
                      {k ? k.label : "Class"}
                    </span>
                    <h3 className="mb-2 font-sans text-lg font-bold leading-snug text-white">{o.name}</h3>
                    <p className="font-sans text-sm leading-relaxed text-gray-400">{o.blurb}</p>
                  </div>
                </TiltCard>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="mt-10 flex flex-col items-center justify-center gap-3 text-center sm:flex-row">
        <HiLockClosed aria-hidden="true" className="h-4 w-4 text-gray-400" />
        <p className="text-gray-400">Meeting times, locations and the full map are available once you&apos;re signed in.</p>
        <Link href="/get-started" className="font-semibold text-white underline-offset-4 hover:underline">
          Create a free account →
        </Link>
      </div>
    </div>
  );
}

/* ---------- page ---------- */

export default function Home() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroTextY = useTransform(heroProgress, [0, 1], [0, 140]);
  const heroTextOpacity = useTransform(heroProgress, [0, 0.7], [1, 0]);
  const { prefs } = useA11y();
  const [tickerPaused, setTickerPaused] = useState(false);

  return (
    <div className="bg-site relative min-h-screen overflow-x-clip">
      <ScrollProgress />
      <CursorGlow />
      <Navbar />

      <main id="main" tabIndex={-1} className="outline-none">
      {/* ================= HERO: endless staircase ================= */}
      <section ref={heroRef} className="relative flex flex-col overflow-hidden pb-10 pt-32 lg:min-h-[100svh] lg:flex-row lg:items-center lg:pb-24">
        {/* fallback glow (visible before / without WebGL) */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute right-[0%] top-1/3 h-[40rem] w-[40rem] rounded-full bg-indigo-500/15 blur-[140px]" />
        </div>

        {/* 3D: fills the hero on desktop, sits under the copy on mobile */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.6, delay: 0.15 }}
          className="relative order-2 mt-6 h-[440px] w-full sm:h-[540px] lg:absolute lg:inset-0 lg:mt-0 lg:h-auto"
        >
          {/* remount when "Reduce motion" changes so the scene switches to a still frame */}
          <StairsHero key={prefs.reduceMotion ? "still" : "live"} className="h-full w-full" />
          {/* soft top/bottom fades so the canvas melts into the page on mobile */}
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black to-transparent lg:hidden" />
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black to-transparent lg:hidden" />
        </motion.div>

        {/* readability gradients over the canvas */}
        <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 hidden w-[55%] bg-gradient-to-r from-black via-black/70 to-transparent lg:block" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-black" />
        <div aria-hidden className="grain pointer-events-none absolute inset-0" />

        <motion.div
          style={{ y: heroTextY, opacity: heroTextOpacity }}
          className="relative z-10 order-1 w-full px-4 md:px-12 lg:max-w-[52%]"
        >
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE }}>
            <Eyebrow>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping-soft rounded-full bg-teal-300" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-300" />
              </span>
              Charlotte, NC<span className="hidden sm:inline"> · Clubs · Non-profits · Events · Services</span>
            </Eyebrow>
          </motion.div>

          <h1
            className="mb-8 mt-8 text-5xl font-extrabold leading-[1.0] tracking-tight text-white [perspective:800px] min-[400px]:text-6xl sm:text-7xl xl:text-[6.5rem]"
            style={{ fontFamily: "Nunito, sans-serif" }}
          >
            {["Welcome", "to"].map((w, i) => (
              <motion.span
                key={w}
                className="mr-[0.25em] inline-block"
                initial={{ opacity: 0, y: 40, rotateX: -60 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ duration: 0.9, delay: 0.1 + i * 0.08, ease: EASE }}
              >
                {w}
              </motion.span>
            ))}
            <br />
            <motion.span
              className="mr-[0.25em] inline-block"
              initial={{ opacity: 0, y: 40, rotateX: -60 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 0.9, delay: 0.26, ease: EASE }}
            >
              CLT
            </motion.span>
            <motion.span
              className="text-shimmer inline-block pb-2"
              style={{ fontFamily: "Arial, sans-serif", fontWeight: 100 }}
              initial={{ opacity: 0, y: 40, rotateX: -60 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 0.9, delay: 0.34, ease: EASE }}
            >
              CommunityHub
            </motion.span>
          </h1>

          <motion.p
            className="mb-10 max-w-xl text-xl leading-relaxed text-gray-300 md:text-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: EASE }}
          >
            Charlotte&apos;s digital resource hub: one searchable, mapped directory of the clubs, non-profits, events, and services you need.
          </motion.p>

          <motion.div
            className="flex flex-col gap-4 sm:flex-row"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.65, ease: EASE }}
          >
            <Magnetic>
              <Link href="/get-started" className="btn-primary group w-full px-9 py-4 text-lg sm:w-auto">
                <span className="relative z-10">Get Started</span>
                <HiArrowRight className="relative z-10 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                <span aria-hidden className="btn-sheen" />
              </Link>
            </Magnetic>
            <Magnetic>
              <a href="#explore" className="btn-glass w-full px-9 py-4 text-lg sm:w-auto">
                Explore listings
              </a>
            </Magnetic>
          </motion.div>

          <motion.p
            className="mt-12 hidden max-w-sm border-l border-white/15 pl-4 text-sm leading-relaxed text-gray-400 lg:block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
          >
            One club, one cause, one connection at a time — <span className="text-gray-300">rise higher with Charlotte.</span>
          </motion.p>
        </motion.div>

        <motion.a
          href="#stats"
          aria-label="Scroll to the next section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
          className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-1 text-xs font-medium uppercase tracking-[0.25em] text-gray-400 transition-colors hover:text-white lg:flex"
        >
          Scroll
          <HiChevronDown aria-hidden="true" className="h-5 w-5 animate-bounce" />
        </motion.a>
      </section>

      {/* ================= STATS ================= */}
      <section id="stats" aria-label="CLT CommunityHub at a glance" className="relative z-10 scroll-mt-24 px-4 py-10 md:px-12">
        <div className="mx-auto grid max-w-7xl grid-cols-2 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur lg:grid-cols-4">
          {[
            { node: <Counter to={LISTING_COUNT} suffix="+" />, label: "Clubs, non-profits, services & classes listed", color: "text-white" },
            { node: <Counter to={5} />, label: "Categories to explore", color: "text-indigo-300" },
            { node: <Counter to={4} />, label: "Ways to get involved", color: "text-teal-300" },
            { node: <Counter to={0} prefix="$" />, label: "Cost to join — it's free", color: "text-white" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              className={`border-white/10 p-6 text-center md:p-10 ${i % 2 === 0 ? "border-r" : ""} ${i < 2 ? "border-b lg:border-b-0" : ""} ${i === 1 ? "lg:border-r" : ""}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: EASE }}
            >
              <div className={`mb-2 text-5xl font-extrabold tracking-tight md:text-6xl ${s.color}`} style={{ fontFamily: "Nunito, sans-serif" }}>
                {s.node}
              </div>
              <p className="text-sm text-gray-400 md:text-base">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================= THE PROBLEM + HOW WE MANAGE IT ================= */}
      <section aria-labelledby="problem-heading" className="relative z-10 px-4 py-28 md:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 grid items-center gap-10 lg:grid-cols-[1.15fr_1fr]">
            <div className="text-center lg:text-left">
              <Eyebrow>The problem</Eyebrow>
              <h2 id="problem-heading" className="mt-6 text-4xl font-extrabold tracking-tight text-white md:text-6xl" style={{ fontFamily: "Nunito, sans-serif" }}>
                Charlotte&apos;s resources are everywhere, <span className="text-shimmer">and hard to find</span>
              </h2>
              <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-gray-300 md:text-xl lg:mx-0">
                Clubs post on social media, non-profits on their own websites, and events on flyers and in group chats. With no single place to look,
                residents miss opportunities and organizations struggle to be found. CLT CommunityHub is a{" "}
                <strong className="text-white">digital resource management system</strong> that collects this information, keeps it organized and makes it easy to act on.
              </p>
            </div>
            {/* 3D signpost: four directions become one as you scroll */}
            <Signpost />
          </div>

          <ul className="mb-20 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              { stat: "874,579", body: <>people live in Charlotte, the largest city in North Carolina, and its resources are spread across the whole city.<Cite id="census" /></> },
              { stat: "28.3%", body: <>of Americans volunteered through an organization in 2023. Organizations need an easy way for those people to find them.<Cite id="americorps" /></> },
              { stat: "95%", body: <>of U.S. teens have access to a smartphone, so the hub is designed mobile-first and works on any screen size.<Cite id="pew" /></> },
            ].map((c) => (
              <li key={c.stat} className="rounded-3xl border border-white/10 bg-white/[0.03] p-8">
                <p className="mb-3 text-5xl font-extrabold tracking-tight text-white" style={{ fontFamily: "Nunito, sans-serif" }}>
                  {c.stat}
                </p>
                <p className="leading-relaxed text-gray-300">{c.body}</p>
              </li>
            ))}
          </ul>

          <h3 className="mb-10 text-center text-3xl font-extrabold text-white md:text-4xl" style={{ fontFamily: "Nunito, sans-serif" }}>
            How the hub manages Charlotte&apos;s resources
          </h3>
          {/* 3D route: a marker drives from stop to stop as you scroll */}
          <RouteSteps steps={LIFECYCLE} />
        </div>
      </section>

      <SectionDivider />

      {/* ================= GPS: the map pulls out of the device ================= */}
      <GpsSection />

      <SectionDivider />

      {/* ================= WHAT YOU CAN FIND ================= */}
      <section className="relative z-10 px-4 py-28 md:px-12">
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-40 h-[30rem] w-[60rem] -translate-x-1/2 rounded-full bg-indigo-500/10 blur-[140px]" />
        <SectionHeading
          eyebrow="What we do"
          title={
            <>
              Everything Charlotte needs, <span className="text-shimmer">in one hub</span>
            </>
          }
          sub="We help people in the Charlotte area find clubs, non-profits, events, and services that they need."
        />
        <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-6 md:grid-cols-2">
          {KIND_ORDER.map((k, i) => {
            const kind = KINDS[k];
            const Icon = KIND_ICON[k];
            return (
              <motion.div
                key={k}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.7, delay: (i % 2) * 0.12, ease: EASE }}
              >
                <TiltCard className="h-full" max={5} glow={kind.glow}>
                  <div className="relative flex h-full flex-col overflow-hidden p-8 md:p-10">
                    <span aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-20 blur-3xl transition-opacity duration-700 group-hover:opacity-40" style={{ background: kind.hex }} />
                    <div className="relative mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/15 bg-gradient-to-br from-white/15 to-white/[0.02]">
                      <Icon aria-hidden="true" className={`h-8 w-8 ${kind.text}`} />
                    </div>
                    <h3 className="mb-3 text-3xl font-extrabold text-white md:text-4xl" style={{ fontFamily: "Nunito, sans-serif" }}>
                      {kind.plural}
                    </h3>
                    <p className="mb-8 max-w-md text-lg leading-relaxed text-gray-400">{PILLARS[k].body}</p>
                    <div className="mt-auto flex flex-wrap gap-2">
                      {PILLARS[k].examples.map((ex) => (
                        <span key={ex} className={`rounded-full border px-3 py-1 text-sm font-medium ${kind.chip}`}>
                          {ex}
                        </span>
                      ))}
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            );
          })}
        </div>
      </section>

      <SectionDivider />

      {/* ================= EXPLORER ================= */}
      <section id="explore" className="relative z-10 scroll-mt-24 px-4 py-28 md:px-12">
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/3 h-[30rem] w-[60rem] -translate-x-1/2 rounded-full bg-teal-400/[0.06] blur-[140px]" />
        <div className="relative mx-auto max-w-7xl">
          <SectionHeading eyebrow="Explore" title="Browse what's already here" sub="A sample of the real clubs, non-profits, services and classes listed on CLT CommunityHub." />
          <Explorer />
        </div>
      </section>

      {/* ================= CLUB TICKER ================= */}
      <section className="relative z-10 py-12" aria-labelledby="ticker-heading">
        <div className="mb-8 flex items-center justify-center gap-4">
          <h2 id="ticker-heading" className="text-center text-sm font-semibold uppercase tracking-[0.25em] text-gray-300">
            Already on the hub
          </h2>
          {!prefs.reduceMotion && (
            <button
              type="button"
              onClick={() => setTickerPaused((p) => !p)}
              aria-pressed={tickerPaused}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1 text-xs font-semibold text-gray-200 transition-colors hover:border-white/40 hover:text-white"
            >
              {tickerPaused ? <HiPlay aria-hidden="true" className="h-4 w-4" /> : <HiPause aria-hidden="true" className="h-4 w-4" />}
              {tickerPaused ? "Play" : "Pause"}
              <span className="sr-only"> scrolling list of organizations</span>
            </button>
          )}
        </div>
        <div className="space-y-4">
          <Marquee items={CLUBS_ROW_1} duration={55} paused={tickerPaused || prefs.reduceMotion} />
          <Marquee items={CLUBS_ROW_2} duration={60} reverse paused={tickerPaused || prefs.reduceMotion} />
        </div>
      </section>

      <SectionDivider />

      {/* ================= STATEMENT ================= */}
      <section id="features-section" className="relative z-10 overflow-hidden px-4 py-32 md:px-12">
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-[30rem] w-[60rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-[140px]" />
        <div className="relative mx-auto w-full max-w-5xl text-center">
          <motion.h2
            className="mb-10 text-5xl font-extrabold tracking-tight text-white md:text-7xl"
            style={{ fontFamily: "Nunito, sans-serif" }}
            initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, ease: EASE }}
          >
            Learn & Promote Your Ideas at <span className="text-silver">CLT CommunityHub</span>
          </motion.h2>
          <ScrollRevealText
            text="Share what you're building, find your people, and grow with Charlotte's community."
            className="mx-auto mb-14 max-w-4xl text-3xl font-semibold leading-snug text-white md:text-5xl"
          />
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Magnetic>
              <Link href="/get-started" className="btn-primary group w-full px-8 py-4 text-lg sm:w-auto">
                <span className="relative z-10">Get Started</span>
                <span aria-hidden className="btn-sheen" />
              </Link>
            </Magnetic>
            <Magnetic>
              <Link href="/join-us" className="btn-glass w-full px-8 py-4 text-lg sm:w-auto">
                Join Us
              </Link>
            </Magnetic>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ================= BENEFITS (BENTO) ================= */}
      <section className="relative z-10 px-4 py-28 md:px-12">
        <div className="mx-auto w-full max-w-7xl">
          <SectionHeading eyebrow="Why us" title="Why Choose CLT CommunityHub?" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map((b, index) => {
              const Icon = b.Icon;
              return (
                <motion.div
                  key={b.title}
                  className={b.feature ? "md:col-span-2" : ""}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.7, delay: (index % 3) * 0.1, ease: EASE }}
                >
                  <TiltCard className="h-full" max={b.feature ? 4 : 8}>
                    <div className={`flex h-full flex-col p-8 ${b.feature ? "md:flex-row md:items-center md:gap-8" : ""}`}>
                      <div className={b.feature ? "md:w-1/2" : ""}>
                        <div className="relative mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-gradient-to-br from-white/15 to-white/[0.02]">
                          <span aria-hidden className="absolute inset-0 rounded-2xl bg-indigo-400/30 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />
                          <Icon aria-hidden="true" className="relative h-7 w-7 text-white" />
                        </div>
                        <h3 className="mb-3 font-sans text-2xl font-bold text-white">{b.title}</h3>
                        <p className="font-sans leading-relaxed text-gray-400">{b.description}</p>
                      </div>
                      {b.feature && (
                        <div className="relative mt-8 h-56 md:mt-0 md:h-64 md:w-1/2">
                          <div aria-hidden className="absolute inset-6 rounded-full bg-indigo-400/20 blur-3xl" />
                          <Image
                            src="/map.png"
                            alt="Map of club locations across Charlotte"
                            fill
                            sizes="(min-width: 768px) 40vw, 90vw"
                            className="object-contain drop-shadow-[0_20px_40px_rgba(165,180,252,0.25)] transition-transform duration-700 group-hover:scale-105"
                          />
                        </div>
                      )}
                    </div>
                  </TiltCard>
                </motion.div>
              );
            })}

            <motion.div
              className="md:col-span-2 lg:col-span-3"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, ease: EASE }}
            >
              <TiltCard max={3} glow="rgba(94,234,212,0.14)">
                <div className="flex flex-col items-start justify-between gap-6 p-8 md:flex-row md:items-center md:p-10">
                  <div className="flex items-start gap-5">
                    <div className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-gradient-to-br from-teal-300/25 to-white/[0.02]">
                      <HiGift className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h3 className="mb-2 font-sans text-2xl font-bold text-white">Free to Join</h3>
                      <p className="max-w-xl font-sans leading-relaxed text-gray-400">
                        Sign up for free and start exploring all the amazing clubs and opportunities available to you.
                      </p>
                    </div>
                  </div>
                  <Link href="/get-started" className="btn-primary group shrink-0 px-7 py-3.5">
                    <span className="relative z-10">Create free account</span>
                    <HiArrowRight className="relative z-10 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    <span aria-hidden className="btn-sheen" />
                  </Link>
                </div>
              </TiltCard>
            </motion.div>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ================= HOW IT WORKS ================= */}
      <section className="relative z-10 px-4 py-28 md:px-12">
        <div className="mx-auto w-full max-w-6xl">
          <SectionHeading eyebrow="How it works" title="Three steps to your community" />
          <div className="relative grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-6">
            <motion.div
              aria-hidden
              className="absolute left-[16.6%] right-[16.6%] top-12 hidden h-px origin-left bg-gradient-to-r from-indigo-300/60 via-white/40 to-teal-300/60 md:block"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.4, ease: EASE }}
            />
            {STEPS.map((s, i) => {
              const Icon = s.Icon;
              return (
                <motion.div
                  key={s.title}
                  className="relative text-center"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.7, delay: 0.3 + i * 0.2, ease: EASE }}
                >
                  <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-white/15 bg-black shadow-[0_0_50px_-12px_rgba(165,180,252,0.7)]">
                    <span aria-hidden className="absolute inset-1.5 rounded-full bg-gradient-to-br from-white/15 to-transparent" />
                    <Icon aria-hidden="true" className="relative h-10 w-10 text-white" />
                    <span className="absolute -right-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-extrabold text-black">{i + 1}</span>
                  </div>
                  <h3 className="mb-2 font-sans text-2xl font-bold text-white">{s.title}</h3>
                  <p className="mx-auto max-w-xs font-sans text-gray-400">{s.body}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA: the network ================= */}
      <section className="relative z-10 px-4 pb-28 md:px-12">
        <motion.div
          className="relative mx-auto min-h-[640px] max-w-7xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-black"
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: EASE }}
        >
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-1/2 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/20 blur-[120px]" />
          </div>
          <NetworkHero key={prefs.reduceMotion ? "still" : "live"} centered className="absolute inset-0 opacity-80" />
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.75)_0%,rgba(0,0,0,0.35)_45%,transparent_75%)]" />
          <div aria-hidden className="absolute inset-x-20 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
          <div className="relative flex min-h-[640px] flex-col items-center justify-center px-6 py-24 text-center md:px-16">
            <h2 className="mx-auto mb-6 max-w-4xl text-5xl font-extrabold tracking-tight text-white md:text-7xl" style={{ fontFamily: "Nunito, sans-serif" }}>
              Your people are <span className="text-shimmer">already here.</span>
            </h2>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-300 md:text-xl">
              Find the clubs, non-profits, events, and services you need across Charlotte — all in one place.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Magnetic>
                <Link href="/get-started" className="btn-primary group w-full px-10 py-4 text-lg sm:w-auto">
                  <span className="relative z-10">Get Started</span>
                  <HiArrowRight className="relative z-10 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  <span aria-hidden className="btn-sheen" />
                </Link>
              </Magnetic>
              <Magnetic>
                <Link href="/signin" className="btn-glass w-full px-10 py-4 text-lg sm:w-auto">
                  Sign In
                </Link>
              </Magnetic>
            </div>
          </div>
        </motion.div>
      </section>

      </main>

      <SiteFooter />
    </div>
  );
}
