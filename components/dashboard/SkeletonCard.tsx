/**
 * Shimmer placeholder shown instead of plain "Loading listings..." text while the real
 * listings load from Supabase. Pure CSS gradient animation; respects reduced motion via the
 * site-wide rule that zeroes animation durations (see globals.css), so it just sits still.
 */
export default function SkeletonCard() {
  return (
    <div aria-hidden="true" className="animate-pulse rounded-xl border border-gray-700/60 bg-gray-900/60 p-5">
      <div className="mb-3 h-5 w-2/3 rounded bg-gray-700/60" />
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-gray-700/40" />
        <div className="h-3 w-5/6 rounded bg-gray-700/40" />
        <div className="h-3 w-1/2 rounded bg-gray-700/40" />
      </div>
    </div>
  );
}
