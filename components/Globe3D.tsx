"use client";

import { useEffect, useRef } from 'react';
import Globe from 'react-globe.gl';

export default function Globe3D() {
  const globeEl = useRef<any>(null);

  useEffect(() => {
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 1;
      globeEl.current.pointOfView({ lat: 0, lng: 0, altitude: 2 });
    }
  }, []);

  return (
    <div className="w-full h-full">
      <Globe
        ref={globeEl}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        backgroundColor="rgba(0,0,0,0)"
        showAtmosphere={true}
        atmosphereColor="#ffffff"
        atmosphereAltitude={0.15}
        enablePointerInteraction={false}
      />
    </div>
  );
}



