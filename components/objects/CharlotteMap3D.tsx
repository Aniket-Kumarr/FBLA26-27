"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useA11y } from "@/components/a11y/A11yProvider";
import { KINDS, type Kind } from "@/lib/communityData";
import type { MapListing } from "@/lib/useListings";
import CharlotteMap from "./CharlotteMap";

/**
 * The real, pannable, 3D map of Charlotte that "pulls out" of the GPS (home page and
 * dashboard) — a MapLibre GL / WebGL upgrade of CharlotteMap with the same props and
 * behaviour contract, so Gps.tsx only had to change which file it imports.
 *
 * Story: Charlotte should feel like a real place you can tilt, rotate and fly across, not
 * a flat sheet of tiles. Picking a listing swoops the camera down into the street, drops a
 * glowing beam of light on it, and lets the city slowly turn around it like a held photo.
 *
 * Performance: the WebGL map, its 3D buildings and every marker are created once (inside
 * the "load" event) and mutated afterwards — markers are only rebuilt when the listing set
 * actually changes, and `onPick` is read from a ref so a parent re-render never rebuilds
 * them. The light beam is a single GeoJSON source whose data is swapped, not a new layer
 * per listing.
 *
 * Accessibility: a real WebGL context is required for any of this; if the browser can't
 * create one, the original Leaflet map (CharlotteMap) is rendered instead so the feature
 * never breaks the page. Every pin is still a labelled <button> with a visible focus ring.
 * MapLibre's own keyboard handler is disabled so it can never swallow the dialog's Escape
 * key, and "Reduce motion" turns every flyTo/orbit/pulse into an instant, still view.
 */

export const CHARLOTTE_CENTER: [number, number] = [-80.8431, 35.2271]; // MapLibre uses [lng, lat]

// keeps the map inside the Charlotte area — same box as CharlotteMap, reordered to [lng, lat]
const BOUNDS: maplibregl.LngLatBoundsLike = [
  [-81.1, 34.95],
  [-80.55, 35.45],
];

const STYLE_URL = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

const BUILDINGS_LAYER_ID = "clt-3d-buildings";
const BEAM_SOURCE_ID = "clt-active-beam";
const BEAM_LAYER_ID = "clt-active-beam-layer";

const OVERVIEW = { center: CHARLOTTE_CENTER, zoom: 11.8, pitch: 55, bearing: -17 } as const;
const FOCUS = { zoom: 17, pitch: 65, bearing: 60 } as const;

/** Dashboard listings already carry one of these categories; home-page listings have none. */
function categoryToKind(category?: string): Kind {
  if (!category) return "club"; // "Home page listings with no category use teal."
  const key = category.trim().toLowerCase();
  if (key === "club" || key === "nonprofit" || key === "event" || key === "service") return key as Kind;
  // dashboard's own categories (see SECTION_ORDER in app/dashboard/page.tsx), mapped to the
  // closest listing kind so every pin still gets one of the site's four colours.
  if (key === "stem" || key === "classes") return "club";
  if (key === "health & wellness") return "nonprofit";
  if (key === "community & service") return "service";
  return "event"; // "Other" and anything unrecognised
}

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}

/** A small circular polygon (metres) around a point, for the fill-extrusion light beam. */
function circlePolygon(center: [number, number], radiusMeters: number, steps = 32): GeoJSON.Polygon {
  const [lng, lat] = center;
  const latRad = (lat * Math.PI) / 180;
  const coords: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * 2 * Math.PI;
    const dLat = (radiusMeters * Math.cos(angle)) / 111_320;
    const dLng = (radiusMeters * Math.sin(angle)) / (111_320 * Math.cos(latRad));
    coords.push([lng + dLng, lat + dLat]);
  }
  return { type: "Polygon", coordinates: [coords] };
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
}

function emptyBeam(): GeoJSON.FeatureCollection {
  return { type: "FeatureCollection", features: [] };
}

type Props = {
  listings: MapListing[];
  activeId: string | null;
  onPick: (id: string) => void;
  animate: boolean;
  /** members see where and when each listing meets; visitors see the name only */
  showDetails: boolean;
};

