"use client";

import { Map, Marker, Popup, NavigationControl } from "react-map-gl/mapbox";
import { useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;
mapboxgl.accessToken = MAPBOX_TOKEN;

const GREEN_PIN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 41" width="25" height="41"><path d="M12.5 0C5.6 0 0 5.6 0 12.5c0 9.4 12.5 28.5 12.5 28.5S25 21.9 25 12.5C25 5.6 19.4 0 12.5 0z" fill="#006655" stroke="#fff" stroke-width="2"/><circle cx="12.5" cy="12.5" r="5.5" fill="#fff"/></svg>`;

interface Props {
  address: string;
  lat: number;
  lng: number;
}

const MapboxMap = ({ address, lat, lng }: Props) => {
  const [showSatellite, setShowSatellite] = useState(false);
  const [showPopup, setShowPopup] = useState(true);

  const mapStyle = showSatellite
    ? "mapbox://styles/mapbox/satellite-streets-v12"
    : "mapbox://styles/mapbox/streets-v12";

  return (
    <div className="relative w-full aspect-[4/3] bg-slate-100 rounded-lg overflow-hidden" style={{ zIndex: 0 }}>
      <Map
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle={mapStyle}
        initialViewState={{ latitude: lat, longitude: lng, zoom: 13 }}
        scrollZoom={true}
        attributionControl={false}
        style={{ width: "100%", height: "100%" }}
      >
        <NavigationControl position="bottom-left" />

        <Marker
          latitude={lat}
          longitude={lng}
          anchor="bottom"
          popup={undefined}
        >
          <div
            dangerouslySetInnerHTML={{ __html: GREEN_PIN_SVG }}
            style={{ width: 25, height: 41, cursor: "default" }}
          />
        </Marker>

        {showPopup && (
          <Popup
            latitude={lat}
            longitude={lng}
            anchor="bottom"
            offset={44}
            onClose={() => setShowPopup(false)}
            closeButton={true}
            closeOnClick={false}
            className="mapbox-popup-custom"
          >
            <div className="text-sm text-nordic-dark font-medium px-1">
              {address}
            </div>
          </Popup>
        )}
      </Map>

      {/* Layer toggle */}
      <div className="absolute bottom-2 left-12 z-[10] flex bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        <button
          onClick={() => setShowSatellite(false)}
          className={`px-3 py-1.5 text-xs font-medium transition-colors ${
            !showSatellite ? "bg-mosque text-white" : "text-nordic-dark hover:bg-gray-100"
          }`}
        >
          Street
        </button>
        <button
          onClick={() => setShowSatellite(true)}
          className={`px-3 py-1.5 text-xs font-medium transition-colors ${
            showSatellite ? "bg-mosque text-white" : "text-nordic-dark hover:bg-gray-100"
          }`}
        >
          Satellite
        </button>
      </div>

      <a
        className="absolute bottom-2 right-2 bg-white/90 text-xs font-medium px-2 py-1 rounded shadow-sm text-nordic hover:text-mosque z-[10]"
        href={`https://maps.google.com/?q=${address}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        View on Map
      </a>
    </div>
  );
};

export default MapboxMap;
