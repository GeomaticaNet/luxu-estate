"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
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
  address: string;
  lat: number;
  lng: number;
}

const PropertyMapComponent = ({ address, lat, lng }: Props) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full aspect-[4/3] rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center">
        <span className="material-icons animate-spin text-mosque">refresh</span>
      </div>
    );
  }

  const position: [number, number] = [lat, lng];

  return (
    <div className="relative w-full aspect-[4/3] rounded-lg bg-slate-100 overflow-hidden" style={{ zIndex: 0 }}>
      {/* 
        Tailwind classes to reset some Leaflet conflicting styles
      */}
      <MapContainer 
        center={position} 
        zoom={13} 
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position} icon={customIcon}>
          <Popup>
            {address}
          </Popup>
        </Marker>
      </MapContainer>

      <a className="absolute bottom-2 right-2 bg-white/90 text-xs font-medium px-2 py-1 rounded shadow-sm text-nordic hover:text-mosque z-[1000]" href={`https://maps.google.com/?q=${address}`} target="_blank" rel="noopener noreferrer">
        View on Map
      </a>
    </div>
  );
};

export default PropertyMapComponent;
