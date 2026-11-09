"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { HiArrowRight, HiUserGroup, HiHeart, HiCalendar, HiSupport } from "react-icons/hi";
import PageBackdrop from "@/components/fx/PageBackdrop";
import TiltCard from "@/components/fx/TiltCard";
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
  nonprofit: "Discover local organizations doing good — and how to help.",
  event: "See fundraisers, races and workshops happening around town.",
  service: "Get tutoring, volunteer connections and local help you need.",
};

export default function AboutPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      <PageBackdrop />
      <Navbar />

      <section className="relative z-10 px-4 pb-32 pt-36 md:px-12">
        <div className="mx-auto w-full max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <TiltCard max={3}>
              <div className="p-8 md:p-14">
                <span className="mb-6 inline-block rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-gray-300">
                  Our mission
                </span>
                <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-white md:text-7xl" style={{ fontFamily: "Nunito, sans-serif" }}>
                  About <span className="text-shimmer">CLT CommunityHub</span>
                </h1>
                <p className="mb-6 text-xl leading-relaxed text-gray-200 md:text-2xl">
                  CLT CommunityHub is your all-in-one platform for academic success, resources, and community connection in Charlotte.
                </p>
                <p className="mb-10 text-lg leading-relaxed text-gray-400 md:text-xl">
                  We help people in the Charlotte area find clubs, non-profits, events, and services that they need.
                </p>
                <Link href="/get-started" className="btn-primary group px-8 py-4 text-lg">
                  <span className="relative z-10">Get Started</span>
                  <HiArrowRight className="relative z-10 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  <span aria-hidden className="btn-sheen" />
                </Link>
              </div>
            </TiltCard>
          </motion.div>

          <h2 className="mb-6 mt-16 text-center text-sm font-bold uppercase tracking-[0.25em] text-gray-500">What you can find</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {KIND_ORDER.map((k, i) => {
              const Icon = ICONS[k];
              const kind = KINDS[k];
              return (
                <motion.div
                  key={k}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.25 + i * 0.1, ease: EASE }}
                >
                  <TiltCard className="h-full" glow={kind.glow}>
                    <div className="p-7">
                      <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-gradient-to-br from-white/15 to-white/[0.02]">
                        <Icon className={`h-6 w-6 ${kind.text}`} />
                      </div>
                      <h3 className="mb-2 font-sans text-xl font-bold text-white">{kind.plural}</h3>
                      <p className="font-sans text-sm leading-relaxed text-gray-400">{BLURBS[k]}</p>
                    </div>
                  </TiltCard>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
