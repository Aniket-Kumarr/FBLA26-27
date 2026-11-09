/**
 * Lightweight animated backdrop for inner pages (pure CSS, no WebGL):
 * drifting indigo/teal glows, a receding 3D perspective grid, and film grain.
 */
export default function PageBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -left-40 -top-40 h-[38rem] w-[38rem] animate-drift rounded-full bg-indigo-500/20 blur-[120px]" />
      <div className="absolute -right-40 top-1/3 h-[32rem] w-[32rem] animate-drift-slow rounded-full bg-teal-400/10 blur-[120px]" />

      <div className="absolute inset-x-0 bottom-0 h-[55%] [perspective:600px]">
        <div className="grid-floor absolute inset-x-[-50%] bottom-[-10%] top-0 origin-bottom [transform:rotateX(62deg)]" />
      </div>

      <div className="grain absolute inset-0" />
    </div>
  );
}
