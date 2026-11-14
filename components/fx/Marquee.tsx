type Item = string | { label: string; color?: string };

type Props = {
  items: Item[];
  reverse?: boolean;
  /** seconds for one full loop */
  duration?: number;
  /** stop the scroll (pause button / "Reduce motion" setting) */
  paused?: boolean;
};

function labelOf(item: Item) {
  return typeof item === "string" ? item : item.label;
}

/** Infinite horizontal ticker with faded edges. Pauses on hover, keyboard focus, or when `paused`. Pure CSS.
 *  Items may be plain strings, or `{ label, color }` to tint each pill's left edge and dot. */
export default function Marquee({ items, reverse = false, duration = 50, paused = false }: Props) {
  const row = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center gap-4 pr-4">
      {items.map((item, i) => {
        const color = typeof item === "string" ? undefined : item.color;
        return (
          <li
            key={`${labelOf(item)}-${i}`}
            className="flex items-center gap-2 whitespace-nowrap rounded-full border border-white/10 bg-white/[0.03] px-5 py-2.5 text-sm font-medium text-gray-300 backdrop-blur transition-colors hover:border-white/30 hover:text-white md:text-base"
            style={color ? { borderColor: `${color}40` } : undefined}
          >
            {color && <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: color }} />}
            {labelOf(item)}
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className={`group mask-fade-x relative flex ${paused ? "overflow-x-auto" : "overflow-hidden"}`}>
      <div
        className="flex w-max animate-marquee group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]"
        style={{
          animationDuration: `${duration}s`,
          animationDirection: reverse ? "reverse" : "normal",
          animationPlayState: paused ? "paused" : undefined,
          animationName: paused ? "none" : undefined,
        }}
      >
        {row(false)}
        {/* duplicate row makes the loop seamless; hidden from screen readers */}
        {!paused && row(true)}
      </div>
    </div>
  );
}
