"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import {
  HiArrowRight,
  HiUserGroup,
  HiHeart,
  HiCalendar,
  HiSupport,
  HiSearch,
  HiMap,
  HiChatAlt2,
  HiStar,
  HiClipboardCheck,
  HiDeviceMobile,
  HiAcademicCap,
  HiOfficeBuilding,
  HiHome,
} from "react-icons/hi";
import PageBackdrop from "@/components/fx/PageBackdrop";
import TiltCard from "@/components/fx/TiltCard";
import SiteFooter from "@/components/SiteFooter";
import Cite from "@/components/Cite";
import { KINDS, KIND_ORDER, type Kind } from "@/lib/communityData";

const EASE = [0.22, 1, 0.36, 1] as const;

const ICONS: Record<Kind, React.ComponentType<{ className?: string }>> = {
  club: HiUserGroup,
  nonprofit: HiHeart,
  event: HiCalendar,
  service: HiSupport,
};

const BLURBS: Record<Kind, string> = {
  club: "Find student and community clubs that match your interests.",
  nonprofit: "Discover local organizations doing good, and learn how to help.",
  event: "See fundraisers, races and workshops happening around town.",
  service: "Get tutoring, volunteer connections and local help you need.",
};

const AUDIENCE = [
  { Icon: HiAcademicCap, title: "Students", body: "Find clubs, classes, tutoring and volunteer hours without digging through a dozen social media accounts." },
  { Icon: HiHome, title: "Residents & families", body: "Locate nearby services, charity events and support organizations on one map." },
  { Icon: HiOfficeBuilding, title: "Organizations", body: "Get listed once and reach people who are actively looking for what you offer." },
];

const FEATURES = [
  { Icon: HiSearch, title: "Search & filter", body: "Live search by name, location or meeting time, with keyboard-friendly suggestions." },
  { Icon: HiMap, title: "Resource map", body: "Every listing is pinned on an interactive map of Charlotte so you can see what is near you." },
  { Icon: HiClipboardCheck, title: "Join requests", body: "A single registration form routes requests to join or list an organization to our team." },
  { Icon: HiStar, title: "Reviews", body: "Members rate and review listings anonymously, helping others choose with confidence." },
  { Icon: HiChatAlt2, title: "AI assistant", body: "Ask questions in plain language and get pointed to the right club, class or service." },
  { Icon: HiDeviceMobile, title: "Works everywhere", body: "Responsive layouts for phones, tablets and desktops; most teens reach the web by smartphone." },
];

const A11Y_POINTS = [
  "Text and background colors meet the WCAG 2.2 AA contrast ratio of at least 4.5:1 for body text.",
  "Every page can be used with a keyboard alone, with a visible focus outline and a “Skip to main content” link.",
  "Pop-ups trap focus, close with the Esc key and return you to where you were.",
  "Images have text alternatives, icon buttons have labels, and form fields have visible labels.",
  "The Accessibility button (bottom-left on every page) offers larger text, reduced motion, high contrast, underlined links and a highly readable font. Your choices are saved.",
  "Animations respect your device’s “reduce motion” setting, and the scrolling ticker can be paused.",
];