export default function CharlotteMap3D({ listings, activeId, onPick, animate, showDetails }: Props) {
  const { prefs } = useA11y();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<Map<string, maplibregl.Marker>>(new Map());
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const orbitingRef = useRef(false);
  const highContrastRef = useRef(prefs.highContrast);
  highContrastRef.current = prefs.highContrast;

  // read through a ref so markers never need to be rebuilt just because a parent re-render
  // produced a new onPick closure
  const onPickRef = useRef(onPick);
  onPickRef.current = onPick;

  const [webglOk, setWebglOk] = useState<boolean | null>(null);
  const [ready, setReady] = useState(false);
  const [pitchOn, setPitchOn] = useState(true);

  useEffect(() => setWebglOk(supportsWebGL()), []);

  /* ---------- create the map once (only when WebGL is available) ---------- */
  useEffect(() => {
    if (webglOk !== true || !containerRef.current || mapRef.current) return;
    const markers = markersRef.current; // captured now so the cleanup below reads a stable value
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE_URL,
      center: OVERVIEW.center,
      zoom: OVERVIEW.zoom,
      pitch: OVERVIEW.pitch,
      bearing: OVERVIEW.bearing,
      maxPitch: 75,
      maxBounds: BOUNDS,
      attributionControl: { compact: true },
      // the dialog already has its own keyboard handling (Escape, focus trap); the map's
      // own arrow-key panning is not part of that contract, so disable it so it can never
      // intercept a key the dialog needs (Escape included).
      keyboard: false,
    });
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "bottom-right");
    map.on("error", (e) => console.error("[CharlotteMap3D] maplibre error:", e.error));

    map.on("load", () => {
      // 3D buildings, grown in from the style's own vector source ------------------
      const style = map.getStyle();
      const vectorSourceId = Object.keys(style.sources ?? {}).find((id) => style.sources[id].type === "vector");
      const firstSymbolLayerId = style.layers?.find((l) => l.type === "symbol")?.id;
      if (vectorSourceId) {
        map.addLayer(
          {
            id: BUILDINGS_LAYER_ID,
            type: "fill-extrusion",
            source: vectorSourceId,
            "source-layer": "building",
            minzoom: 13,
            paint: {
              "fill-extrusion-color": highContrastRef.current
                ? ["interpolate", ["linear"], ["coalesce", ["get", "render_height"], 0], 0, "#4b5270", 60, "#8891c4", 200, "#d6daf2"]
                : ["interpolate", ["linear"], ["coalesce", ["get", "render_height"], 0], 0, "#11162b", 60, "#232c56", 200, "#4b5aa8"],
              "fill-extrusion-height": ["coalesce", ["get", "render_height"], 0],
              "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], 0],
              // grow in rather than pop in, between zoom 13 and 14.5
              "fill-extrusion-opacity": ["interpolate", ["linear"], ["zoom"], 13, 0, 14.5, 0.88],
            },
          },
          firstSymbolLayerId
        );
      }

      // one reusable source for the "light beam" dropped on the active listing --------
      map.addSource(BEAM_SOURCE_ID, { type: "geojson", data: emptyBeam() });
      map.addLayer({
        id: BEAM_LAYER_ID,
        type: "fill-extrusion",
        source: BEAM_SOURCE_ID,
        paint: {
          "fill-extrusion-color": ["get", "color"],
          "fill-extrusion-height": 260,
          "fill-extrusion-base": 0,
          "fill-extrusion-opacity": 0.55,
        },
      });

      setReady(true);
    });

    return () => {
      markers.forEach((m) => m.remove());
      markers.clear();
      popupRef.current?.remove();
      popupRef.current = null;
      map.remove();
      mapRef.current = null;
      setReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [webglOk]);

  /* ---------- the map mounts inside a panel that just finished flying out ---------- */
  useEffect(() => {
    const map = mapRef.current;
    const el = containerRef.current;
    if (!map || !el) return;
    map.resize();
    const ro = new ResizeObserver(() => map.resize());
    ro.observe(el);
    return () => ro.disconnect();
  }, [ready]);

  /* ---------- markers: rebuilt only when the listing set itself changes ---------- */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current.clear();
    listings.forEach((l) => {
      const color = KINDS[categoryToKind(l.category)].hex;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "map3d-pin";
      button.style.setProperty("--pin-color", color);
      button.setAttribute("aria-label", `Show ${l.name} on the map`);
      button.addEventListener("click", () => onPickRef.current(l.id));
      const marker = new maplibregl.Marker({ element: button, anchor: "center" }).setLngLat([l.lng, l.lat]).addTo(map);
      markersRef.current.set(l.id, marker);
    });
  }, [listings, ready]);

  /* ---------- reflect active / high-contrast state onto the pin elements ---------- */
  useEffect(() => {
    markersRef.current.forEach((marker, id) => {
      const el = marker.getElement();
      el.classList.toggle("map3d-pin--active", id === activeId);
      el.classList.toggle("map3d-pin--contrast", prefs.highContrast);
    });
  }, [activeId, prefs.highContrast, listings]);

  const active = useMemo(() => listings.find((l) => l.id === activeId), [listings, activeId]);

  /* ---------- fly to / away from the active listing ---------- */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    orbitingRef.current = false;

    const beamSource = () => map.getSource(BEAM_SOURCE_ID) as maplibregl.GeoJSONSource | undefined;

    if (!active) {
      beamSource()?.setData(emptyBeam());
      popupRef.current?.remove();
      popupRef.current = null;
      return;
    }

    const color = KINDS[categoryToKind(active.category)].hex;
    const center: [number, number] = [active.lng, active.lat];
    beamSource()?.setData({ type: "FeatureCollection", features: [{ type: "Feature", properties: { color }, geometry: circlePolygon(center, 9) }] });

    // the address is public (anyone deciding whether to visit needs to know where it is);
    // the meeting time stays a member perk.
    const known = (v: string) => !!v && v !== "TBD" && v !== "Location TBD";
    const addressLine = known(active.location) ? `<span style="display:block;font-size:11px;margin-top:3px;color:#cbd5e1">${escapeHtml(active.location)}</span>` : "";
    const timeLine = showDetails
      ? known(active.meetingTime) ? `<span style="display:block;font-size:11px;color:#cbd5e1">${escapeHtml(active.meetingTime)}</span>` : ""
      : `<span style="display:block;font-size:11px;margin-top:3px;color:#9ca3af">Sign in to see when it meets.</span>`;
    const html = `<div style="font-family:ui-sans-serif,system-ui,sans-serif"><strong style="display:block;font-size:13px;color:${color}">${escapeHtml(active.name)}</strong>${addressLine}${timeLine}</div>`;

    popupRef.current?.remove();
    const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 18 }).setLngLat(center).setHTML(html);
    popupRef.current = popup;

    const startOrbit = () => {
      popup.addTo(map);
      orbitingRef.current = true;
      const step = () => {
        if (!orbitingRef.current) return;
        map.once("moveend", step);
        map.rotateTo(map.getBearing() + 90, { duration: 24_000, easing: (t) => t });
      };
      step();
    };

    const stopOrbit = () => {
      orbitingRef.current = false;
    };
    map.on("mousedown", stopOrbit);
    map.on("touchstart", stopOrbit);
    map.on("wheel", stopOrbit);

    if (!animate) {
      map.jumpTo({ center, zoom: FOCUS.zoom, pitch: pitchOn ? FOCUS.pitch : 0, bearing: FOCUS.bearing });
      popup.addTo(map);
    } else {
      map.flyTo({ center, zoom: FOCUS.zoom, pitch: pitchOn ? FOCUS.pitch : 0, bearing: FOCUS.bearing, duration: 3500, curve: 1.6 });
      map.once("moveend", startOrbit);
    }

    return () => {
      map.off("mousedown", stopOrbit);
      map.off("touchstart", stopOrbit);
      map.off("wheel", stopOrbit);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, ready, animate, showDetails]);

  /* ---------- overlay controls: 2D/3D toggle + overview ---------- */
  const toggle3D = () => {
    const map = mapRef.current;
    if (!map) return;
    const next = !pitchOn;
    setPitchOn(next);
    const target = next ? (active ? FOCUS.pitch : OVERVIEW.pitch) : 0;
    if (animate) map.easeTo({ pitch: target, duration: 500 });
    else map.jumpTo({ pitch: target });
  };

  const overview = () => {
    const map = mapRef.current;
    if (!map) return;
    orbitingRef.current = false;
    popupRef.current?.remove();
    popupRef.current = null;
    (map.getSource(BEAM_SOURCE_ID) as maplibregl.GeoJSONSource | undefined)?.setData(emptyBeam());
    const target = { center: OVERVIEW.center, zoom: OVERVIEW.zoom, pitch: pitchOn ? OVERVIEW.pitch : 0, bearing: OVERVIEW.bearing };
    if (animate) map.flyTo({ ...target, duration: 1800, curve: 1.4 });
    else map.jumpTo(target);
  };

  if (webglOk === false) {
    return <CharlotteMap listings={listings} activeId={activeId} onPick={onPick} animate={animate} showDetails={showDetails} />;
  }

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />
      {webglOk === true && (
        <div className="absolute bottom-4 left-4 z-[1] flex gap-2">
          <button
            type="button"
            aria-pressed={pitchOn}
            onClick={toggle3D}
            className="rounded-xl border border-white/15 bg-black/60 px-3 py-2 text-xs font-semibold text-gray-100 backdrop-blur transition-colors hover:bg-black/80"
          >
            {pitchOn ? "2D view" : "3D view"}
          </button>
          <button
            type="button"
            onClick={overview}
            className="rounded-xl border border-white/15 bg-black/60 px-3 py-2 text-xs font-semibold text-gray-100 backdrop-blur transition-colors hover:bg-black/80"
          >
            Overview
          </button>
        </div>
      )}
    </div>
  );
}
