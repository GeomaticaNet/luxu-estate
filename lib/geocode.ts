const PHOTON_URL = "https://photon.komoot.io";

export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
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

export async function reverseGeocode(lat: number, lng: number, locale: string = "en"): Promise<string | null> {
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

    if (street && houseNumber) {
      if (locale === "es" || locale === "pt") {
        return `${street}, ${houseNumber}`;
      }
      return `${houseNumber} ${street}`;
    }
    if (street) return street;
    if (props.name) return props.name;
    return null;
  } catch {
    return null;
  }
}
