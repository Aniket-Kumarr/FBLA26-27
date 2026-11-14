import { HiAcademicCap, HiBeaker, HiHeart, HiSparkles, HiUserGroup } from "react-icons/hi";
import { SECTION_STYLE, type DashboardSection } from "@/lib/communityData";

/** One icon component per dashboard section, keyed off SECTION_STYLE.iconName. */
const ICONS = {
  academic: HiAcademicCap,
  beaker: HiBeaker,
  heart: HiHeart,
  users: HiUserGroup,
  sparkles: HiSparkles,
} as const;

export function sectionIcon(section: DashboardSection) {
  return ICONS[SECTION_STYLE[section].iconName];
}

export function SectionIcon({ section, className }: { section: DashboardSection; className?: string }) {
  const Icon = sectionIcon(section);
  return <Icon aria-hidden="true" className={className} />;
}
