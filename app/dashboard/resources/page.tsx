"use client";

import { motion } from "framer-motion";
import DashboardNavbar from "@/components/DashboardNavbar";
import Link from "next/link";
import { HiBookOpen, HiAcademicCap, HiUserGroup, HiMap } from "react-icons/hi";

export default function DashboardResourcesPage() {
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
            className="space-y-8"
          >
            <div className="bg-black border-2 border-gray-700 rounded-3xl p-8 md:p-12 shadow-2xl">
              <h1
                className="text-4xl md:text-5xl font-bold text-white mb-6"
                style={{ fontFamily: "Nunito, sans-serif", fontWeight: 700 }}
              >
                Resources
              </h1>
              <p className="text-gray-400 text-lg leading-relaxed mb-8">
                Tools and links to help you succeed at CLT CommunityHub.
              </p>

              <div className="space-y-4">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-4 p-4 rounded-xl border-2 border-gray-700 hover:border-gray-500 hover:bg-white/5 transition-all text-left group"
                >
                  <HiMap aria-hidden="true" className="h-8 w-8 text-gray-400 group-hover:text-white" />
                  <div>
                    <h2 className="text-xl font-semibold text-white">Clubs & Map</h2>
                    <p className="text-gray-400 text-sm">Browse clubs and find your community on the dashboard.</p>
                  </div>
                </Link>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-4 p-4 rounded-xl border-2 border-gray-700 hover:border-gray-500 hover:bg-white/5 transition-all text-left group"
                >
                  <HiUserGroup aria-hidden="true" className="h-8 w-8 text-gray-400 group-hover:text-white" />
                  <div>
                    <h2 className="text-xl font-semibold text-white">All Clubs</h2>
                    <p className="text-gray-400 text-sm">View all available clubs and their details.</p>
                  </div>
                </Link>
                <Link
                  href="/join-us"
                  className="flex items-center gap-4 p-4 rounded-xl border-2 border-gray-700 hover:border-gray-500 hover:bg-white/5 transition-all text-left group"
                >
                  <HiAcademicCap aria-hidden="true" className="h-8 w-8 text-gray-400 group-hover:text-white" />
                  <div>
                    <h2 className="text-xl font-semibold text-white">Join Us</h2>
                    <p className="text-gray-400 text-sm">Register to become part of CLT CommunityHub.</p>
                  </div>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

