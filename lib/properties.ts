import { Property, FeaturedProperty } from "@/interfaces/property";
import { createServerClient } from "@/lib/supabase/server";

const PAGE_SIZE = 8;

interface GetPropertiesResult {
  properties: Property[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

/** Maps a raw Supabase row to the Property interface */
function rowToProperty(row: Record<string, unknown>): Property {
<<<<<<< HEAD
  const images = (row.property_images as Record<string, unknown>[]) ?? [];
  const mainImage = images.find((img) => img.is_main) ?? images[0];

  return {
    id: row.id as string,
    slug: row.slug as string,
=======
  return {
    id: row.id as string,
>>>>>>> 1870eca (feat: Implement Supabase data fetching for properties with pagination.)
    title: row.title as string,
    price: Number(row.price),
    priceLabel: (row.price_label as string | null) ?? undefined,
    location: row.location as string,
    address: row.address as string,
    type: row.type as "SALE" | "RENT",
    bedrooms: Number(row.bedrooms),
    bathrooms: Number(row.bathrooms),
<<<<<<< HEAD
    garages: Number(row.garages),
    area: Number(row.area),
    description: (row.description as string | null) ?? undefined,
    amenities: (row.amenities as string[] | null) ?? undefined,
    lat: Number(row.lat ?? 37.4419),
    lng: Number(row.lng ?? -122.1430),
    imageUrl: (mainImage?.url as string) || "/placeholder.jpg",
    imageAlt: row.title as string,
=======
    area: Number(row.area),
    imageUrl: row.image_url as string,
    imageAlt: row.image_alt as string,
>>>>>>> 1870eca (feat: Implement Supabase data fetching for properties with pagination.)
  };
}

/** Maps a raw Supabase row to the FeaturedProperty interface */
function rowToFeaturedProperty(row: Record<string, unknown>): FeaturedProperty {
  return {
    ...rowToProperty(row),
    featuredLabel: (row.featured_label as string) ?? "Featured",
  };
}

/**
 * Fetches paginated "new in market" properties from Supabase.
 */
export async function getProperties(
  page: number = 1
): Promise<GetPropertiesResult> {
  const supabase = createServerClient();
  const currentPage = Math.max(1, page);
  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, count, error } = await supabase
    .from("properties")
<<<<<<< HEAD
    .select("*, property_images(*)", { count: "exact" })
=======
    .select("*", { count: "exact" })
>>>>>>> 1870eca (feat: Implement Supabase data fetching for properties with pagination.)
    .eq("is_featured", false)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("[getProperties] Supabase error:", error.message);
    return { properties: [], totalCount: 0, totalPages: 1, currentPage: 1 };
  }

  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return {
    properties: (data ?? []).map(rowToProperty),
    totalCount,
    totalPages,
    currentPage,
  };
}

/**
 * Fetches all featured properties from Supabase.
 */
export async function getFeaturedProperties(): Promise<FeaturedProperty[]> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("properties")
<<<<<<< HEAD
    .select("*, property_images(*)")
=======
    .select("*")
>>>>>>> 1870eca (feat: Implement Supabase data fetching for properties with pagination.)
    .eq("is_featured", true)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[getFeaturedProperties] Supabase error:", error.message);
    return [];
  }

  return (data ?? []).map(rowToFeaturedProperty);
}
<<<<<<< HEAD

/**
 * Fetches a single property by slug and its associated images.
 */
export async function getPropertyBySlug(slug: string) {
  const supabase = createServerClient();

  // Fetch property with its images
  const { data: propertyData, error: propertyError } = await supabase
    .from("properties")
    .select("*, property_images(*)")
    .eq("slug", slug)
    .single();

  if (propertyError || !propertyData) {
    console.error(`[getPropertyBySlug] Error fetching property with slug ${slug}:`, propertyError?.message);
    return null;
  }

  const imagesData = (propertyData.property_images as import("@/interfaces/property").PropertyImage[]) ?? [];
  imagesData.sort((a, b) => a.sort_order - b.sort_order);

  return {
    property: rowToProperty(propertyData),
    images: imagesData
  };
}
=======
>>>>>>> 1870eca (feat: Implement Supabase data fetching for properties with pagination.)
