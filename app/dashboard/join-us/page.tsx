"use client";

import { motion } from "framer-motion";
import DashboardNavbar from "@/components/DashboardNavbar";
import { HiExternalLink, HiClipboardList, HiCheck } from "react-icons/hi";

const JOIN_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSdWY53ai41_c50AusSUYvlDHh2AtvQW3xhLSykuSmrDptXAeg/viewform";

const steps = [
  "Click the button below to open the official form",
  "Fill out your details (it takes about a minute)",
  "We'll get you connected to CLT CommunityHub",
];

export default function DashboardJoinUsPage() {
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

      <main id="main" tabIndex={-1} className="outline-none pt-32 pb-32 px-4 md:px-12 relative z-10 flex items-center justify-center min-h-[calc(100vh-6rem)]">
        <div className="w-full max-w-2xl mx-auto">
          {/* Official join card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-black border-2 border-gray-700 rounded-3xl p-8 md:p-12 shadow-2xl text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-600 bg-gray-900/50 text-gray-400 text-sm font-medium mb-8">
              <HiClipboardList aria-hidden="true" className="h-4 w-4" />
              Official registration
            </div>

            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight"
              style={{ fontFamily: "Nunito, sans-serif", fontWeight: 700 }}
            >
              Join CLT CommunityHub
            </h1>
            <p className="text-gray-400 text-lg md:text-xl mb-10 max-w-md mx-auto">
              Become part of the community. Use the form below to register, and we&apos;ll
              reach out once you&apos;re in.
            </p>

            <motion.a
              href={JOIN_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-white text-black hover:bg-gray-100 text-lg font-semibold px-10 py-5 rounded-xl transition-all duration-300 font-sans shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              Open registration form
              <HiExternalLink aria-hidden="true" className="h-5 w-5" />
            </motion.a>

            {/* Steps */}
            <div className="mt-12 pt-10 border-t border-gray-700 text-left">
              <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-4">
                How it works
              </p>
              <ul className="space-y-4">
                {steps.map((step, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                    className="flex items-start gap-3 text-gray-300"
                  >
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center">
                      <HiCheck aria-hidden="true" className="h-3.5 w-3.5 text-white" />
                    </span>
                    <span className="font-sans">{step}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>

          <p className="text-center text-gray-400 text-sm mt-8">
            <a
              href="/dashboard"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Back to Dashboard
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}

