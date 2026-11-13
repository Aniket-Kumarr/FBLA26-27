"use client";

import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useState, type ReactNode } from "react";
import { MotionConfig } from "framer-motion";

export type A11yPrefs = {
  largeText: boolean;
  reduceMotion: boolean;
  highContrast: boolean;
  underlineLinks: boolean;
  readableFont: boolean;
};

export const DEFAULT_PREFS: A11yPrefs = {
  largeText: false,
  reduceMotion: false,
  highContrast: false,
  underlineLinks: false,
  readableFont: false,
};

/** Each preference maps to a class on <html>; globals.css does the rest. */
export const PREF_CLASS: Record<keyof A11yPrefs, string> = {
  largeText: "a11y-large-text",
  reduceMotion: "a11y-reduce-motion",
  highContrast: "a11y-high-contrast",
  underlineLinks: "a11y-underline-links",
  readableFont: "a11y-readable-font",
};

export const STORAGE_KEY = "clt-a11y-prefs";

type Ctx = {
  prefs: A11yPrefs;
  setPref: (key: keyof A11yPrefs, value: boolean) => void;
  reset: () => void;
};

const A11yContext = createContext<Ctx | null>(null);

// layout effect on the client so <html> classes are set before children's effects read them
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function A11yProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<A11yPrefs>(DEFAULT_PREFS);

  // load saved preferences (and respect the OS "reduce motion" setting by default)
  useEffect(() => {
    let saved: Partial<A11yPrefs> = {};
    try {
      saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    } catch {
      /* storage blocked — fall back to defaults */
    }
    const osReduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setPrefs({ ...DEFAULT_PREFS, reduceMotion: osReduce, ...saved });
  }, []);

  useIsoLayoutEffect(() => {
    const html = document.documentElement;
    (Object.keys(PREF_CLASS) as (keyof A11yPrefs)[]).forEach((k) => html.classList.toggle(PREF_CLASS[k], prefs[k]));
  }, [prefs]);

  const setPref = useCallback((key: keyof A11yPrefs, value: boolean) => {
    setPrefs((p) => {
      const next = { ...p, [key]: value };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setPrefs({ ...DEFAULT_PREFS, reduceMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches });
  }, []);

  return (
    <A11yContext.Provider value={{ prefs, setPref, reset }}>
      <MotionConfig reducedMotion={prefs.reduceMotion ? "always" : "user"}>{children}</MotionConfig>
    </A11yContext.Provider>
  );
}

export function useA11y() {
  const ctx = useContext(A11yContext);
  if (!ctx) throw new Error("useA11y must be used inside <A11yProvider>");
  return ctx;
}

/** True when motion should be minimised (OS setting or the on-site toggle). */
export function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return (
    document.documentElement.classList.contains(PREF_CLASS.reduceMotion) ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
