import Link from "next/link";
import { SOURCE_INDEX } from "@/lib/sources";

/**
 * Numbered in-text citation, e.g. <Cite id="census" /> → [1], linking to the full reference.
 * `className` sets the link color so it keeps its contrast on light backgrounds.
 */
export default function Cite({ id, className = "text-indigo-300 hover:text-white" }: { id: string; className?: string }) {
  const n = SOURCE_INDEX[id];
  if (!n) return null;
  return (
    <sup className="ml-0.5 align-super text-[0.7em] font-semibold">
      <Link href={`/sources#ref-${id}`} className={`rounded underline-offset-2 transition-colors hover:underline ${className}`} aria-label={`Source ${n}`}>
        [{n}]
      </Link>
    </sup>
  );
}
