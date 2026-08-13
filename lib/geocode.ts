const PHOTON_URL = "https://photon.komoot.io";
const NOMINATIM_SEARCH = "https://nominatim.openstreetmap.org/search";
const NOMINATIM_REVERSE = "https://nominatim.openstreetmap.org/reverse";

export interface AddressSuggestion {
  /** Full display string, e.g. "Miguel de Azcuénaga, 543, Guaymallén" */
  label: string;
  /** Value for the address field: street + house number only (no city) */
  value: string;
  street: string;
  housenumber: string;
  lat: number;
  lng: number;
  city: string | null;
  state: string | null;
  country: string | null;
}

interface ReverseGeocodeResult {
  address: string;
  city: string | null;
  state: string | null;
  country: string | null;
}

function buildAddressValue(street: string, housenumber: string, locale: string): string {
  if (street && housenumber) {
    return locale === "es" || locale === "pt"
      ? `${street}, ${housenumber}`
      : `${housenumber} ${street}`;
  }
  return street || "";
}

function makeSuggestion(
  value: string,
  street: string,
  housenumber: string,
  lat: number,
  lng: number,
  city: string | null,
  state: string | null,
  country: string | null
): AddressSuggestion {
  const label = value + (city ? `, ${city}` : "") + (!city && state ? `, ${state}` : "");
  return { label, value, street, housenumber, lat, lng, city, state, country };
}

/** Nominatim forward search — richer than Photon (includes house numbers). */
async function searchNominatim(query: string, locale: string): Promise<AddressSuggestion[]> {
  const url = `${NOMINATIM_SEARCH}?format=jsonv2&addressdetails=1&limit=6&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
  if (!res.ok) return [];
  const data = await res.json();
  if (!Array.isArray(data)) return [];

  const out: AddressSuggestion[] = [];
  for (const r of data) {
    const a = r.address || {};
    const street = a.road || a.pedestrian || a.footway || a.path || "";
    const housenumber = a.house_number || "";
    if (!street && !housenumber) continue;

    const lat = parseFloat(r.lat);
    const lng = parseFloat(r.lon);
    if (!lat || !lng) continue;

    const city = a.city || a.town || a.village || a.municipality || a.city_district || null;
    const state = a.state || null;
    const country = a.country || null;
    const value = buildAddressValue(street, housenumber, locale);
    out.push(makeSuggestion(value, street, housenumber, lat, lng, city, state, country));
  }
  return out;
}

/** Photon forward search — fallback (no usage limits). */
async function searchPhoton(query: string, locale: string): Promise<AddressSuggestion[]> {
  const url = `${PHOTON_URL}/api/?q=${encodeURIComponent(query)}&limit=6`;
  const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) return [];
  const data = await res.json();
  const features = data?.features ?? [];

  const out: AddressSuggestion[] = [];
  for (const f of features) {
    const p = f.properties || {};
    const street = String(p.street || p.name || "");
    const housenumber = String(p.housenumber || "");
    if (!street && !housenumber) continue;

    const [lng, lat] = f.geometry?.coordinates ?? [0, 0];
    if (!lat || !lng) continue;

    const city = p.city || p.town || p.village || p.locality || null;
    const state = p.state || null;
    const country = p.country || null;
    const value = buildAddressValue(street, housenumber, locale);
    out.push(makeSuggestion(value, street, housenumber, lat, lng, city, state, country));
  }
  return out;
}

/**
 * Forward address search (autocomplete). Nominatim first (returns the full
 * address including the house number), Photon as a fallback.
 */
export async function searchAddresses(query: string, locale: string = "en"): Promise<AddressSuggestion[]> {
  if (!query || query.trim().length < 4) return [];

  try {
    const results = await searchNominatim(query.trim(), locale);
    if (results.length > 0) return results;
  } catch {
    /* fall through */
  }

  try {
    return await searchPhoton(query.trim(), locale);
  } catch {
    return [];
  }
}

export interface GeocodePoint {
  lat: number;
  lng: number;
}

/**
 * Forward geocoding of a full address string → coordinates (Nominatim first).
 * Used to reposition the map marker when the user edits the locality/province
 * and leaves the field.
 */
export async function geocodeAddress(query: string): Promise<GeocodePoint | null> {
  if (!query || query.trim().length < 4) return null;
  try {
    const results = await searchAddresses(query, "es");
    if (results.length > 0) {
      return { lat: results[0].lat, lng: results[0].lng };
    }
  } catch {
    /* ignore */
  }
  return null;
}

/**
 * Reverse geocoding. Nominatim first (more complete, includes the house number
 * when the point matches a building), Photon as a fallback.
 */export async function reverseGeocode(lat: number, lng: number, locale: string = "en"): Promise<ReverseGeocodeResult | null> {
  if (!lat || !lng) return null;

  try {
    const url = `${NOMINATIM_REVERSE}?format=jsonv2&zoom=18&addressdetails=1&lat=${lat}&lon=${lng}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (res.ok) {
      const data = await res.json();
      const a = data?.address;
      if (a) {
        const street = a.road || a.pedestrian || a.footway || a.path || "";
        const housenumber = a.house_number || "";
        const city = a.city || a.town || a.village || a.municipality || a.city_district || null;
        const state = a.state || null;
        const country = a.country || null;
        const address = buildAddressValue(street, housenumber, locale);
        if (address) return { address, city, state, country };
      }
    }
  } catch {
    /* fall through */
  }

  try {
    const res = await fetch(`${PHOTON_URL}/reverse?lat=${lat}&lon=${lng}`, { signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      const data = await res.json();
      const p = data?.features?.[0]?.properties;
      if (p) {
        const street = p.street || "";
        const housenumber = p.housenumber || "";
        const city = p.city || p.town || p.village || p.locality || null;
        const state = p.state || null;
        const country = p.country || null;
        const address = buildAddressValue(street, housenumber, locale);
        if (address) return { address, city, state, country };
      }
    }
  } catch {
    /* ignore */
  }

  return null;
}