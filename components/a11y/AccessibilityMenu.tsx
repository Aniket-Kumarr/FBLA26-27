"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HiX } from "react-icons/hi";
import { useA11y, type A11yPrefs } from "./A11yProvider";
import { useDialog } from "@/lib/useDialog";

const OPTIONS: { key: keyof A11yPrefs; label: string; hint: string }[] = [
  { key: "largeText", label: "Larger text", hint: "Increases the size of all text by about 15%." },
  { key: "reduceMotion", label: "Reduce motion", hint: "Stops animations, the 3D scenes and scrolling tickers." },
  { key: "highContrast", label: "High contrast", hint: "Brightens secondary text and strengthens borders." },
  { key: "underlineLinks", label: "Underline links", hint: "Makes every link easy to spot without relying on color." },
  { key: "readableFont", label: "Readable font", hint: "Switches to a plain font with wider letter spacing." },
];

/** Universal-access icon (inline SVG so it inherits currentColor). */
function AccessIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="7" r="1.25" fill="currentColor" stroke="none" />
      <path d="M7 10l5 1 5-1M12 11v4l-2.5 4M12 15l2.5 4" />
    </svg>
  );
}

/**
 * Floating accessibility panel available on every page.
 * Each option is a real switch (role="switch") that works with mouse, touch and keyboard,
 * and choices are remembered between visits.
 */
export default function AccessibilityMenu() {
  const { prefs, setPref, reset } = useA11y();
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const dialogRef = useDialog<HTMLDivElement>(open, () => setOpen(false));

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="fixed bottom-6 left-6 z-[90] flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/80 text-white shadow-[0_0_30px_-8px_rgba(165,180,252,0.8)] backdrop-blur transition-colors hover:border-white/50 hover:bg-white/10"
      >
        <AccessIcon className="h-7 w-7" />
        <span className="sr-only">Accessibility settings</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[120] flex items-end justify-start bg-black/60 p-4 backdrop-blur-sm sm:p-6"
            onClick={() => setOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              tabIndex={-1}
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-sm rounded-3xl border border-white/15 bg-zinc-950 p-6 shadow-2xl"
            >
              <div className="mb-5 flex items-center justify-between">
                <h2 id={titleId} className="flex items-center gap-2 text-xl font-bold text-white">
                  <AccessIcon className="h-6 w-6 text-indigo-300" />
                  Accessibility
                </h2>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-1.5 text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <HiX className="h-5 w-5" aria-hidden="true" />
                  <span className="sr-only">Close accessibility settings</span>
                </button>
              </div>

              <ul className="space-y-2">
                {OPTIONS.map((o) => {
                  const on = prefs[o.key];
                  const hintId = `${titleId}-${o.key}`;
                  return (
                    <li key={o.key}>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={on}
                        aria-describedby={hintId}
                        onClick={() => setPref(o.key, !on)}
                        className={`flex w-full items-center justify-between gap-4 rounded-2xl border px-4 py-3 text-left transition-colors ${
                          on ? "border-indigo-300/60 bg-indigo-300/10" : "border-white/10 hover:border-white/30 hover:bg-white/5"
                        }`}
                      >
                        <span>
                          <span className="block font-semibold text-white">{o.label}</span>
                          <span id={hintId} className="block text-sm text-gray-300">
                            {o.hint}
                          </span>
                        </span>
                        <span
                          aria-hidden="true"
                          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${on ? "bg-indigo-300" : "bg-zinc-700"}`}
                        >
                          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>

              <button
                type="button"
                onClick={reset}
                className="mt-5 w-full rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-gray-200 transition-colors hover:bg-white/10 hover:text-white"
              >
                Reset to defaults
              </button>
              <p className="mt-3 text-center text-xs text-gray-400">
                Tip: press <kbd className="rounded border border-white/20 px-1">Tab</kbd> to move through the page and{" "}
                <kbd className="rounded border border-white/20 px-1">Esc</kbd> to close any pop-up.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
