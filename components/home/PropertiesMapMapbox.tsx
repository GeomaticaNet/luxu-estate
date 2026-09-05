"use client";

import { Map, Marker, NavigationControl, Popup, Source, Layer } from "react-map-gl/mapbox";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Link } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { useDarkMode } from "@/hooks/useDarkMode";
import { PropertyImageCarousel } from "@/components/property/PropertyImageCarousel";
import { getRoutes } from "@/lib/routing";
import type { RouteResult } from "@/lib/routing";
import { RouteInstructions } from "./RouteInstructions";
import type { Property } from "@/interfaces/property";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;
mapboxgl.accessToken = MAPBOX_TOKEN;

// Icono Tabler "home" (contorno blanco)
const TABLER_HOME = `
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M5 12l-2 0l9 -9l9 9l-2 0"/>
  <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7"/>
  <path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6"/>
</svg>`;

// SVG del pin verde mosque
const GREEN_PIN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 41" width="25" height="41"><path d="M12.5 0C5.6 0 0 5.6 0 12.5c0 9.4 12.5 28.5 12.5 28.5S25 21.9 25 12.5C25 5.6 19.4 0 12.5 0z" fill="#006655" stroke="#fff" stroke-width="2"/><circle cx="12.5" cy="12.5" r="5.5" fill="#fff"/></svg>`;

// Icono del punto azul de origen
const ORIGIN_DOT_HTML = `<div style="width:18px;height:18px;border-radius:50%;background:#2563eb;border:3px solid #fff;box-shadow:0 0 0 2px rgba(37,99,235,0.4),0 2px 6px rgba(0,0,0,0.35);cursor:grab;"></div>`;

interface Props {
  properties: Property[];
}

