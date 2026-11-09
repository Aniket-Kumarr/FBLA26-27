type Props = {
  items: string[];
  reverse?: boolean;
  /** seconds for one full loop */
  duration?: number;
};

/** Infinite horizontal ticker with faded edges. Pauses on hover. Pure CSS. */
export default function Marquee({ items, reverse = false, duration = 50 }: Props) {
  const row = (
    <div className="flex shrink-0 items-center gap-4 pr-4">
      {items.map((item) => (
        <span
          key={item}
          className="whitespace-nowrap rounded-full border border-white/10 bg-white/[0.03] px-5 py-2.5 text-sm font-medium text-gray-300 backdrop-blur transition-colors hover:border-white/30 hover:text-white md:text-base"
        >
          {item}
        </span>
      ))}
    </div>
  );

  return (
    <div className="group mask-fade-x relative flex overflow-hidden">
      <div
        className="flex w-max animate-marquee group-hover:[animation-play-state:paused]"
        style={{ animationDuration: `${duration}s`, animationDirection: reverse ? "reverse" : "normal" }}
      >
        {row}
        <div aria-hidden className="flex shrink-0">
          {row}
        </div>
      </div>
    </div>
  );
}
