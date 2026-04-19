export interface Property {
  id: string;
  slug: string;
  title: string;
  price: number;
  priceLabel?: string;
  location: string;
  address: string;
  type: "SALE" | "RENT";
  bedrooms: number;
  bathrooms: number;
  garages?: number;
  area: number;
  description?: string;
  amenities?: string[];
  lat: number;
  lng: number;
  imageUrl: string;
  imageAlt: string;
}

export interface PropertyImage {
  id: string;
  property_id: string;
  url: string;
  is_main: boolean;
  sort_order: number;
}

export interface FeaturedProperty extends Property {
  featuredLabel: string;
}
