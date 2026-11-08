"use client";
import NorthCarolinaMap from "@/components/ui/north-carolina-map";
import { motion } from "framer-motion";

export default function NorthCarolinaMapDemo() {
  return (
    <div className="w-full py-40 bg-black">
      <div className="mx-auto text-center max-w-7xl">
        <p className="text-xl font-bold text-white md:text-4xl">
          North Carolina{" "}
          <span className="text-neutral-400">
            {"Connectivity".split("").map((word, idx) => (
              <motion.span
                key={idx}
                className="inline-block"
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: idx * 0.04 }}
              >
                {word}
              </motion.span>
            ))}
          </span>
        </p>
        <p className="max-w-2xl py-4 mx-auto text-sm md:text-lg text-neutral-500">
          Connecting students across North Carolina. Join the CLT CommunityHub community
          and connect with peers throughout the state.
        </p>
      </div>
      <NorthCarolinaMap
        dots={[
          {
            start: {
              lat: 35.2271,
              lng: -80.8431,
            }, // Charlotte
            end: {
              lat: 35.7796,
              lng: -78.6382,
            }, // Raleigh
          },
          {
            start: { lat: 35.2271, lng: -80.8431 }, // Charlotte
            end: { lat: 36.0726, lng: -79.7920 }, // Greensboro
          },
          {
            start: { lat: 35.7796, lng: -78.6382 }, // Raleigh
            end: { lat: 35.9940, lng: -78.8986 }, // Durham
          },
          {
            start: { lat: 35.2271, lng: -80.8431 }, // Charlotte
            end: { lat: 35.5951, lng: -82.5515 }, // Asheville
          },
          {
            start: { lat: 35.7796, lng: -78.6382 }, // Raleigh
            end: { lat: 34.2257, lng: -77.9447 }, // Wilmington
          },
        ]}
      />
    </div>
  );
}


