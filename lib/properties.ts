import { Property, FeaturedProperty, PropertyImage } from "@/interfaces/property";
import { createServerClient } from "@/lib/supabase/server";

const PAGE_SIZE = 8;

interface GetPropertiesResult {
  properties: Property[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1de2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1449844908441-8829872d2607?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1510798831971-661eb04b3739?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1518780664697-55e3ad937233?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600585154526-990dced4db0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600585152220-90363fe7e115?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600607686527-6fb886090705?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600566752355-35792bedcfea?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600585153490-76fb20a32601?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600573472559-4700b5220c81?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600585152915-d208bec867a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1513584684374-8bab748fbf90?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1503899036067-c6b772b1573c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1505843513577-22bb7dc39e08?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1512111468-477c8248162b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1501183638710-841bfd591740?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1430285561322-780f5f6b2158?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1464146072230-91cfaafc40d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1513694203232-719a280e022f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
];

const assignedImages = new Map<string, string>();
let nextImageIndex = 0;

function getFallbackImage(id: string) {
  if (!id) return FALLBACK_IMAGES[0];
  
  if (assignedImages.has(id)) {
    return assignedImages.get(id)!;
  }

  const img = FALLBACK_IMAGES[nextImageIndex % FALLBACK_IMAGES.length];
  assignedImages.set(id, img);
  nextImageIndex++;
  return img;
}

/** Maps a raw Supabase row to the Property interface */
function rowToProperty(row: { [key: string]: unknown; property_images?: PropertyImage[] }): Property {
  // Images handling (new schema)
  const images = row.property_images ?? [];
  const mainImage = images.find((img) => img.is_main) ?? images[0];


  return {
    id: row.id as string,
    slug: row.slug as string,
    title: row.title as string,
    price: Number(row.price),
    priceLabel: (row.price_label as string | null) ?? undefined,
    location: row.location as string,
    address: row.address as string,
    type: row.type as "SALE" | "RENT",
    bedrooms: Number(row.bedrooms),
    bathrooms: Number(row.bathrooms),
    garages: Number(row.garages),
    area: Number(row.area),
    description: (row.description as string | null) ?? undefined,
    amenities: (row.amenities as string[] | null) ?? undefined,
    lat: Number(row.lat ?? 37.4419),
    lng: Number(row.lng ?? -122.1430),
    imageUrl: mainImage?.url || getFallbackImage(row.id as string),
    imageAlt: row.title as string,
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
  page: number = 1,
  query?: string,
  beds?: number,
  baths?: number,
  propertyType?: string,
  priceMin?: number,
  priceMax?: number
): Promise<GetPropertiesResult> {
  const supabase = createServerClient();
  const currentPage = Math.max(1, page);
  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let queryBuilder = supabase
    .from("properties")
    .select("*, property_images(*)", { count: "exact" })
    .eq("is_featured", false);

  if (query) {
    queryBuilder = queryBuilder.or(`location.ilike.%${query}%,title.ilike.%${query}%,address.ilike.%${query}%`);
  }

  if (beds !== undefined && beds > 0) {
    queryBuilder = queryBuilder.gte("bedrooms", beds);
  }

  if (baths !== undefined && baths > 0) {
    queryBuilder = queryBuilder.gte("bathrooms", baths);
  }

  if (propertyType) {
    queryBuilder = queryBuilder.textSearch("title", `'${propertyType}'`, {
      type: "plain",
      config: "english",
    });
  }

  if (priceMin !== undefined && priceMin > 0) {
    queryBuilder = queryBuilder.gte("price", priceMin);
  }

  if (priceMax !== undefined && priceMax > 0) {
    queryBuilder = queryBuilder.lte("price", priceMax);
  }

  const { data, count, error } = await queryBuilder
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
    .select("*, property_images(*)")
    .eq("is_featured", true)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[getFeaturedProperties] Supabase error:", error.message);
    return [];
  }

  return (data ?? []).map(rowToFeaturedProperty);
}

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
    images: imagesData,
  };
}
