/**
 * Curated, real listings from the CLT CommunityHub knowledge base
 * (see app/api/chat/route.ts). Used by the marketing pages.
 */

export type Kind = "club" | "nonprofit" | "event" | "service";

/** One colour per thing we help people find. Classes are written out so Tailwind keeps them. */
export const KINDS: Record<
  Kind,
  { label: string; plural: string; hex: string; text: string; dot: string; chip: string; glow: string }
> = {
  club: {
    label: "Club",
    plural: "Clubs",
    hex: "#5EEAD4",
    text: "text-teal-300",
    dot: "bg-teal-300",
    chip: "border-teal-300/25 bg-teal-300/[0.07] text-teal-200",
    glow: "rgba(94,234,212,0.16)",
  },
  nonprofit: {
    label: "Non-profit",
    plural: "Non-profits",
    hex: "#FDA4AF",
    text: "text-rose-300",
    dot: "bg-rose-300",
    chip: "border-rose-300/25 bg-rose-300/[0.07] text-rose-200",
    glow: "rgba(253,164,175,0.16)",
  },
  event: {
    label: "Event",
    plural: "Events",
    hex: "#FFFFFF",
    text: "text-white",
    dot: "bg-white",
    chip: "border-white/25 bg-white/[0.07] text-white",
    glow: "rgba(255,255,255,0.12)",
  },
  service: {
    label: "Service",
    plural: "Services",
    hex: "#A5B4FC",
    text: "text-indigo-300",
    dot: "bg-indigo-300",
    chip: "border-indigo-300/25 bg-indigo-300/[0.07] text-indigo-200",
    glow: "rgba(165,180,252,0.16)",
  },
};

export const KIND_ORDER: Kind[] = ["club", "nonprofit", "event", "service"];

/** Real examples shown on the 3D map labels, grouped by what they are. */
export const MAP_EXAMPLES: Record<Kind, string[]> = {
  club: ["STEMReach", "CAIVO", "NCSteminate", "HelpingHands", "Aspira", "CYMA"],
  nonprofit: ["ESSAM", "UpLife.CLT", "Snack Packs for Hope", "Homeless Hearth", "Thrive2gethr", "Project Infinite Horizons"],
  event: ["Stride Forward charity races", "ACS fundraisers", "CAIVO AI workshops", "BrightCareKids fundraisers"],
  service: ["ESL Teen Tutors", "STEMReach tutoring", "Queen City Blendz", "TheBinBros"],
};

export type Category = "STEM" | "Health & Wellness" | "Community & Service" | "Business & Leadership" | "Classes";

export const CATEGORIES: Category[] = ["STEM", "Health & Wellness", "Community & Service", "Business & Leadership", "Classes"];

export type Org = { name: string; category: Category; kind: Kind | "class"; blurb: string };

export const ORGS: Org[] = [
  // STEM
  { name: "Every Student Succeeds at Math (ESSAM)", category: "STEM", kind: "nonprofit", blurb: "Free math support for elementary students, especially in Title I schools." },
  { name: "Excel Academy", category: "STEM", kind: "nonprofit", blurb: "Volunteer-run STEM programs and free tutoring for underprivileged students." },
  { name: "STEMReach", category: "STEM", kind: "service", blurb: "Student-led peer tutoring that makes tough STEM concepts approachable." },
  { name: "CAIVO", category: "STEM", kind: "club", blurb: "Charlotte AI Vanguard Organization — AI lessons, coding workshops and ethics debates." },
  { name: "NCSteminate Chapter", category: "STEM", kind: "club", blurb: "NC chapter of Steminate running STEM events and outreach partnerships." },
  { name: "W.I.S.H", category: "STEM", kind: "club", blurb: "Equipping youth with the digital and AI skills to thrive." },

  // Health & Wellness
  { name: "UpLife.CLT", category: "Health & Wellness", kind: "nonprofit", blurb: "Supporting shelters so they can house and help more people in need." },
  { name: "BrightCareKids", category: "Health & Wellness", kind: "club", blurb: "Helping kids with disabilities thrive through events and fundraisers." },
  { name: "Bloom and Soar", category: "Health & Wellness", kind: "nonprofit", blurb: "A student-founded movement for youth mental wellness and support." },
  { name: "NC Teen Mental Health Association", category: "Health & Wellness", kind: "club", blurb: "Raising awareness and funds for teen mental health charities." },
  { name: "Alturos", category: "Health & Wellness", kind: "club", blurb: "Promoting mental wellbeing and raising awareness about stress." },

  // Community & Service
  { name: "Snack Packs for Hope", category: "Community & Service", kind: "nonprofit", blurb: "Ballantyne-based non-profit providing snack packs to people experiencing homelessness." },
  { name: "Stride Forward Foundation", category: "Community & Service", kind: "event", blurb: "Local running races that raise money for charitable causes." },
  { name: "American Cancer Society — CLT", category: "Community & Service", kind: "event", blurb: "Community events raising money for cancer research and support." },
  { name: "Homeless Hearth", category: "Community & Service", kind: "nonprofit", blurb: "Resources and assistance for people experiencing homelessness in Charlotte." },
  { name: "teenvolunteernetwork_clt", category: "Community & Service", kind: "service", blurb: "One place for Charlotte teens to find volunteer opportunities." },
  { name: "T1D United", category: "Community & Service", kind: "event", blurb: "Events and fundraisers for Type 1 Diabetes awareness and research." },
  { name: "Queen City Blendz", category: "Community & Service", kind: "service", blurb: "Two friends providing top-notch haircuts across the city." },
  { name: "TheBinBros", category: "Community & Service", kind: "service", blurb: "Trash-can deep cleans, pressure washing and lawn care." },

  // Business & Leadership
  { name: "Aspira", category: "Business & Leadership", kind: "club", blurb: "Entrepreneurship club with leadership roles in finance and business." },
  { name: "Charlotte Youth Marketing Association", category: "Business & Leadership", kind: "club", blurb: "Business events, marketing skills and leadership positions." },
  { name: "ESL Teen Tutors", category: "Business & Leadership", kind: "service", blurb: "Free multilingual tutoring in over 25 languages." },
  { name: "Echelon", category: "Business & Leadership", kind: "nonprofit", blurb: "Cybersecurity awareness workshops and digital-safety resources." },
  { name: "Thrive2gethr", category: "Business & Leadership", kind: "nonprofit", blurb: "Fighting food insecurity by partnering with local restaurants." },
  { name: "MedSearch Charlotte", category: "Business & Leadership", kind: "club", blurb: "Student-led chapter for future healthcare leaders and research." },

  // Classes
  { name: "Python Programming I Honors", category: "Classes", kind: "class", blurb: "Build a programming foundation through hands-on Python projects." },
  { name: "AP Calculus BC", category: "Classes", kind: "class", blurb: "Differential and integral calculus, series and parametric equations." },
  { name: "AP Computer Science Principles", category: "Classes", kind: "class", blurb: "Programming, data, algorithms and computing's impact on society." },
];

/** Count of organisations/classes in the full knowledge base. */
export const LISTING_COUNT = 58;
