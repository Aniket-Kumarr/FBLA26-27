import Link from "next/link";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import PageBackdrop from "@/components/fx/PageBackdrop";

export default function NotFound() {
  return (
    <div className="bg-site relative min-h-screen overflow-hidden">
      <PageBackdrop />
      <Navbar />
      <main id="main" tabIndex={-1} className="relative z-10 flex min-h-[70vh] items-center justify-center px-4 pt-32 text-center outline-none">
        <div className="max-w-xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-gray-300">Error 404</p>
          <h1 className="mb-4 text-5xl font-extrabold text-white md:text-6xl" style={{ fontFamily: "Nunito, sans-serif" }}>
            We couldn&apos;t find that page
          </h1>
          <p className="mb-10 text-lg text-gray-300">The link may be out of date, or the page may have moved. Try one of these instead:</p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/" className="btn-primary px-8 py-4 text-lg">
              Go to the home page
            </Link>
            <Link href="/resources" className="btn-glass px-8 py-4 text-lg">
              Browse resources
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