export default function PropertiesMapMapbox({ properties }: Props) {
  const t = useTranslations("Map");
  const locale = useLocale();
  const isDark = useDarkMode();
  const mapRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Estado de rutas
  const [origin, setOrigin] = useState<{ lat: number; lng: number } | null>(null);
  const [routes, setRoutes] = useState<RouteResult[]>([]);
  const [activeRoute, setActiveRoute] = useState(0);
  const [destination, setDestination] = useState<Property | null>(null);
  const [loading, setLoading] = useState(false);
  const [pickingOrigin, setPickingOrigin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Popup por clic
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  // Popup por hover
  const [hoveredProperty, setHoveredProperty] = useState<string | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // El popup activo es cualquiera de los dos
  const activePopupId = selectedProperty || hoveredProperty;

  const cancelClose = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const scheduleClose = useCallback(() => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      setHoveredProperty(null);
    }, 350);
  }, []);

  const closePopup = useCallback(() => {
    setSelectedProperty(null);
    setHoveredProperty(null);
    cancelClose();
  }, []);

  // Centrar mapa en propiedades
  const center: [number, number] = properties.length
    ? [properties[0].lng, properties[0].lat]
    : [-58.3816, -34.6037];

  // Fit bounds al montar
  useEffect(() => {
    if (!mapRef.current || properties.length === 0) return;
    const bounds = new mapboxgl.LngLatBounds();
    properties.forEach((p) => bounds.extend([p.lng, p.lat]));
    mapRef.current.fitBounds(bounds, { padding: 48, maxZoom: 14, duration: 0 });
    setTimeout(() => mapRef.current?.resize(), 350);
  }, [properties, mapLoaded]);

  // Fit a ruta origen+destino
  useEffect(() => {
    if (routes.length > 0 && origin && destination && mapRef.current) {
      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend([origin.lng, origin.lat]);
      bounds.extend([destination.lng, destination.lat]);
      mapRef.current.fitBounds(bounds, { padding: 40, maxZoom: 16 });
    }
  }, [routes, origin, destination]);

  // Obtener ruta desde Valhalla
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

  // Iniciar ruta desde un popup
  const startRoute = useCallback(
    (property: Property) => {
      closePopup();
      setRoutes([]);
      setActiveRoute(0);
      setOrigin(null);
      setDestination(property);
      setError(null);

      if (typeof navigator !== "undefined" && navigator.geolocation) {
        setLoading(true);
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            fetchRoute(
              { lat: pos.coords.latitude, lng: pos.coords.longitude },
              property
            );
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
    },
    [t, locale]
  );

  // Clic en mapa para elegir origen
  const handleMapClick = useCallback(
    (e: any) => {
      if (!pickingOrigin || !destination) return;
      fetchRoute({ lat: e.lngLat.lat, lng: e.lngLat.lng }, destination);
    },
    [pickingOrigin, destination, locale]
  );

  // Limpiar ruta
  const clearRoute = useCallback(() => {
    setRoutes([]);
    setActiveRoute(0);
    setOrigin(null);
    setDestination(null);
    setPickingOrigin(false);
    setError(null);
    if (mapRef.current && properties.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      properties.forEach((p) => bounds.extend([p.lng, p.lat]));
      mapRef.current.fitBounds(bounds, { padding: 48, maxZoom: 14 });
    }
  }, [properties]);

  // Zoom a una propiedad al clickear su marker
  const zoomToProperty = useCallback((p: Property) => {
    mapRef.current?.flyTo({ center: [p.lng, p.lat], zoom: 15, duration: 800 });
  }, []);

  // Fuente GeoJSON para las rutas
  const routesGeoJSON = useMemo(() => {
    if (routes.length === 0) return null;
    return {
      type: "FeatureCollection" as const,
      features: routes.map((r, i) => ({
        type: "Feature" as const,
        properties: { index: i },
        geometry: {
          type: "LineString" as const,
          coordinates: r.geometry.map(([lat, lng]) => [lng, lat]),
        },
      })),
    };
  }, [routes]);

  // Propiedades visibles (durante ruta solo mostrar la consultada)
  const visibleProperties = destination
    ? properties.filter((p) => p.id === destination.id)
    : properties;

  const mapStyle = "mapbox://styles/mapbox/satellite-streets-v12";

  return (
    <div className="relative h-full w-full">
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle={mapStyle}
        initialViewState={{ latitude: center[1], longitude: center[0], zoom: 11 }}
        scrollZoom={false}
        attributionControl={false}
        onLoad={() => setMapLoaded(true)}
        onClick={handleMapClick}
        style={{ width: "100%", height: "100%" }}
      >
        <NavigationControl position="top-left" showCompass={false} />

        {/* Marcadores de propiedades */}
        {visibleProperties.map((p) => (
          <Marker
            key={p.id}
            latitude={p.lat}
            longitude={p.lng}
            anchor="bottom"
            offset={[0, -4]}
          >
            <div
              className="property-pin-mapbox"
              onMouseEnter={() => {
                cancelClose();
                setHoveredProperty(p.id);
              }}
              onMouseLeave={() => scheduleClose()}
              onClick={() => {
                setSelectedProperty(p.id);
                zoomToProperty(p);
              }}
              dangerouslySetInnerHTML={{ __html: TABLER_HOME }}
              style={{
                width: 34,
                height: 34,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50% 50% 50% 0",
                transform: "rotate(-45deg)",
                background: "var(--color-mosque)",
                border: "2.5px solid #fff",
                boxShadow: "0 6px 16px rgba(25,50,47,0.35)",
                cursor: "pointer",
                transition: "transform 0.18s ease",
              }}
            />
          </Marker>
        ))}

        {/* Popup de propiedad (hover + clic) */}
        {activePopupId && (() => {
          const p = properties.find((pr) => pr.id === activePopupId);
          if (!p) return null;
          return (
            <Popup
              key={`popup-${p.id}`}
              latitude={p.lat}
              longitude={p.lng}
              anchor="bottom"
              offset={42}
              closeButton={false}
              closeOnClick={false}
            >
              <div
                className="property-map-popup group"
                onMouseEnter={cancelClose}
                onMouseLeave={scheduleClose}
              >
                {/* Botón cerrar equis */}
                <button
                  onClick={closePopup}
                  className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
                  style={{
                    background: "rgba(25, 50, 47, 0.5)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    color: "#fff",
                    fontSize: 13,
                    lineHeight: 1,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                  }}
                >
                  ✕
                </button>
                <div className="relative h-32 overflow-hidden">
                  {(() => {
                    const images =
                      p.images && p.images.length > 0
                        ? p.images
                        : [p.imageUrl];
                    return images.length > 1 ? (
                      <PropertyImageCarousel images={images} alt={p.imageAlt} compact />
                    ) : (
                      <img
                        src={p.imageUrl}
                        alt={p.imageAlt}
                        className="w-full h-full object-cover"
                      />
                    );
                  })()}
                  <span className="absolute top-2 left-2 z-20 bg-white/90 text-nordic-dark text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full">
                    {p.type === "RENT" || p.type === "RENTED"
                      ? t("type_rent")
                      : t("type_sale")}
                  </span>
                </div>
                <div className="px-3 py-2">
                  <p className="font-bold text-mosque text-[13px] leading-none">
                    ${p.price.toLocaleString()}
                    {p.priceLabel && (
                      <span className="text-[10px] font-normal text-nordic-muted ml-1">
                        {p.priceLabel}
                      </span>
                    )}
                  </p>
                  <p className="text-nordic-dark font-medium text-xs leading-tight truncate mt-0.5">
                    {p.title}
                  </p>
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
          );
        })()}

        {/* Capa de rutas */}
        {mapLoaded && routesGeoJSON && (
          <Source id="routes-source" type="geojson" data={routesGeoJSON}>
            <Layer
              id="routes-bg"
              type="line"
              paint={{
                "line-color": [
                  "case",
                  ["==", ["get", "index"], activeRoute],
                  "#ef4444",
                  "#3b82f6",
                ],
                "line-width": [
                  "case",
                  ["==", ["get", "index"], activeRoute],
                  6,
                  4,
                ],
                "line-opacity": [
                  "case",
                  ["==", ["get", "index"], activeRoute],
                  0.95,
                  0.55,
                ],
              }}
            />
          </Source>
        )}

        {/* Marcador de origen (arrastrable) */}
        {origin && (
          <Marker
            latitude={origin.lat}
            longitude={origin.lng}
            anchor="center"
            draggable
            onDragEnd={(e) => {
              if (destination) {
                fetchRoute(
                  { lat: e.lngLat.lat, lng: e.lngLat.lng },
                  destination
                );
              }
            }}
          >
            <div
              dangerouslySetInnerHTML={{ __html: ORIGIN_DOT_HTML }}
              style={{ cursor: "grab" }}
            />
          </Marker>
        )}
      </Map>

      {/* Botón fit/cerrar */}
      <button
        onClick={clearRoute}
        className="absolute bottom-4 left-4 z-[1000] w-10 h-10 rounded-full bg-white text-nordic-dark shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
        title={routes.length > 0 ? t("close") : "Centrar en el área"}
      >
        <span className="material-icons">
          {routes.length > 0 ? "close" : "fit_screen"}
        </span>
      </button>

      {/* Indicador de carga */}
      {loading && !pickingOrigin && (
        <div className="absolute inset-x-0 top-3 z-[1001] flex justify-center pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-lg text-nordic-dark text-xs font-medium">
            <span className="material-icons text-sm animate-spin text-mosque">
              progress_activity
            </span>
            {t("loading_route")}
          </div>
        </div>
      )}

      {/* Seleccionar origen en mapa */}
      {pickingOrigin && (
        <div className="absolute inset-x-0 top-3 z-[1001] flex justify-center pointer-events-none px-4">
          <div className="pointer-events-auto flex items-center gap-2 px-4 py-2 rounded-full bg-nordic-dark text-white text-xs font-medium shadow-lg">
            <span className="material-icons text-sm">touch_app</span>
            {t("pick_origin")}
          </div>
        </div>
      )}

      {/* Error de ruta */}
      {error && !pickingOrigin && !loading && routes.length === 0 && (
        <div className="absolute inset-x-0 top-3 z-[1001] flex justify-center pointer-events-none px-4">
          <div className="pointer-events-auto flex items-center gap-2 px-4 py-2 rounded-full bg-red-600 text-white text-xs font-medium shadow-lg">
            <span className="material-icons text-sm">error_outline</span>
            {error}
          </div>
        </div>
      )}

      {/* Panel de instrucciones */}
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
