"use client";

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";

// Fix for default Leaflet icons in Next.js
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

interface Props {
  lat: number;
  lng: number;
  onChange?: (lat: number, lng: number) => void;
  address?: string;
  readOnly?: boolean;
}

function LocationMarker({ position, setPosition, readOnly }: { position: L.LatLng | null, setPosition: (pos: L.LatLng) => void, readOnly?: boolean }) {
  useMapEvents({
    click(e) {
      if (!readOnly) {
        setPosition(e.latlng);
      }
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={customIcon}>
      <Popup>Selected Location</Popup>
    </Marker>
  );
}

const InteractiveLeafletMap = ({ lat, lng, onChange, address, readOnly = false }: Props) => {
  const [position, setPosition] = useState<L.LatLng | null>(
    lat && lng ? new L.LatLng(lat, lng) : null
  );

  useEffect(() => {
    if (lat && lng && (position?.lat !== lat || position?.lng !== lng)) {
      setPosition(new L.LatLng(lat, lng));
    }
  }, [lat, lng]);

  const handlePositionChange = (pos: L.LatLng) => {
    setPosition(pos);
    if (onChange) {
      onChange(pos.lat, pos.lng);
    }
  };

  const center: [number, number] = [lat || 40.7128, lng || -74.0060]; // Default to NYC if no lat/lng

  return (
    <div className="relative w-full h-48 rounded-lg bg-slate-100 overflow-hidden border border-gray-200" style={{ zIndex: 0 }}>
      <MapContainer 
        center={center} 
        zoom={13} 
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={position} setPosition={handlePositionChange} readOnly={readOnly} />
      </MapContainer>
      {address && (
        <a className="absolute bottom-2 right-2 bg-white/90 text-xs font-medium px-2 py-1 rounded shadow-sm text-nordic hover:text-mosque z-[1000]" href={`https://maps.google.com/?q=${address}`} target="_blank" rel="noopener noreferrer">
          View on Map
        </a>
      )}
    </div>
  );
};

export default InteractiveLeafletMap;
