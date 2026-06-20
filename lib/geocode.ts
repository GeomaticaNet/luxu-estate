const PHOTON_URL = "https://photon.komoot.io";

interface GeocodeResult {
  lat: number;
  lng: number;
}

interface ReverseGeocodeResult {
  address: string;
  state: string | null;
  country: string | null;
}

export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  if (!address || address.trim().length < 5) return null;

  const url = `${PHOTON_URL}/api/?q=${encodeURIComponent(address)}&limit=1`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const data = await res.json();
    const feature = data?.features?.[0];
    if (feature?.geometry?.coordinates) {
      const [lng, lat] = feature.geometry.coordinates;
      return { lat, lng };
    }
    return null;
  } catch {
    return null;
  }
}

export async function reverseGeocode(lat: number, lng: number, locale: string = "en"): Promise<ReverseGeocodeResult | null> {
  if (!lat || !lng) return null;

  const url = `${PHOTON_URL}/reverse?lat=${lat}&lon=${lng}`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const data = await res.json();
    const props = data?.features?.[0]?.properties;
    if (!props) return null;

    const street = props.street || "";
    const houseNumber = props.housenumber || "";
    const state = props.state || null;
    const country = props.country || null;

    let address: string;
    if (street && houseNumber) {
      if (locale === "es" || locale === "pt") {
        address = `${street}, ${houseNumber}`;
      } else {
        address = `${houseNumber} ${street}`;
      }
    } else if (street) {
      address = street;
    } else if (props.name) {
      address = props.name;
    } else {
      address = "";
    }

    return { address, state, country };
  } catch {
    return null;
  }
}
