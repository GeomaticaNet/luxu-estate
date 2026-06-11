"use client";

import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap, LayersControl, LayerGroup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";

// Green marker icon matching the mosque color palette
const greenIconSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 41" width="25" height="41"><path d="M12.5 0C5.6 0 0 5.6 0 12.5c0 9.4 12.5 28.5 12.5 28.5S25 21.9 25 12.5C25 5.6 19.4 0 12.5 0z" fill="#006655" stroke="#fff" stroke-width="2"/><circle cx="12.5" cy="12.5" r="5.5" fill="#fff"/></svg>';
const greenIconUrl = `data:image/svg+xml;base64,${btoa(greenIconSvg)}`;

const customIcon = new L.Icon({
  iconUrl: greenIconUrl,
  iconSize: [20, 33],
  iconAnchor: [10, 33],
  popupAnchor: [1, -28],
  tooltipAnchor: [12, -22],
});

interface Props {
  lat: number;
  lng: number;
  onChange?: (lat: number, lng: number) => void;
  address?: string;
  readOnly?: boolean;
  scrollWheelZoom?: boolean;
}

function LocationMarker({ position, setPosition, readOnly, address }: { position: L.LatLng | null, setPosition: (pos: L.LatLng) => void, readOnly?: boolean, address?: string }) {
  useMapEvents({
    click(e) {
      if (!readOnly) {
        setPosition(e.latlng);
      }
    },
  });

  const eventHandlers = readOnly ? {} : {
    dragend(e: L.LeafletEvent) {
      const marker = e.target as L.Marker;
      setPosition(marker.getLatLng());
    },
  };

  return position === null ? null : (
    <Marker position={position} icon={customIcon} draggable={!readOnly} eventHandlers={eventHandlers}>
      <Popup>{address || "Selected Location"}</Popup>
    </Marker>
  );
}

function MapCenterUpdater({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], map.getZoom(), { animate: true });
    }
  }, [lat, lng]);
  return null;
}

const InteractiveLeafletMap = ({ lat, lng, onChange, address, readOnly = false, scrollWheelZoom = false }: Props) => {
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
    <div className="relative w-full h-full" style={{ zIndex: 0 }}>
      <div className="w-full h-full rounded-lg overflow-hidden bg-slate-100">
        <MapContainer 
          center={center} 
          zoom={13} 
          scrollWheelZoom={scrollWheelZoom}
          zoomControl={false}
          attributionControl={false}
          className="w-full h-full"
        >
        <LayersControl position="bottomleft">
          <LayersControl.BaseLayer checked name="Street">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Satellite">
            <LayerGroup>
              <TileLayer
                attribution='&copy; <a href="https://www.esri.com">Esri</a>'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
              <TileLayer
                attribution='&copy; <a href="https://www.esri.com">Esri</a>'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
              />
            </LayerGroup>
          </LayersControl.BaseLayer>
        </LayersControl>
        <LocationMarker position={position} setPosition={handlePositionChange} readOnly={readOnly} address={address} />
        <MapCenterUpdater lat={lat} lng={lng} />
      </MapContainer>
      </div>
      {address && (
        <a className="absolute bottom-2 right-2 bg-white/90 text-xs font-medium px-2 py-1 rounded shadow-sm text-nordic hover:text-mosque z-[1000]" href={`https://maps.google.com/?q=${address}`} target="_blank" rel="noopener noreferrer">
          View on Map
        </a>
      )}
    </div>
  );
};

export default InteractiveLeafletMap;
