import { HiExternalLink } from "react-icons/hi";
import { CREDITS, SOURCES } from "@/lib/sources";

/** Body of the Sources & Citations page (shared by the public site and the dashboard). */
export default function SourcesContent() {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <p className="mb-4 inline-block rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-gray-300">
        Research &amp; credits
      </p>
      <h1 className="mb-4 text-5xl font-extrabold tracking-tight text-white md:text-6xl" style={{ fontFamily: "Nunito, sans-serif" }}>
        Sources &amp; Citations
      </h1>
      <p className="mb-12 max-w-2xl text-lg leading-relaxed text-gray-300">
        Every statistic on CLT CommunityHub links to a numbered source below. References follow APA 7th edition style and were chosen from
        government agencies, peer-reviewed research, nonpartisan research centers and recognized standards bodies.
      </p>

      <section aria-labelledby="works-cited" className="mb-16">
        <h2 id="works-cited" className="mb-6 text-3xl font-bold text-white">
          Works cited
        </h2>
        <ol className="space-y-4">
          {SOURCES.map((s, i) => (
            <li
              key={s.id}
              id={`ref-${s.id}`}
              className="scroll-mt-32 rounded-2xl border border-white/10 bg-white/[0.03] p-5 target:border-indigo-300/70 target:bg-indigo-300/10"
            >
              <div className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-sm font-extrabold text-black" aria-hidden="true">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-white">
                    <span className="sr-only">Source {i + 1}: </span>
                    {s.citation}{" "}
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 break-all text-indigo-300 underline underline-offset-4 hover:text-white"
                    >
                      {s.url}
                      <HiExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  </p>
                  <p className="mt-2 text-sm text-gray-300">
                    <span className="font-semibold text-gray-200">Used for: </span>
                    {s.usedFor}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="listing-data" className="mb-16">
        <h2 id="listing-data" className="mb-4 text-3xl font-bold text-white">
          Where listing information comes from
        </h2>
        <p className="leading-relaxed text-gray-300">
          Organization names, descriptions, meeting times and locations in the directory are submitted by each organization&apos;s leaders through our
          registration form and checked against the organization&apos;s own public pages before they are published. Map pins use those addresses.
          Reviews are written anonymously by signed-in members.
        </p>
      </section>

      <section aria-labelledby="credits">
        <h2 id="credits" className="mb-6 text-3xl font-bold text-white">
          Technology &amp; asset credits
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {CREDITS.map((c) => (
            <li key={c.name} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <a href={c.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-white underline-offset-4 hover:underline">
                {c.name}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              <p className="mt-1 text-sm text-gray-300">{c.role}</p>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm leading-relaxed text-gray-300">
          The CLT CommunityHub logo, 3D scenes and all page code were created by our team. Open-source libraries are used under their published
          licenses (MIT, BSD or Apache 2.0). Map data © OpenStreetMap contributors, available under the Open Database License.
        </p>
      </section>
    </div>
  );
}
