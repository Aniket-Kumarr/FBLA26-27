"use client";

import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabase-client";

/** A listing as the maps need it. The dashboard's own records already have this shape. */
export type MapListing = {
  id: string;
  name: string;
  location: string;
  meetingTime: string;
  lat: number;
  lng: number;
};

/**
 * Loads the listings and their map positions from the same table, with the same fallbacks,
 * as the dashboard, so a pin sits in exactly the same place on every map on the site.
 * Nothing is requested until `enabled` is true (the home page waits until the GPS is near
 * the screen).
 */
export function useListings(enabled = true) {
  const [listings, setListings] = useState<MapListing[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");

  useEffect(() => {
    if (!enabled || status !== "idle") return;
    let cancelled = false;
    setStatus("loading");
    (async () => {
      try {
        const { data, error } = await supabaseClient.from("lisitngs").select("*");
        if (cancelled) return;
        if (error || !data) {
          setStatus("error");
          return;
        }
        const mapped: MapListing[] = data
          // rows come straight from the database, so their shape is not known ahead of time
          .map((row: any) => ({
            id: row.id?.toString() || "",
            name: row.title || row.name || row.club_name || "",
            location: row.location || row.address || row.venue || "",
            meetingTime: row.meeting_time || row.meetingTime || row.meeting || row.schedule || "",
            lat: parseFloat(row.latitude || row.lat || "35.2271"),
            lng: parseFloat(row.longitude || row.lng || row.lon || "-80.8431"),
          }))
          .filter((l: MapListing) => l.name && !isNaN(l.lat) && !isNaN(l.lng));
        setListings(mapped);
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
    // status is intentionally left out: this effect starts the one and only request
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return { listings, status };
}
