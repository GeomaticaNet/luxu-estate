export interface Property {
  id: string;
  title: string;
  price: number;
  priceLabel?: string;
  location: string;
  address: string;
  type: "SALE" | "RENT";
  bedrooms: number;
  bathrooms: number;
  area: number;
  imageUrl: string;
  imageAlt: string;
}

export interface FeaturedProperty extends Property {
  featuredLabel: string;
}
