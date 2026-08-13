"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { useDarkMode } from "@/hooks/useDarkMode";
import { getRoutes } from "@/lib/routing";
import type { RouteResult } from "@/lib/routing";
import { RouteInstructions } from "./RouteInstructions";
import type { Property } from "@/interfaces/property";

// Tabler "home" icon (white outline) — https://tabler-icons.io
const TABLER_HOME = `
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M5 12l-2 0l9 -9l9 9l-2 0"/>
  <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7"/>
  <path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6"/>
</svg>`;

const BOUNDS_PADDING: [number, number] = [48, 48];
const BOUNDS_MAX_ZOOM = 14;

function makeHouseIcon() {
  return L.divIcon({
    className: "property-marker",
    html: `<div class="property-pin">${TABLER_HOME}</div>`,
    iconSize: [40, 50],
    iconAnchor: [20, 46],
    popupAnchor: [0, -42],
  });
}

function makeOriginIcon() {
  return L.divIcon({
    className: "origin-marker",
    html: `<div class="origin-dot"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

function fitBoundsToProperties(map: L.Map | null, properties: Property[]) {
  if (properties.length === 0 || !map) return;
  const bounds = L.latLngBounds(properties.map((p) => [p.lat, p.lng] as [number, number]));
  map.fitBounds(bounds, { padding: BOUNDS_PADDING, maxZoom: BOUNDS_MAX_ZOOM });
}

function FitBounds({ properties }: { properties: Property[] }) {
  const map = useMap();

  useEffect(() => {
    fitBoundsToProperties(map, properties);
    requestAnimationFrame(() => map.invalidateSize());
    const timer = setTimeout(() => map.invalidateSize(), 350);
    return () => clearTimeout(timer);
  }, [map, properties]);

  return null;
}

/** Keeps a reference to the map instance so the overlay button can use it. */
function CaptureMap({ mapRef }: { mapRef: React.MutableRefObject<L.Map | null> }) {
  const map = useMap();
  useEffect(() => {
    mapRef.current = map;
  }, [map, mapRef]);
  return null;
}

/** Picks the route origin when the user clicks the map (geolocation fallback). */
function MapClickHandler({
  active,
  onPick,
}: {
  active: boolean;
  onPick: (latlng: L.LatLng) => void;
}) {
  useMapEvents({
    click(e) {
      if (active) onPick(e.latlng);
    },
  });
  return null;
}

export default function PropertiesMapLeaflet({ properties }: { properties: Property[] }) {
  const t = useTranslations("Map");
  const locale = useLocale();
  const isDark = useDarkMode();
  const mapRef = useRef<L.Map | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeMarkerRef = useRef<L.Marker | null>(null);

  // Routing state
  const [origin, setOrigin] = useState<{ lat: number; lng: number } | null>(null);
  const [routes, setRoutes] = useState<RouteResult[]>([]);
  const [activeRoute, setActiveRoute] = useState(0);
  const [destination, setDestination] = useState<Property | null>(null);
  const [loading, setLoading] = useState(false);
  const [pickingOrigin, setPickingOrigin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep the popup open while the user hovers it; close shortly after leaving
  // both the pin and the mini-card.
  const scheduleClose = (marker: L.Marker) => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => marker.closePopup(), 350);
  };
  const cancelClose = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const fetchRoute = async (from: { lat: number; lng: number }, to: Property) => {
    setLoading(true);
    setError(null);
    const results = await getRoutes(from, { lat: to.lat, lng: to.lng }, locale);
    setLoading(false);
    if (results.length === 0) {
      setError(t("route_error"));
      return;
    }
    setOrigin(from);
    setRoutes(results);
    setActiveRoute(0);
    setDestination(to);
    setPickingOrigin(false);
  };

  const startRoute = (property: Property) => {
    cancelClose();
    if (activeMarkerRef.current) activeMarkerRef.current.closePopup();
    setRoutes([]);
    setActiveRoute(0);
    setOrigin(null);
    setDestination(property);
    setError(null);

    if (typeof navigator !== "undefined" && navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          fetchRoute({ lat: pos.coords.latitude, lng: pos.coords.longitude }, property);
        },
        () => {
          setLoading(false);
          setPickingOrigin(true);
          setError(t("geolocation_error"));
        },
        { timeout: 10000, maximumAge: 60000 }
      );
    } else {
      setPickingOrigin(true);
      setError(t("geolocation_error"));
    }
  };

  const handlePickOrigin = (latlng: L.LatLng) => {
    if (!destination) return;
    fetchRoute({ lat: latlng.lat, lng: latlng.lng }, destination);
  };

  const clearRoute = () => {
    setRoutes([]);
    setActiveRoute(0);
    setOrigin(null);
    setDestination(null);
    setPickingOrigin(false);
    setError(null);
    fitBoundsToProperties(mapRef.current, properties);
  };

  // Fit bounds to origin + destination once a route is drawn
  useEffect(() => {
    if (routes.length > 0 && origin && destination && mapRef.current) {
      const bounds = L.latLngBounds([
        [origin.lat, origin.lng] as [number, number],
        [destination.lat, destination.lng] as [number, number],
      ]);
      mapRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
    }
  }, [routes, origin, destination]);

  const icon = useMemo(() => makeHouseIcon(), []);
  const originIcon = useMemo(() => makeOriginIcon(), []);
  const center: [number, number] = properties.length
    ? [properties[0].lat, properties[0].lng]
    : [-34.6037, -58.3816]; // Buenos Aires fallback

  // While a route is being requested, only show the consulted property.
  const visibleProperties = destination
    ? properties.filter((p) => p.id === destination.id)
    : properties;

  const handleFit = () => {
    clearRoute();
  };

  const zoomToProperty = (p: Property) => {
    mapRef.current?.flyTo([p.lat, p.lng], 15, { duration: 0.8 });
  };

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={center}
        zoom={11}
        scrollWheelZoom={false}
        attributionControl={false}
        className="h-full w-full z-0"
      >
        {isDark ? (
          <>
            <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
            <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}" />
          </>
        ) : (
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        )}

        {visibleProperties.map((p) => (
          <Marker
            key={p.id}
            position={[p.lat, p.lng]}
            icon={icon}
            eventHandlers={{
              mouseover: (e) => {
                cancelClose();
                activeMarkerRef.current = e.target;
                e.target.openPopup();
              },
              mouseout: (e) => scheduleClose(e.target),
              click: () => zoomToProperty(p),
            }}
          >
            <Popup className="property-map-popup">
              <div
                onMouseEnter={cancelClose}
                onMouseLeave={() => {
                  if (activeMarkerRef.current) scheduleClose(activeMarkerRef.current);
                }}
              >
                <div className="relative">
                  <img src={p.imageUrl} alt={p.imageAlt} className="w-full h-32 object-cover" />
                  <span className="absolute top-2 left-2 bg-white/90 text-nordic-dark text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full">
                    {p.type === "RENT" || p.type === "RENTED" ? t("type_rent") : t("type_sale")}
                  </span>
                </div>
                <div className="px-3 py-2">
                  <p className="font-bold text-mosque text-[13px] leading-none">
                    ${p.price.toLocaleString()}
                    {p.priceLabel && (
                      <span className="text-[10px] font-normal text-nordic-muted ml-1">{p.priceLabel}</span>
                    )}
                  </p>
                  <p className="text-nordic-dark font-medium text-xs leading-tight truncate mt-0.5">{p.title}</p>
                  <p className="text-nordic-muted text-[11px] leading-tight truncate mt-px">
                    {[p.address, p.city, p.state].filter(Boolean).join(", ")}
                  </p>
                  <div className="mt-1 pt-1 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 text-nordic-muted text-[11px]">
                      <span className="flex items-center gap-0.5">
                        <span className="material-icons text-[12px]">king_bed</span>
                        {p.bedrooms}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <span className="material-icons text-[12px]">bathtub</span>
                        {p.bathrooms}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <span className="material-icons text-[12px]">square_foot</span>
                        {p.area}m²
                      </span>
                    </div>
                    <Link
                      href={`/propiedades/${p.slug}`}
                      className="text-[11px] font-semibold text-mosque hover:text-mosque/70 transition-colors"
                    >
                      {t("view")} →
                    </Link>
                  </div>
                  <button
                    onClick={() => startRoute(p)}
                    className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-mosque text-white text-xs font-semibold hover:bg-mosque/90 transition-colors"
                  >
                    <span className="material-icons text-[15px]">directions</span>
                    {t("get_directions")}
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {routes.map((r, i) => (
          <Polyline
            key={i}
            positions={r.geometry}
            pathOptions={{
              color: i === activeRoute ? "#ef4444" : "#3b82f6",
              weight: i === activeRoute ? 6 : 4,
              opacity: i === activeRoute ? 0.95 : 0.55,
            }}
            eventHandlers={{ click: () => setActiveRoute(i) }}
          />
        ))}
        {origin && (
          <Marker
            position={[origin.lat, origin.lng]}
            icon={originIcon}
            draggable
            eventHandlers={{
              dragend: (e) => {
                const ll = (e.target as L.Marker).getLatLng();
                if (destination) fetchRoute({ lat: ll.lat, lng: ll.lng }, destination);
              },
            }}
          />
        )}

        <FitBounds properties={properties} />
        <CaptureMap mapRef={mapRef} />
        <MapClickHandler active={pickingOrigin} onPick={handlePickOrigin} />
      </MapContainer>

      {/* Fit to bounds / clear route */}
      <button
        onClick={handleFit}
        className="absolute bottom-4 left-4 z-[1000] w-10 h-10 rounded-full bg-white text-nordic-dark shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
        title={routes.length > 0 ? t("close") : "Centrar en el área de estudio"}
        aria-label={routes.length > 0 ? t("close") : "Centrar en el área de estudio"}
      >
        <span className="material-icons">{routes.length > 0 ? "close" : "fit_screen"}</span>
      </button>

      {/* Loading route */}
      {loading && !pickingOrigin && (
        <div className="absolute inset-x-0 top-3 z-[1001] flex justify-center pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-lg text-nordic-dark text-xs font-medium">
            <span className="material-icons text-sm animate-spin text-mosque">progress_activity</span>
            {t("loading_route")}
          </div>
        </div>
      )}

      {/* Geolocation denied — pick origin on map */}
      {pickingOrigin && (
        <div className="absolute inset-x-0 top-3 z-[1001] flex justify-center pointer-events-none px-4">
          <div className="pointer-events-auto flex items-center gap-2 px-4 py-2 rounded-full bg-nordic-dark text-white text-xs font-medium shadow-lg">
            <span className="material-icons text-sm">touch_app</span>
            {t("pick_origin")}
          </div>
        </div>
      )}

      {/* Route error (non-blocking) */}
      {error && !pickingOrigin && !loading && routes.length === 0 && (
        <div className="absolute inset-x-0 top-3 z-[1001] flex justify-center pointer-events-none px-4">
          <div className="pointer-events-auto flex items-center gap-2 px-4 py-2 rounded-full bg-red-600 text-white text-xs font-medium shadow-lg">
            <span className="material-icons text-sm">error_outline</span>
            {error}
          </div>
        </div>
      )}

      {/* Instructions panel */}
      {routes.length > 0 && destination && (
        <RouteInstructions
          routes={routes}
          activeRoute={activeRoute}
          onSelectRoute={setActiveRoute}
          onClose={clearRoute}
        />
      )}
    </div>
  );
}