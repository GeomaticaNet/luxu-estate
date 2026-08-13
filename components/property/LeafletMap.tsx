"use client";

import { MapContainer, TileLayer, Marker, Popup, LayersControl, LayerGroup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useDarkMode } from "@/hooks/useDarkMode";

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
  address: string;
  lat: number;
  lng: number;
}

const PropertyMapComponent = ({ address, lat, lng }: Props) => {

  const isDark = useDarkMode();
  const position: [number, number] = [lat, lng];

  return (
    <div className="relative w-full aspect-[4/3]" style={{ zIndex: 0 }}>
      {/* 
        Tailwind classes to reset some Leaflet conflicting styles
      */}
      <div className="w-full h-full rounded-lg overflow-hidden bg-slate-100">
      <MapContainer 
          center={position} 
          zoom={13} 
          scrollWheelZoom={true}
          zoomControl={false}
          attributionControl={false}
          className="w-full h-full"
        >
        <LayersControl position="bottomleft">
          <LayersControl.BaseLayer checked name="Street">
            {isDark ? (
              <>
                <TileLayer
                  attribution='&copy; <a href="https://www.esri.com">Esri</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                />
                <TileLayer
                  attribution='&copy; <a href="https://www.esri.com">Esri</a>'
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                />
              </>
            ) : (
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            )}
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
        <Marker position={position} icon={customIcon}>
          <Popup>
            {address}
          </Popup>
        </Marker>
      </MapContainer>
      </div>
      <a className="absolute bottom-2 right-2 bg-white/90 text-xs font-medium px-2 py-1 rounded shadow-sm text-nordic hover:text-mosque z-[1000]" href={`https://maps.google.com/?q=${address}`} target="_blank" rel="noopener noreferrer">
        View on Map
      </a>
    </div>
  );
};

export default PropertyMapComponent;
