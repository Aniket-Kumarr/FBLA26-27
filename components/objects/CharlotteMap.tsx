"use client";

import { useEffect, useRef } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";
import type { CircleMarker as LeafletCircleMarker, LatLngBoundsExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import type { MapListing } from "@/lib/useListings";

/**
 * The real, pannable map of Charlotte that "pulls out" of the 3D GPS (home page and dashboard).
 * Each listing is a dot at the position stored with it. Loaded only when the visitor opens
 * the map, so it costs nothing until then.
 */

export const CHARLOTTE_CENTER: [number, number] = [35.2271, -80.8431];

// keeps the map inside the Charlotte area
const BOUNDS: LatLngBoundsExpression = [
  [34.95, -81.1],
  [35.45, -80.55],
];

/** Flies to the chosen listing and opens its label. */
function Focus({
  listing,
  animate,
  markers,
}: {
  listing: MapListing | undefined;
  animate: boolean;
  markers: React.MutableRefObject<Record<string, LeafletCircleMarker | null>>;
}) {
  const map = useMap();
  useEffect(() => {
    if (!listing) return;
    map.flyTo([listing.lat, listing.lng], 16, { animate, duration: 1.1 });
    const t = window.setTimeout(() => markers.current[listing.id]?.openPopup(), animate ? 1150 : 50);
    return () => window.clearTimeout(t);
  }, [map, listing, animate, markers]);
  return null;
}

export default function CharlotteMap({
  listings,
  activeId,
  onPick,
  animate,
  showDetails,
}: {
  listings: MapListing[];
  activeId: string | null;
  onPick: (id: string) => void;
  animate: boolean;
  /** members see where and when each listing meets; visitors see the name only */
  showDetails: boolean;
}) {
  const markers = useRef<Record<string, LeafletCircleMarker | null>>({});
  const active = listings.find((l) => l.id === activeId);

  return (
    <MapContainer
      center={active ? [active.lat, active.lng] : CHARLOTTE_CENTER}
      zoom={active ? 16 : 13}
      minZoom={11}
      maxZoom={18}
      maxBounds={BOUNDS}
      maxBoundsViscosity={1}
      zoomAnimation={animate}
      fadeAnimation={animate}
      style={{ height: "100%", width: "100%" }}
    >
      <Focus listing={active} animate={animate} markers={markers} />
      <TileLayer
        className="map-tiles-dark"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {listings.map((l) => {
        const on = l.id === activeId;
        const known = (v: string) => v && v !== "TBD" && v !== "Location TBD";
        return (
          <CircleMarker
            key={l.id}
            ref={(m) => {
              markers.current[l.id] = m;
            }}
            center={[l.lat, l.lng]}
            radius={on ? 11 : 7}
            pathOptions={{ color: "#ffffff", weight: 2, fillColor: on ? "#5eead4" : "#a5b4fc", fillOpacity: 1 }}
            eventHandlers={{ click: () => onPick(l.id) }}
          >
            <Popup>
              <div className="font-sans text-gray-900">
                <strong className="block text-sm">{l.name}</strong>
                {showDetails ? (
                  <>
                    {known(l.location) && <span className="mt-1 block text-xs">{l.location}</span>}
                    {known(l.meetingTime) && <span className="block text-xs">{l.meetingTime}</span>}
                  </>
                ) : (
                  <span className="mt-1 block text-xs">Sign in to see where and when it meets.</span>
                )}
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
