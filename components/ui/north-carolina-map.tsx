"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

interface MapProps {
  dots?: Array<{
    start: { lat: number; lng: number; label?: string };
    end: { lat: number; lng: number; label?: string };
  }>;
  lineColor?: string;
}

// North Carolina approximate bounds and center
const NC_CENTER_LAT = 35.5;
const NC_CENTER_LNG = -79.0;
const NC_WIDTH = 8.8; // degrees longitude
const NC_HEIGHT = 2.8; // degrees latitude

// Major NC cities for reference
const NC_CITIES = {
  charlotte: { lat: 35.2271, lng: -80.8431, name: "Charlotte" },
  raleigh: { lat: 35.7796, lng: -78.6382, name: "Raleigh" },
  greensboro: { lat: 36.0726, lng: -79.7920, name: "Greensboro" },
  durham: { lat: 35.9940, lng: -78.8986, name: "Durham" },
  asheville: { lat: 35.5951, lng: -82.5515, name: "Asheville" },
  wilmington: { lat: 34.2257, lng: -77.9447, name: "Wilmington" },
};

export default function NorthCarolinaMap({
  dots = [],
  lineColor = "#0ea5e9",
}: MapProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  // Project lat/lng to SVG coordinates (focused on NC)
  const projectPoint = (lat: number, lng: number) => {
    const x = ((lng - (NC_CENTER_LNG - NC_WIDTH / 2)) / NC_WIDTH) * 800;
    const y = ((NC_CENTER_LAT + NC_HEIGHT / 2 - lat) / NC_HEIGHT) * 400;
    return { x, y };
  };

  const createCurvedPath = (
    start: { x: number; y: number },
    end: { x: number; y: number }
  ) => {
    const midX = (start.x + end.x) / 2;
    const midY = Math.min(start.y, end.y) - 30;
    return `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`;
  };

  // Generate dots for North Carolina
  const generateNCDots = () => {
    const dots = [];
    const rows = 15;
    const cols = 20;
    
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const lat = NC_CENTER_LAT + NC_HEIGHT / 2 - (i / rows) * NC_HEIGHT;
        const lng = NC_CENTER_LNG - NC_WIDTH / 2 + (j / cols) * NC_WIDTH;
        // Only add dots that are roughly within NC bounds
        if (lat >= 33.8 && lat <= 36.6 && lng >= -84.3 && lng <= -75.5) {
          dots.push({ lat, lng });
        }
      }
    }
    return dots;
  };

  const ncDots = generateNCDots();

  // North Carolina outline path (more accurate shape)
  const getNCOutlinePath = () => {
    // More detailed border points following NC's actual shape
    const borderPoints = [
      { lat: 36.5882, lng: -75.5 },   // Northeast corner (Outer Banks)
      { lat: 36.5, lng: -76.0 },
      { lat: 36.4, lng: -76.5 },
      { lat: 36.3, lng: -77.0 },
      { lat: 36.2, lng: -77.5 },
      { lat: 36.1, lng: -78.0 },
      { lat: 36.0, lng: -78.5 },
      { lat: 36.0, lng: -79.0 },
      { lat: 36.0, lng: -79.5 },
      { lat: 36.0, lng: -80.0 },
      { lat: 36.0, lng: -80.5 },
      { lat: 36.0, lng: -81.0 },
      { lat: 35.8, lng: -81.5 },
      { lat: 35.6, lng: -82.0 },
      { lat: 35.4, lng: -82.5 },
      { lat: 35.2, lng: -83.0 },
      { lat: 35.0, lng: -83.5 },
      { lat: 34.8, lng: -84.0 },
      { lat: 34.6, lng: -84.3 },      // Southwest corner
      { lat: 34.4, lng: -84.0 },
      { lat: 34.2, lng: -83.5 },
      { lat: 34.0, lng: -83.0 },
      { lat: 33.9, lng: -82.5 },
      { lat: 33.85, lng: -82.0 },
      { lat: 33.8, lng: -81.5 },
      { lat: 33.8, lng: -81.0 },
      { lat: 33.8, lng: -80.5 },
      { lat: 33.8, lng: -80.0 },
      { lat: 33.8, lng: -79.5 },
      { lat: 33.85, lng: -79.0 },
      { lat: 34.0, lng: -78.5 },
      { lat: 34.2, lng: -78.0 },
      { lat: 34.4, lng: -77.5 },
      { lat: 34.6, lng: -77.0 },
      { lat: 34.8, lng: -76.5 },
      { lat: 35.0, lng: -76.0 },
      { lat: 35.2, lng: -75.8 },
      { lat: 35.4, lng: -75.6 },
      { lat: 35.6, lng: -75.5 },
      { lat: 36.0, lng: -75.5 },
      { lat: 36.3, lng: -75.5 },
      { lat: 36.5882, lng: -75.5 },   // Close the path
    ];
    
    const projected = borderPoints.map(p => projectPoint(p.lat, p.lng));
    let path = `M ${projected[0].x} ${projected[0].y}`;
    for (let i = 1; i < projected.length; i++) {
      path += ` L ${projected[i].x} ${projected[i].y}`;
    }
    path += ' Z';
    return path;
  };

  return (
    <div className="w-full aspect-[2/1] bg-black rounded-lg relative font-sans overflow-hidden">
      {/* North Carolina Map Image */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="/image.png"
          alt="North Carolina Map"
          fill
          className="object-contain"
          priority
        />
      </div>
      
      <svg
        ref={svgRef}
        viewBox="0 0 800 400"
        className="w-full h-full absolute inset-0 pointer-events-none select-none z-10"
      >

        {/* Connection lines */}
        {dots.map((dot, i) => {
          const startPoint = projectPoint(dot.start.lat, dot.start.lng);
          const endPoint = projectPoint(dot.end.lat, dot.end.lng);
          return (
            <g key={`path-group-${i}`}>
              <motion.path
                d={createCurvedPath(startPoint, endPoint)}
                fill="none"
                stroke="url(#path-gradient)"
                strokeWidth="1.5"
                initial={{
                  pathLength: 0,
                }}
                animate={{
                  pathLength: 1,
                }}
                transition={{
                  duration: 1,
                  delay: 0.5 * i,
                  ease: "easeOut",
                }}
              />
            </g>
          );
        })}

        <defs>
          <linearGradient id="path-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="5%" stopColor={lineColor} stopOpacity="1" />
            <stop offset="95%" stopColor={lineColor} stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Start and end points */}
        {dots.map((dot, i) => (
          <g key={`points-group-${i}`}>
            <g key={`start-${i}`}>
              <circle
                cx={projectPoint(dot.start.lat, dot.start.lng).x}
                cy={projectPoint(dot.start.lat, dot.start.lng).y}
                r="3"
                fill={lineColor}
              />
              <circle
                cx={projectPoint(dot.start.lat, dot.start.lng).x}
                cy={projectPoint(dot.start.lat, dot.start.lng).y}
                r="3"
                fill={lineColor}
                opacity="0.5"
              >
                <animate
                  attributeName="r"
                  from="3"
                  to="10"
                  dur="1.5s"
                  begin="0s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  from="0.5"
                  to="0"
                  dur="1.5s"
                  begin="0s"
                  repeatCount="indefinite"
                />
              </circle>
            </g>
            <g key={`end-${i}`}>
              <circle
                cx={projectPoint(dot.end.lat, dot.end.lng).x}
                cy={projectPoint(dot.end.lat, dot.end.lng).y}
                r="3"
                fill={lineColor}
              />
              <circle
                cx={projectPoint(dot.end.lat, dot.end.lng).x}
                cy={projectPoint(dot.end.lat, dot.end.lng).y}
                r="3"
                fill={lineColor}
                opacity="0.5"
              >
                <animate
                  attributeName="r"
                  from="3"
                  to="10"
                  dur="1.5s"
                  begin="0s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  from="0.5"
                  to="0"
                  dur="1.5s"
                  begin="0s"
                  repeatCount="indefinite"
                />
              </circle>
            </g>
          </g>
        ))}
      </svg>
    </div>
  );
}

