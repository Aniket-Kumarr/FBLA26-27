"use client";

import { motion } from "framer-motion";
import { HiStar } from "react-icons/hi";
import TiltCard from "@/components/fx/TiltCard";
import { SECTION_STYLE, type DashboardSection } from "@/lib/communityData";
import { sectionIcon } from "./sectionIcon";
import type { Club, Review } from "@/app/dashboard/page";

type Props = {
  club: Club;
  section: DashboardSection;
  reviews: Review[];
  expanded: boolean;
  onToggleDescription: () => void;
  onOpenReview: () => void;
  index: number;
  highContrast: boolean;
  /** createdAt of a review that was just posted, so it can flash once on this card. */
  highlightReview?: string | null;
  reduceMotion?: boolean;
};

/** One listing card: a TiltCard shell (tilt + lift on hover, no cursor-following glow),
 *  a category chip/icon in that section's colour, and the same description/review content
 *  the dashboard already had. */
export default function ClubCard({ club, section, reviews, expanded, onToggleDescription, onOpenReview, index, highContrast, highlightReview, reduceMotion }: Props) {
  const style = SECTION_STYLE[section];
  const Icon = sectionIcon(section);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: Math.min(index, 10) * 0.05 }}>
      <TiltCard max={4} className="h-full">
        <article className="flex h-full flex-col p-5">
          <div className="mb-2 flex items-start justify-between gap-3">
            <div>
              <span
                className="mb-2 inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
                style={{
                  borderColor: highContrast ? "#ffffff" : `${style.hex}55`,
                  background: highContrast ? "#000" : `${style.hex}1a`,
                  color: highContrast ? "#ffffff" : style.hex,
                }}
              >
                <Icon aria-hidden="true" className="h-3 w-3" />
                {section}
              </span>
              <h3 className="text-lg font-bold text-white font-sans">{club.name}</h3>
            </div>
            <button
              type="button"
              aria-haspopup="dialog"
              aria-label={`Leave a review for ${club.name}`}
              onClick={onOpenReview}
              className="-mr-3 -mt-2 inline-flex min-h-[44px] shrink-0 items-center rounded-lg px-3 text-gray-300 hover:bg-white/5 hover:text-yellow-400 transition-colors text-sm font-sans"
            >
              Leave Review
            </button>
          </div>

          <div className="mt-2">
            <p className={`text-gray-400 text-sm leading-relaxed ${expanded ? "" : "line-clamp-3"}`}>{club.description}</p>
            {club.description && club.description.length > 100 && (
              <button type="button" aria-expanded={expanded} onClick={onToggleDescription} className="-ml-2 inline-flex min-h-[44px] items-center rounded-lg px-2 text-gray-400 hover:text-white text-xs font-semibold transition-colors font-sans">
                {expanded ? "Show less" : "Show more..."}
              </button>
            )}
          </div>

          {reviews.length > 0 && (
            <div className="mt-4 border-t border-gray-700 pt-3 space-y-2">
              <h4 className="text-xs font-semibold text-gray-400 font-sans">Anonymous Reviews</h4>
              {reviews.map((review, i) => {
                const isNew = !!highlightReview && review.createdAt === highlightReview;
                return (
                <motion.div
                  key={review.createdAt + i}
                  className="border border-gray-700 rounded-lg p-3"
                  // a just-posted review pops and glows in the category colour, then settles
                  initial={isNew && !reduceMotion ? { scale: 0.85, boxShadow: `0 0 0 2px ${style.hex}, 0 0 28px ${style.hex}` } : false}
                  animate={{ scale: 1, boxShadow: `0 0 0 0px ${style.hex}00, 0 0 0px ${style.hex}00` }}
                  transition={{ scale: { type: "spring", stiffness: 500, damping: 15 }, boxShadow: { duration: 1.2, delay: 0.3 } }}
                >
                  <div className="flex items-center gap-1 mb-1">
                    <span className="sr-only">Rated {review.rating} out of 5 stars.</span>
                    {[...Array(review.rating)].map((_, j) => (
                      <HiStar aria-hidden="true" key={j} className="text-yellow-400 text-sm" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-300">{review.comment}</p>
                </motion.div>
                );
              })}
            </div>
          )}
        </article>
      </TiltCard>
    </motion.div>
  );
}
