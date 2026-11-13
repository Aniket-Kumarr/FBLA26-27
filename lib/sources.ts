/**
 * Every outside fact on the site is cited from this list.
 * <Cite id="..."/> renders a numbered superscript that links to /sources#ref-<id>.
 * Citations follow APA 7th edition style.
 */

export type Source = {
  id: string;
  /** APA-style reference text (without the URL) */
  citation: string;
  url: string;
  /** what we used it for on the site */
  usedFor: string;
};

export const SOURCES: Source[] = [
  {
    id: "census",
    citation: "U.S. Census Bureau. (2021). QuickFacts: Charlotte city, North Carolina. 2020 Decennial Census.",
    url: "https://www.census.gov/quickfacts/charlottecitynorthcarolina",
    usedFor: "Charlotte's population (874,579 residents in the 2020 Census).",
  },
  {
    id: "americorps",
    citation:
      "AmeriCorps Office of Research and Evaluation & U.S. Census Bureau. (2024). Volunteering and civic life in America: 2023 Current Population Survey Civic Engagement and Volunteering Supplement.",
    url: "https://americorps.gov/about/our-impact/volunteering-civic-life",
    usedFor: "National volunteering rate (28.3% of people formally volunteered through an organization).",
  },
  {
    id: "pew",
    citation: "Vogels, E. A., Gelles-Watnick, R., & Massarat, N. (2022, August 10). Teens, social media and technology 2022. Pew Research Center.",
    url: "https://www.pewresearch.org/internet/2022/08/10/teens-social-media-and-technology-2022/",
    usedFor: "Smartphone access among U.S. teens (95%), which is why the hub is built mobile-first.",
  },
  {
    id: "eccles",
    citation:
      "Eccles, J. S., & Barber, B. L. (1999). Student council, volunteering, basketball, or marching band: What kind of extracurricular involvement matters? Journal of Adolescent Research, 14(1), 10–43.",
    url: "https://doi.org/10.1177/0743558499141003",
    usedFor: "Research linking extracurricular and prosocial activities to better academic and personal outcomes for teens.",
  },
  {
    id: "cdc",
    citation: "Centers for Disease Control and Prevention. (2023). Youth Risk Behavior Survey: Data summary & trends report, 2011–2021.",
    url: "https://www.cdc.gov/yrbs/",
    usedFor: "Share of high school students reporting persistent sadness or hopelessness (42% in 2021), which is why mental-wellness groups are featured.",
  },
  {
    id: "wcag",
    citation: "World Wide Web Consortium. (2023). Web content accessibility guidelines (WCAG) 2.2. W3C Recommendation.",
    url: "https://www.w3.org/TR/WCAG22/",
    usedFor: "Accessibility standard we designed against: color contrast, keyboard access, focus visibility, labels and motion.",
  },
  {
    id: "nngroup",
    citation: "Nielsen, J. (2024, January 30). 10 usability heuristics for user interface design. Nielsen Norman Group.",
    url: "https://www.nngroup.com/articles/ten-usability-heuristics/",
    usedFor: "Usability principles behind our navigation, feedback messages and consistent layouts.",
  },
  {
    id: "osm",
    citation: "OpenStreetMap contributors. (n.d.). OpenStreetMap [Map data]. OpenStreetMap Foundation.",
    url: "https://www.openstreetmap.org/copyright",
    usedFor: "Street map tiles on the home page map and the dashboard's resource map (licensed under the ODbL).",
  },
];

export const SOURCE_INDEX: Record<string, number> = Object.fromEntries(SOURCES.map((s, i) => [s.id, i + 1]));

/** Software and assets we built on (credited, not cited for facts). */
export const CREDITS: { name: string; role: string; url: string }[] = [
  { name: "Next.js & React", role: "Application framework and user interface", url: "https://nextjs.org" },
  { name: "Tailwind CSS", role: "Styling and responsive layout", url: "https://tailwindcss.com" },
  { name: "Supabase", role: "Database for listings and user accounts", url: "https://supabase.com" },
  { name: "NextAuth.js", role: "Secure sign-in (email/password and Google)", url: "https://next-auth.js.org" },
  { name: "Leaflet & React Leaflet", role: "Interactive maps (home page GPS and dashboard)", url: "https://leafletjs.com" },
  { name: "Three.js", role: "3D staircase and network graphics", url: "https://threejs.org" },
  { name: "Framer Motion", role: "Animations (automatically reduced on request)", url: "https://www.framer.com/motion/" },
  { name: "Google Gemini API", role: "AI assistant on the dashboard", url: "https://ai.google.dev" },
  { name: "Heroicons (via React Icons)", role: "Interface icons", url: "https://heroicons.com" },
  { name: "Nunito & Atkinson Hyperlegible (Google Fonts)", role: "Typefaces; Atkinson Hyperlegible was designed by the Braille Institute for low-vision readers", url: "https://fonts.google.com" },
];
