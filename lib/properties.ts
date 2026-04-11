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
  return {
    id: row.id as string,
    title: row.title as string,
    price: Number(row.price),
    priceLabel: (row.price_label as string | null) ?? undefined,
    location: row.location as string,
    address: row.address as string,
    type: row.type as "SALE" | "RENT",
    bedrooms: Number(row.bedrooms),
    bathrooms: Number(row.bathrooms),
    area: Number(row.area),
    imageUrl: row.image_url as string,
    imageAlt: row.image_alt as string,
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
    .select("*", { count: "exact" })
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
    .select("*")
    .eq("is_featured", true)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[getFeaturedProperties] Supabase error:", error.message);
    return [];
  }

  return (data ?? []).map(rowToFeaturedProperty);
}
