"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { HiExternalLink, HiClipboardList, HiCheck } from "react-icons/hi";
import PageBackdrop from "@/components/fx/PageBackdrop";
import TiltCard from "@/components/fx/TiltCard";
import SiteFooter from "@/components/SiteFooter";
import Link from "next/link";

const EASE = [0.22, 1, 0.36, 1] as const;

const JOIN_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSdWY53ai41_c50AusSUYvlDHh2AtvQW3xhLSykuSmrDptXAeg/viewform";

const steps = [
  "Click the button below to open the official form",
  "Fill out your details (it takes about a minute)",
  "We'll review your request and connect you to CLT CommunityHub",
];

export default function JoinUsPage() {
  return (
    <div className="bg-site relative min-h-screen overflow-hidden">
      <PageBackdrop />
      <Navbar />

      <main id="main" tabIndex={-1} className="relative z-10 flex min-h-[calc(100vh-6rem)] items-center justify-center px-4 pb-32 pt-36 outline-none md:px-12">
        <div className="mx-auto w-full max-w-2xl">
          {/* Official join card */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <TiltCard max={4}>
              <div className="p-8 text-center md:p-12">
                <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-gray-300">
                  <HiClipboardList aria-hidden="true" className="h-4 w-4" />
                  Official registration
                </div>

                <h1
                  className="mb-4 text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl"
                  style={{ fontFamily: "Nunito, sans-serif", fontWeight: 800 }}
                >
                  Join <span className="text-shimmer">CLT CommunityHub</span>
                </h1>
                <p className="mx-auto mb-10 max-w-md text-lg text-gray-400 md:text-xl">
                  Want to join, or list your organization on the hub? Submit one quick form and
                  our team will follow up with next steps.
                </p>

                <motion.a
                  href={JOIN_FORM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary group px-10 py-5 text-lg"
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="relative z-10">Open registration form</span>
                  <HiExternalLink aria-hidden="true" className="relative z-10 h-5 w-5" />
                  <span className="sr-only">(opens Google Forms in a new tab)</span>
                  <span aria-hidden className="btn-sheen" />
                </motion.a>

                {/* Steps */}
                <div className="mt-12 border-t border-white/10 pt-10 text-left">
                  <p className="mb-6 text-sm font-semibold uppercase tracking-wider text-gray-400">How it works</p>
                  <ul className="relative space-y-5">
                    <li aria-hidden className="pointer-events-none absolute bottom-3 left-[13px] top-3 w-px bg-gradient-to-b from-indigo-300/50 via-white/20 to-teal-300/50" />
                    {steps.map((step, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 + i * 0.12, ease: EASE }}
                        className="relative flex items-start gap-4 text-gray-300"
                      >
                        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-white/20 bg-black shadow-[0_0_16px_-4px_rgba(165,180,252,0.8)]">
                          <HiCheck aria-hidden="true" className="h-3.5 w-3.5 text-white" />
                        </span>
                        <span className="pt-0.5 font-sans">{step}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>
            </TiltCard>
          </motion.div>

          <p className="mt-8 text-center text-sm text-gray-400">
            Already have access?{" "}
            <Link href="/signin" className="text-gray-200 underline underline-offset-4 transition-colors hover:text-white">
              Sign in
            </Link>
          </p>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
