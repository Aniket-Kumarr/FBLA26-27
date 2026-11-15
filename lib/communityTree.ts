import { KINDS, ORGS, type Kind } from "@/lib/communityData";

/** One organization on the connected half of the tree. */
export type TreeOrg = {
  name: string;
  blurb: string;
  kind: Kind | "class";
  color: string;
  kindLabel: string;
};

function toTreeOrg(o: (typeof ORGS)[number]): TreeOrg {
  if (o.kind === "class") {
    return { name: o.name, blurb: o.blurb, kind: "class", color: "#C4B5FD", kindLabel: "Class" };
  }
  const kind = KINDS[o.kind];
  return { name: o.name, blurb: o.blurb, kind: o.kind, color: kind.hex, kindLabel: kind.label };
}

/** Every club, business, non-profit, event and service already sharing the hub. */
export const CONNECTED_ORGS: TreeOrg[] = ORGS.filter((o) => o.kind !== "class").map(toTreeOrg);

/** The leaves that fall, one non-profit at a time — same idea as a staircase step. */
export const FALLING_NONPROFITS: TreeOrg[] = CONNECTED_ORGS.filter((o) => o.kind === "nonprofit");
