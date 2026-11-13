"use client";

import { AnimatePresence, motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { HiBookOpen, HiAcademicCap, HiUserGroup, HiX, HiArrowRight, HiLockClosed, HiDocumentText, HiAdjustments } from "react-icons/hi";
import PageBackdrop from "@/components/fx/PageBackdrop";
import TiltCard from "@/components/fx/TiltCard";
import SiteFooter from "@/components/SiteFooter";
import { useDialog } from "@/lib/useDialog";

const EASE = [0.22, 1, 0.36, 1] as const;

function ResourceRow({
  Icon,
  title,
  body,
  locked = false,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
  locked?: boolean;
}) {
  return (
    <div className="flex items-center gap-5 p-5">
      <div className="relative inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-gradient-to-br from-white/15 to-white/[0.02]">
        <span aria-hidden className="absolute inset-0 rounded-2xl bg-indigo-400/30 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />
        <Icon aria-hidden="true" className="relative h-7 w-7 text-white" />
      </div>
      <div className="flex-1 text-left">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
          {title}
          {locked && (
            <>
              <HiLockClosed className="h-4 w-4 text-gray-400" aria-hidden="true" />
              <span className="sr-only">(sign-in required)</span>
            </>
          )}
        </h2>
        <p className="text-sm text-gray-300">{body}</p>
      </div>
      <HiArrowRight aria-hidden="true" className="h-5 w-5 shrink-0 text-gray-400 transition-all duration-300 group-hover:translate-x-1 group-hover:text-white" />
    </div>
  );
}

export default function ResourcesPage() {
  const router = useRouter();
  const [showSignInPopup, setShowSignInPopup] = useState(false);
  const dialogRef = useDialog<HTMLDivElement>(showSignInPopup, () => setShowSignInPopup(false));

  const handleClubsMapClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowSignInPopup(true);
  };

  const handleGoToSignIn = () => {
    setShowSignInPopup(false);
    router.push("/signin");
  };

  return (
    <div className="bg-site relative min-h-screen overflow-hidden">
      <PageBackdrop />
      <Navbar />

      <main id="main" tabIndex={-1} className="relative z-10 px-4 pb-32 pt-36 outline-none md:px-12">
        <div className="mx-auto w-full max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE }}
            className="mb-10"
          >
            <h1
              className="mb-4 text-5xl font-bold tracking-tight text-white md:text-6xl"
              style={{ fontFamily: "Nunito, sans-serif", fontWeight: 800 }}
            >
              <span className="text-shimmer">Resources</span>
            </h1>
            <p className="text-lg leading-relaxed text-gray-400 md:text-xl">
              Everything you need to find, use and contribute to Charlotte&apos;s community resources.
            </p>
          </motion.div>

          <div className="space-y-4">
            {[
              { kind: "button" as const, Icon: HiUserGroup, title: "Clubs & Map", body: "Browse clubs and find your community on the dashboard.", locked: true },
              { kind: "link" as const, href: "/join-us", Icon: HiAcademicCap, title: "Join Us", body: "Register to become part of CLT CommunityHub." },
              { kind: "link" as const, href: "/get-started", Icon: HiBookOpen, title: "Get Started", body: "Create a free account to unlock the map, meeting details, reviews and the AI assistant." },
              { kind: "link" as const, href: "/about#accessibility", Icon: HiAdjustments, title: "Accessibility", body: "See how the site supports keyboard, screen-reader and low-vision users." },
              { kind: "link" as const, href: "/sources", Icon: HiDocumentText, title: "Sources & Citations", body: "The research and data behind the statistics on this site." },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 + i * 0.1, ease: EASE }}
              >
                <TiltCard max={4}>
                  {item.kind === "button" ? (
                    <button type="button" onClick={handleClubsMapClick} aria-haspopup="dialog" className="block w-full rounded-3xl">
                      <ResourceRow Icon={item.Icon} title={item.title} body={item.body} locked={item.locked} />
                    </button>
                  ) : (
                    <Link href={item.href} className="block rounded-3xl">
                      <ResourceRow Icon={item.Icon} title={item.title} body={item.body} />
                    </Link>
                  )}
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <SiteFooter />

      {/* Sign In Required Popup */}
      <AnimatePresence>
        {showSignInPopup && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md"
            onClick={() => setShowSignInPopup(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="signin-required-title"
              aria-describedby="signin-required-desc"
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.3, ease: EASE }}
              onClick={(e) => e.stopPropagation()}
              className="relative mx-4 w-full max-w-md overflow-hidden rounded-3xl border border-white/15 bg-black/80 p-8 shadow-[0_20px_80px_-20px_rgba(165,180,252,0.5)] backdrop-blur-xl"
            >
              <span aria-hidden className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
              <div className="mb-6 flex items-center justify-between">
                <h2 id="signin-required-title" className="font-sans text-2xl font-bold text-white md:text-3xl">Sign In Required</h2>
                <button
                  onClick={() => setShowSignInPopup(false)}
                  className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
                  type="button"
                  aria-label="Close"
                >
                  <HiX aria-hidden="true" className="h-6 w-6" />
                </button>
              </div>

              <p id="signin-required-desc" className="mb-8 font-sans text-gray-300">
                You must be signed in to access the Clubs and Map features. Please sign in to continue.
              </p>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowSignInPopup(false)}
                  className="flex-1 rounded-xl border border-white/20 px-6 py-3 font-sans font-semibold text-white transition-all duration-300 hover:border-white/40 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button type="button" data-autofocus onClick={handleGoToSignIn} className="btn-primary flex-1 !rounded-xl px-6 py-3">
                  Sign In
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
