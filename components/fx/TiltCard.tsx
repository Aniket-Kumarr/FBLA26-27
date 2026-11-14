"use client";

import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";

type Props = {
  children: ReactNode;
  className?: string;
  /** max tilt in degrees */
  max?: number;
  /** accepted for backwards compatibility with existing call sites; no longer used for a
   *  cursor-following glow — hover now lifts the card and brightens its border instead. */
  glow?: string;
};

/**
 * Card that tilts toward the cursor in 3D. Content sits on a raised layer for parallax.
 * Hover state is a plain lift + border/background brighten — no light follows the pointer.
 */
export default function TiltCard({ children, className = "", max = 8 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const sx = useSpring(px, { stiffness: 180, damping: 18, mass: 0.4 });
  const sy = useSpring(py, { stiffness: 180, damping: 18, mass: 0.4 });

  const rotateX = useTransform(sy, [0, 1], [max, -max]);
  const rotateY = useTransform(sx, [0, 1], [-max, max]);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };
  const onLeave = () => {
    px.set(0.5);
    py.set(0.5);
  };

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      whileHover={reduce ? undefined : { y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      style={reduce ? undefined : { rotateX, rotateY, transformPerspective: 1000, transformStyle: "preserve-3d" }}
      className={`group relative rounded-3xl ${className}`}
    >
      <div className="relative h-full overflow-hidden rounded-[inherit] border border-white/10 bg-white/[0.03] backdrop-blur-xl transition-colors duration-300 group-hover:border-white/25 group-hover:bg-white/[0.05]">
        <div className="relative h-full" style={reduce ? undefined : { transform: "translateZ(30px)" }}>
          {children}
        </div>
      </div>
    </motion.div>
  );
}
