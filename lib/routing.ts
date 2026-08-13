export interface RouteStep {
  distance: number; // meters
  duration: number; // seconds
  instruction: string;
  type: number; // Valhalla maneuver type code
  name: string;
}

export interface RouteResult {
  geometry: [number, number][]; // [lat, lng]
  steps: RouteStep[];
  distance: number; // meters
  duration: number; // seconds
}

interface ValhallaManeuver {
  type: number;
  instruction: string;
  length: number;
  time: number;
  street_names?: string[];
}

interface ValhallaLeg {
  shape: string;
  maneuvers: ValhallaManeuver[];
}

interface ValhallaTrip {
  status: number;
  summary?: { length: number; time: number };
  legs?: ValhallaLeg[];
}

interface ValhallaResponse {
  trip?: ValhallaTrip;
  alternates?: { trip: ValhallaTrip }[];
}

const VALHALLA_URL = "https://valhalla1.openstreetmap.de/route";

const LANG_MAP: Record<string, string> = {
  es: "es-ES",
  en: "en-US",
  pt: "pt-PT",
};

/** Decodes a Valhalla/Google encoded polyline into [lat, lng] pairs. */
function decodePolyline(encoded: string): [number, number][] {
  const points: [number, number][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let b: number;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;

    points.push([lat * 1e-6, lng * 1e-6]);
  }

  return points;
}

/**
 * Calculates driving routes (primary + alternates) between two points using
 * the free FOSSGIS Valhalla instance. Returns full geometries + localized
 * turn-by-turn instructions, or an empty array on any failure.
 */
export async function getRoutes(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  locale = "en"
): Promise<RouteResult[]> {
  const body = {
    locations: [
      { lat: origin.lat, lon: origin.lng },
      { lat: destination.lat, lon: destination.lng },
    ],
    costing: "auto",
    alternates: 3,
    directions_options: {
      units: "kilometers",
      language: LANG_MAP[locale] || "en-US",
    },
  };

  try {
    const res = await fetch(VALHALLA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return [];

    const data = (await res.json()) as ValhallaResponse;
    const primary = data.trip;
    if (!primary || primary.status !== 0 || !primary.legs || primary.legs.length === 0) return [];

    const results: RouteResult[] = [tripToResult(primary)];
    for (const alt of data.alternates ?? []) {
      if (alt.trip && alt.trip.status === 0 && alt.trip.legs?.length) {
        results.push(tripToResult(alt.trip));
      }
    }
    return results;
  } catch {
    return [];
  }
}

function tripToResult(trip: ValhallaTrip): RouteResult {
  const leg = trip.legs![0];
  const geometry = leg.shape ? decodePolyline(leg.shape) : [];

  const steps: RouteStep[] = (leg.maneuvers ?? []).map((m) => ({
    distance: Math.round((m.length ?? 0) * 1000),
    duration: Math.round(m.time ?? 0),
    instruction: m.instruction || "",
    type: m.type ?? 0,
    name: m.street_names?.[0] || "",
  }));

  return {
    geometry,
    steps,
    distance: Math.round((trip.summary?.length ?? 0) * 1000),
    duration: Math.round(trip.summary?.time ?? 0),
  };
}

export function formatDistance(meters: number, locale: string): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(meters / 1000)} km`;
}

export function formatDuration(seconds: number): string {
  const mins = Math.round(seconds / 60);
  if (mins < 1) return "< 1 min";
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h} h ${m} min`;
}