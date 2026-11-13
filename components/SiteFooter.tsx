import Link from "next/link";
import Image from "next/image";
import { KINDS, KIND_ORDER } from "@/lib/communityData";

const HUB_LINKS = [
  { href: "/about", label: "About" },
  { href: "/resources", label: "Resources" },
  { href: "/join-us", label: "Join Us" },
  { href: "/sources", label: "Sources & Citations" },
  { href: "/about#accessibility", label: "Accessibility" },
];

const ACCOUNT_LINKS = [
  { href: "/get-started", label: "Create an account" },
  { href: "/signin", label: "Sign In" },
  { href: "/dashboard", label: "Dashboard" },
];

/** Shared footer used on every public page so navigation stays consistent. */
export default function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-white/10 px-4 pb-24 pt-16 md:px-12" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Site footer
      </h2>
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 sm:grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr]">
        <div className="sm:col-span-2 md:col-span-1">
          <Link href="/" className="mb-5 flex w-fit items-center gap-3">
            <Image src="/ctl.png" alt="" width={40} height={40} className="object-contain" />
            <span className="text-xl font-bold text-white">CLT CommunityHub</span>
          </Link>
          <p className="max-w-md leading-relaxed text-gray-300">
            A digital resource management platform for Charlotte, NC. We collect the clubs, non-profits, events, and services people need into one
            searchable, mapped directory, so residents spend less time searching and more time getting involved.
          </p>
        </div>

        <nav aria-label="Explore by type">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-gray-400">Explore</h3>
          <ul className="space-y-3">
            {KIND_ORDER.map((k) => (
              <li key={k}>
                <Link href="/#explore" className="inline-flex items-center gap-2 text-gray-300 transition-colors hover:text-white">
                  <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${KINDS[k].dot}`} />
                  {KINDS[k].plural}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="About the hub">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-gray-400">Hub</h3>
          <ul className="space-y-3">
            {HUB_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-gray-300 transition-colors hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Account">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-gray-400">Account</h3>
          <ul className="space-y-3">
            {ACCOUNT_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-gray-300 transition-colors hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="mx-auto mt-14 flex max-w-7xl flex-col items-center justify-between gap-3 border-t border-white/10 pt-8 text-sm text-gray-400 md:flex-row">
        <p>© {new Date().getFullYear()} CLT CommunityHub · Charlotte, NC</p>
        <p>
          Map data © <a href="https://www.openstreetmap.org/copyright" className="underline-offset-4 hover:text-white hover:underline">OpenStreetMap</a> contributors ·{" "}
          <Link href="/sources" className="underline-offset-4 hover:text-white hover:underline">
            Full credits
          </Link>
        </p>
      </div>
    </footer>
  );
}
