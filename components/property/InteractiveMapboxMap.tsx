"use client";

import { Map, Marker, NavigationControl } from "react-map-gl/mapbox";
import { useState, useCallback, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;
mapboxgl.accessToken = MAPBOX_TOKEN;

const GREEN_PIN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 41" width="25" height="41"><path d="M12.5 0C5.6 0 0 5.6 0 12.5c0 9.4 12.5 28.5 12.5 28.5S25 21.9 25 12.5C25 5.6 19.4 0 12.5 0z" fill="#006655" stroke="#fff" stroke-width="2"/><circle cx="12.5" cy="12.5" r="5.5" fill="#fff"/></svg>`;

interface Props {
  lat: number;
  lng: number;
  onChange?: (lat: number, lng: number) => void;
  address?: string;
  readOnly?: boolean;
  scrollZoom?: boolean;
}

const InteractiveMapboxMap = ({
  lat,
  lng,
  onChange,
  address,
  readOnly = false,
  scrollZoom = false,
}: Props) => {
  const [markerPos, setMarkerPos] = useState<{ lat: number; lng: number } | null>(
    lat && lng ? { lat, lng } : null
  );
  const [showSatellite, setShowSatellite] = useState(false);
  const mapRef = useRef<any>(null);
  const prevLatRef = useRef(lat);
  const prevLngRef = useRef(lng);

  useEffect(() => {
    if (lat && lng && (prevLatRef.current !== lat || prevLngRef.current !== lng)) {
      setMarkerPos({ lat, lng });
      prevLatRef.current = lat;
      prevLngRef.current = lng;
      mapRef.current?.flyTo({ center: [lng, lat], zoom: 13, duration: 800 });
    }
  }, [lat, lng]);

  const handleMapClick = useCallback(
    (e: any) => {
      if (readOnly) return;
      const { lat: newLat, lng: newLng } = e.lngLat;
      setMarkerPos({ lat: newLat, lng: newLng });
      onChange?.(newLat, newLng);
    },
    [readOnly, onChange]
  );

  const handleMarkerDragEnd = useCallback(
    (e: any) => {
      const { lat: newLat, lng: newLng } = e.lngLat;
      setMarkerPos({ lat: newLat, lng: newLng });
      onChange?.(newLat, newLng);
    },
    [onChange]
  );

  const mapStyle = showSatellite
    ? "mapbox://styles/mapbox/satellite-streets-v12"
    : "mapbox://styles/mapbox/streets-v12";

  const centerLat = lat || 40.7128;
  const centerLng = lng || -74.006;

  return (
    <div className="relative w-full h-full" style={{ zIndex: 0 }}>
      <div className="w-full h-full rounded-lg overflow-hidden bg-slate-100">
        <Map
          ref={mapRef}
          mapboxAccessToken={MAPBOX_TOKEN}
          mapStyle={mapStyle}
          initialViewState={{ latitude: centerLat, longitude: centerLng, zoom: 13 }}
          scrollZoom={scrollZoom}
          attributionControl={false}
          onClick={handleMapClick}
          style={{ width: "100%", height: "100%" }}
        >
          <NavigationControl position="bottom-left" />

          {markerPos && (
            <Marker
              latitude={markerPos.lat}
              longitude={markerPos.lng}
              anchor="bottom"
              draggable={!readOnly}
              onDragEnd={handleMarkerDragEnd}
            >
              <div
                dangerouslySetInnerHTML={{ __html: GREEN_PIN_SVG }}
                style={{
                  width: 25,
                  height: 41,
                  cursor: readOnly ? "default" : "grab",
                }}
              />
            </Marker>
          )}
        </Map>
      </div>

      {/* Layer toggle */}
      <div className="absolute bottom-2 left-12 z-[10] flex bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        <button
          type="button"
          onClick={() => setShowSatellite(false)}
          className={`px-3 py-1.5 text-xs font-medium transition-colors ${
            !showSatellite ? "bg-mosque text-white" : "text-nordic-dark hover:bg-gray-100"
          }`}
        >
          Street
        </button>
        <button
          type="button"
          onClick={() => setShowSatellite(true)}
          className={`px-3 py-1.5 text-xs font-medium transition-colors ${
            showSatellite ? "bg-mosque text-white" : "text-nordic-dark hover:bg-gray-100"
          }`}
        >
          Satellite
        </button>
      </div>

      {address && (
        <a
          className="absolute bottom-2 right-2 bg-white/90 text-xs font-medium px-2 py-1 rounded shadow-sm text-nordic hover:text-mosque z-[10]"
          href={`https://maps.google.com/?q=${address}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          View on Map
        </a>
      )}
    </div>
  );
};

export default InteractiveMapboxMap;
