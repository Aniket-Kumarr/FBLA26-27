"use client";

import { motion } from "framer-motion";
import DashboardNavbar from "@/components/DashboardNavbar";
import Link from "next/link";

export default function DashboardAboutPage() {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "url(/ctl.png)",
          backgroundRepeat: "repeat",
          backgroundSize: "180px 180px",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900/30 via-transparent to-gray-900/20 pointer-events-none" />
      <DashboardNavbar />

      <main id="main" tabIndex={-1} className="outline-none pt-32 pb-32 px-4 md:px-12 relative z-10">
        <div className="w-full max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-black border-2 border-gray-700 rounded-3xl p-8 md:p-12 shadow-2xl"
          >
            <h1
              className="text-4xl md:text-5xl font-bold text-white mb-6"
              style={{ fontFamily: "Nunito, sans-serif", fontWeight: 700 }}
            >
              About CLT CommunityHub
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed mb-6">
              CLT CommunityHub is your all-in-one platform for academic success, resources, and community connection in Charlotte.
            </p>
            <p className="text-gray-400 text-lg leading-relaxed mb-8">
              We help people in the Charlotte area find clubs, non-profits, events, and services that they need.
            </p>
            <Link
              href="/dashboard"
              className="inline-block bg-white text-black hover:bg-gray-100 text-lg font-semibold px-8 py-4 rounded-xl transition-all duration-300 font-sans"
            >
              Back to Dashboard
            </Link>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