function SectionTitle({ id, eyebrow, children }: { id: string; eyebrow: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-gray-300">{eyebrow}</p>
      <h2 id={id} className="text-3xl font-extrabold tracking-tight text-white md:text-5xl" style={{ fontFamily: "Nunito, sans-serif" }}>
        {children}
      </h2>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      <PageBackdrop />
      <Navbar />

      <main id="main" tabIndex={-1} className="relative z-10 px-4 pb-24 pt-36 outline-none md:px-12">
        <div className="mx-auto w-full max-w-5xl">
          {/* Mission */}
          <motion.div initial={{ opacity: 0, y: 30, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.8, ease: EASE }}>
            <TiltCard max={3}>
              <div className="p-8 md:p-14">
                <span className="mb-6 inline-block rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-gray-300">
                  Our mission
                </span>
                <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-white md:text-7xl" style={{ fontFamily: "Nunito, sans-serif" }}>
                  About <span className="text-shimmer">CLT CommunityHub</span>
                </h1>
                <p className="mb-6 text-xl leading-relaxed text-gray-200 md:text-2xl">
                  CLT CommunityHub is a digital resource management platform for Charlotte, North Carolina. It gathers the clubs, non-profits, events and
                  services spread across the city into one organized, searchable and mapped directory.
                </p>
                <p className="mb-10 text-lg leading-relaxed text-gray-300 md:text-xl">
                  Our goal is simple: help people in the Charlotte area find the resources they need, and help the organizations behind those resources
                  reach the people they serve.
                </p>
                <Link href="/get-started" className="btn-primary group px-8 py-4 text-lg">
                  <span className="relative z-10">Get Started</span>
                  <HiArrowRight aria-hidden="true" className="relative z-10 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  <span aria-hidden className="btn-sheen" />
                </Link>
              </div>
            </TiltCard>
          </motion.div>

          {/* Problem */}
          <section aria-labelledby="problem" className="mt-24">
            <SectionTitle id="problem" eyebrow="The need">
              Why Charlotte needs a resource hub
            </SectionTitle>
            <div className="space-y-5 text-lg leading-relaxed text-gray-300">
              <p>
                Charlotte is home to 874,579 people<Cite id="census" />, along with hundreds of student clubs, non-profits and community programs. Yet
                information about them is scattered across social media accounts, school announcements, flyers and word of mouth. Organizations
                struggle to keep that information current, and residents struggle to find it.
              </p>
              <p>
                The demand is real. In 2023, 28.3% of Americans volunteered through an organization<Cite id="americorps" />, and research has long linked
                involvement in clubs and community service with stronger academic and personal outcomes for teens<Cite id="eccles" />. Support matters
                too: 42% of U.S. high school students reported persistent feelings of sadness or hopelessness in 2021<Cite id="cdc" />, which is why
                mental-wellness groups are featured prominently on the hub.
              </p>
            </div>
          </section>

          {/* Audience */}
          <section aria-labelledby="audience" className="mt-24">
            <SectionTitle id="audience" eyebrow="Who it’s for">
              Built for three groups
            </SectionTitle>
            <ul className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {AUDIENCE.map(({ Icon, title, body }) => (
                <li key={title} className="rounded-3xl border border-white/10 bg-white/[0.03] p-7">
                  <Icon aria-hidden="true" className="mb-4 h-8 w-8 text-teal-300" />
                  <h3 className="mb-2 text-xl font-bold text-white">{title}</h3>
                  <p className="leading-relaxed text-gray-300">{body}</p>
                </li>
              ))}
            </ul>
          </section>

          {/* What you can find */}
          <section aria-labelledby="find" className="mt-24">
            <SectionTitle id="find" eyebrow="What we manage">
              Four kinds of resources
            </SectionTitle>
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {KIND_ORDER.map((k, i) => {
                const Icon = ICONS[k];
                const kind = KINDS[k];
                return (
                  <motion.li
                    key={k}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: i * 0.1, ease: EASE }}
                  >
                    <TiltCard className="h-full" glow={kind.glow}>
                      <div className="p-7">
                        <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-gradient-to-br from-white/15 to-white/[0.02]">
                          <Icon aria-hidden="true" className={`h-6 w-6 ${kind.text}`} />
                        </div>
                        <h3 className="mb-2 font-sans text-xl font-bold text-white">{kind.plural}</h3>
                        <p className="font-sans text-sm leading-relaxed text-gray-300">{BLURBS[k]}</p>
                      </div>
                    </TiltCard>
                  </motion.li>
                );
              })}
            </ul>
          </section>

          {/* Features */}
          <section aria-labelledby="features" className="mt-24">
            <SectionTitle id="features" eyebrow="How it works">
              Tools for managing resources
            </SectionTitle>
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map(({ Icon, title, body }) => (
                <li key={title} className="flex gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                  <Icon aria-hidden="true" className="h-7 w-7 shrink-0 text-indigo-300" />
                  <div>
                    <h3 className="mb-1 text-lg font-bold text-white">{title}</h3>
                    <p className="text-sm leading-relaxed text-gray-300">
                      {body}
                      {title === "Works everywhere" && <Cite id="pew" />}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Accessibility statement */}
          <section id="accessibility" aria-labelledby="a11y" className="mt-24 scroll-mt-32">
            <SectionTitle id="a11y" eyebrow="Inclusive design">
              Accessibility statement
            </SectionTitle>
            <p className="mb-6 text-lg leading-relaxed text-gray-300">
              CLT CommunityHub is designed to meet the Web Content Accessibility Guidelines (WCAG) 2.2 at Level AA<Cite id="wcag" /> and follows
              established usability heuristics<Cite id="nngroup" />. Here is what that means in practice:
            </p>
            <ul className="space-y-3">
              {A11Y_POINTS.map((point) => (
                <li key={point} className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-gray-200">
                  <span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 rounded-full bg-teal-300" />
                  {point}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-gray-300">
              Found something hard to use? Tell us through the{" "}
              <Link href="/join-us" className="font-semibold text-white underline underline-offset-4">
                contact and registration form
              </Link>
              , and we will fix it.
            </p>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
