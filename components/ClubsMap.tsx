"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';

interface ClubLocation {
    id: string;
    name: string;
    lat: number;
    lng: number;
}

const center: [number, number] = [35.2271, -80.8431];

// Charlotte, NC bounds - restricts map to Charlotte area
const charlotteBounds: L.LatLngBoundsExpression = [
    [35.0, -81.0],  // Southwest corner
    [35.5, -80.5]   // Northeast corner
];

function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom);
    }, [map, center, zoom]);
    return null;
}

// Component to enforce map bounds (keeps map within Charlotte area)
function EnforceBounds() {
    const map = useMap();
    useEffect(() => {
        map.setMaxBounds(charlotteBounds);
        map.setMinZoom(11); // Prevent zooming out too far
        map.setMaxZoom(18); // Prevent zooming in too close
    }, [map]);
    return null;
}

interface ClubsMapProps {
    selectedClubId?: string | null;
    clubs?: Array<{
        id: string;
        name: string;
        lat: number;
        lng: number;
    }>;
}

export default function ClubsMap({ selectedClubId, clubs = [] }: ClubsMapProps) {
    useEffect(() => {
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });
    }, []);

    const customIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        shadowSize: [41, 41],
    });

    const clubLocations: ClubLocation[] = clubs.map(club => ({
        id: club.id,
        name: club.name,
        lat: club.lat,
        lng: club.lng,
    }));

    const selectedClub = selectedClubId
        ? clubLocations.find(club => club.id === selectedClubId && !isNaN(club.lat) && !isNaN(club.lng))
        : null;

    // Ensure map center stays within Charlotte bounds
    const getBoundedCenter = (lat: number, lng: number): [number, number] => {
        const minLat = 35.0;
        const maxLat = 35.5;
        const minLng = -81.0;
        const maxLng = -80.5;

        return [
            Math.max(minLat, Math.min(maxLat, lat)),
            Math.max(minLng, Math.min(maxLng, lng))
        ];
    };

    const mapCenter = selectedClub
        ? getBoundedCenter(selectedClub.lat, selectedClub.lng)
        : clubLocations.length > 0
            ? getBoundedCenter(clubLocations[0].lat, clubLocations[0].lng)
            : center;
    const mapZoom = selectedClub ? 16 : 13;

    return (
        <div className="w-full rounded-2xl overflow-hidden border-2 border-gray-700">
            <MapContainer
                center={mapCenter}
                zoom={mapZoom}
                minZoom={11}
                maxZoom={18}
                maxBounds={charlotteBounds}
                maxBoundsViscosity={1.0}
                style={{ height: '600px', width: '100%' }}
                className="z-0"
            >
                <ChangeView center={mapCenter} zoom={mapZoom} />
                <EnforceBounds />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {clubLocations.map((club) => (
                    <Marker
                        key={club.id}
                        position={[club.lat, club.lng]}
                        icon={customIcon}
                    >
                        <Popup>
                            <div className="text-center font-sans">
                                <strong className="text-gray-900">{club.name}</strong>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}

