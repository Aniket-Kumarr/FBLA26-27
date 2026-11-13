"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  HiHome,
  HiInformationCircle,
  HiBookOpen,
  HiUsers,
  HiArrowRight,
  HiDocumentText,
} from "react-icons/hi";

const navLinks = [
  { href: "/", label: "Home", icon: HiHome },
  { href: "/about", label: "About", icon: HiInformationCircle },
  { href: "/resources", label: "Resources", icon: HiBookOpen },
  { href: "/join-us", label: "Join Us", icon: HiUsers },
  { href: "/sources", label: "Sources", icon: HiDocumentText },
];

/** `solid` drops the see-through blur, which is costly to draw over an animated page. */
export default function Navbar({ solid = false }: { solid?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const pathname = usePathname();

  // close the mobile menu on Escape or when the route changes
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen]);
  useEffect(() => setIsOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // the pill sits under the hovered link, falling back to the current page
  const highlighted = hovered ?? pathname;

  return (
    <header className={`fixed top-0 z-50 w-full px-4 transition-[padding] duration-500 ${scrolled ? "py-3" : "py-5"}`}>
      <div
        className={`container relative mx-auto flex items-center justify-between rounded-3xl border px-6 transition-all duration-500 ${
          solid ? "bg-[#1c1917]" : "backdrop-blur-xl"
        } ${
          scrolled
            ? `h-16 border-white/15 ${solid ? "shadow-[0_8px_24px_-10px_rgba(0,0,0,0.6)]" : "bg-black/70 shadow-[0_8px_40px_-12px_rgba(165,180,252,0.25)]"}`
            : `h-20 border-white/10 ${solid ? "" : "bg-black/40"}`
        }`}
      >
        {/* hairline highlight along the top edge */}
        <span aria-hidden className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

        {/* Logo */}
        <Link href="/" className="group flex items-center gap-3" aria-label="CLT CommunityHub home">
          <div className="relative">
            <span aria-hidden className="absolute inset-0 rounded-full bg-indigo-400/30 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />
            <Image
              src="/ctl.png"
              alt=""
              width={44}
              height={44}
              priority
              className="relative object-contain transition-transform duration-500 group-hover:rotate-[8deg] group-hover:scale-105"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold leading-none tracking-tight text-white">CLT</span>
            <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.25em] text-gray-400">
              Community Hub
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex" onMouseLeave={() => setHovered(null)}>
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onMouseEnter={() => setHovered(link.href)}
                aria-current={active ? "page" : undefined}
                className={`relative flex items-center gap-2 rounded-xl px-4 py-2 font-sans text-[15px] font-semibold transition-colors ${
                  active ? "text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                {highlighted === link.href && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-xl border border-white/10 bg-white/[0.08]"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <Icon aria-hidden="true" className="relative h-[18px] w-[18px]" />
                <span className="relative">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/signin"
            className="rounded-xl border border-white/15 px-4 py-2 font-sans text-[15px] font-semibold text-gray-300 transition-colors hover:border-white/30 hover:bg-white/5 hover:text-white"
          >
            Sign In
          </Link>
          <Link href="/get-started" className="btn-primary group !rounded-xl px-5 py-2 text-[15px]">
            <span className="relative z-10">Get Started</span>
            <HiArrowRight className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            <span aria-hidden className="btn-sheen" />
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-11 w-11 items-center justify-center rounded-xl transition-colors hover:bg-white/10 lg:hidden"
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
        >
          <span aria-hidden="true" className="relative block h-4 w-5">
            <span className={`absolute left-0 top-0 h-0.5 w-5 rounded bg-white transition-all duration-300 ${isOpen ? "top-[7px] rotate-45" : ""}`} />
            <span className={`absolute left-0 top-[7px] h-0.5 w-5 rounded bg-white transition-opacity duration-300 ${isOpen ? "opacity-0" : ""}`} />
            <span className={`absolute left-0 top-[14px] h-0.5 w-5 rounded bg-white transition-all duration-300 ${isOpen ? "top-[7px] -rotate-45" : ""}`} />
          </span>
          <span className="sr-only">{isOpen ? "Close menu" : "Open menu"}</span>
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-4 top-24 z-40 overflow-hidden rounded-3xl border border-white/15 bg-black/90 shadow-2xl backdrop-blur-xl lg:hidden"
          >
            <nav aria-label="Mobile" className="py-3">
              {navLinks.map((link, i) => {
                const Icon = link.icon;
                const active = pathname === link.href;
                return (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 * i }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={`mx-2 flex items-center gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-white/10 hover:text-white ${
                        active ? "bg-white/[0.08] text-white" : "text-gray-300"
                      }`}
                    >
                      <Icon aria-hidden="true" className="h-6 w-6" />
                      <span className="font-sans text-base font-semibold">{link.label}</span>
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            <div className="space-y-3 border-t border-white/10 p-4">
              <Link
                href="/signin"
                className="block w-full rounded-xl border border-white/15 px-4 py-2.5 text-center font-sans text-base font-semibold text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                Sign In
              </Link>
              <Link href="/get-started" className="btn-primary flex w-full !rounded-xl px-4 py-2.5 text-base">
                Get Started
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
