"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { HiBookOpen, HiAcademicCap, HiUserGroup, HiX } from "react-icons/hi";

export default function ResourcesPage() {
  const router = useRouter();
  const [showSignInPopup, setShowSignInPopup] = useState(false);

  const handleClubsMapClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowSignInPopup(true);
  };

  const handleGoToSignIn = () => {
    setShowSignInPopup(false);
    router.push("/signin");
  };

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
      <Navbar />

      <section className="pt-32 pb-32 px-4 md:px-12 relative z-10">
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
                <button
                  onClick={handleClubsMapClick}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-700 hover:border-gray-500 hover:bg-white/5 transition-all text-left group"
                >
                  <HiUserGroup className="h-8 w-8 text-gray-400 group-hover:text-white" />
                  <div>
                    <h2 className="text-xl font-semibold text-white">Clubs & Map</h2>
                    <p className="text-gray-400 text-sm">Browse clubs and find your community on the dashboard.</p>
                  </div>
                </button>
                <Link
                  href="/join-us"
                  className="flex items-center gap-4 p-4 rounded-xl border-2 border-gray-700 hover:border-gray-500 hover:bg-white/5 transition-all text-left group"
                >
                  <HiAcademicCap className="h-8 w-8 text-gray-400 group-hover:text-white" />
                  <div>
                    <h2 className="text-xl font-semibold text-white">Join Us</h2>
                    <p className="text-gray-400 text-sm">Register to become part of CLT CommunityHub.</p>
                  </div>
                </Link>
                <Link
                  href="/get-started"
                  className="flex items-center gap-4 p-4 rounded-xl border-2 border-gray-700 hover:border-gray-500 hover:bg-white/5 transition-all text-left group"
                >
                  <HiBookOpen className="h-8 w-8 text-gray-400 group-hover:text-white" />
                  <div>
                    <h2 className="text-xl font-semibold text-white">Get Started</h2>
                    <p className="text-gray-400 text-sm">Create an account to access all features.</p>
                  </div>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Sign In Required Popup */}
      {showSignInPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setShowSignInPopup(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-black border-2 border-gray-700 rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-white font-sans">Sign In Required</h2>
              <button
                onClick={() => setShowSignInPopup(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <HiX className="h-6 w-6" />
              </button>
            </div>

            <p className="text-gray-300 mb-8 font-sans">
              You must be signed in to access the Clubs and Map features. Please sign in to continue.
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => setShowSignInPopup(false)}
                className="flex-1 px-6 py-3 font-sans font-semibold text-white transition-all duration-300 border-2 border-gray-600 hover:bg-gray-900 hover:border-gray-500 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleGoToSignIn}
                className="flex-1 px-6 py-3 font-sans font-bold text-black transition-all duration-300 bg-white text-black hover:bg-gray-100 rounded-xl"
              >
                Sign In
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
