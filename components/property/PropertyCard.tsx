"use client";

import Image from "next/image";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Property } from "@/interfaces/property";
import { FavoriteButton } from "@/components/ui/FavoriteButton";

interface Props {
  property: Property;
  className?: string; // e.g. "hidden lg:flex" for responsive layouts
}

const BLUR_PLACEHOLDER = "data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoCAAEAAQAcJaQAA3AA/v+AEAA=";

function getBadgeStyle(type: string) {
  switch (type) {
    case 'SOLD': return 'bg-gray-500/90';
    case 'RENTED': return 'bg-blue-900/90';
    case 'SALE': return 'bg-nordic-dark/90';
    case 'RENT': return 'bg-mosque/90';
    default: return 'bg-nordic-dark/90';
  }
}

function getBadgeText(t: any, type: string) {
  switch (type) {
    case 'SOLD': return 'Sold';
    case 'RENTED': return 'Rented';
    case 'SALE': return t("for_sale");
    case 'RENT': return t("for_rent");
    default: return type;
  }
}

export const PropertyCard = ({ property, className = "" }: Props) => {
  const t = useTranslations("PropertyCard");
  const isInactive = !property.active;
  return (
    <Link href={`/propiedades/${property.slug}`} className={`block h-full ${className}`}>
      <article className="bg-white rounded-xl overflow-hidden shadow-card hover:shadow-xl transition-all duration-500 group cursor-pointer h-full flex flex-col hover:-translate-y-1">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image 
            fill
            priority
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            alt={property.imageAlt} 
            className={`object-cover transition-transform duration-700 group-hover:scale-110 ${isInactive ? 'grayscale opacity-70' : ''}`} 
            src={property.imageUrl}
            placeholder="blur"
            blurDataURL={BLUR_PLACEHOLDER}
          />
          <FavoriteButton
            slug={property.slug}
            className="absolute top-3 right-3 p-2 rounded-full"
          />
          <div className={`absolute bottom-3 left-3 text-white text-xs font-bold px-2 py-1 rounded ${getBadgeStyle(property.type)}`}>
            {getBadgeText(t, property.type)}
          </div>
        </div>
        <div className="p-4 flex flex-col flex-grow">
          <div className="flex justify-between items-baseline mb-2">
            <h3 className="font-bold text-lg text-nordic-dark">
              ${property.price.toLocaleString()}
              {property.priceLabel && <span className="text-sm font-normal text-nordic-muted">{property.priceLabel}</span>}
            </h3>
          </div>
          <h4 className="text-nordic-dark font-medium truncate mb-1">{property.title}</h4>
          <p className="text-nordic-muted text-xs mb-4">{property.address}</p>
          <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1 text-nordic-muted text-xs">
              <span className="material-icons text-sm text-mosque/80">king_bed</span> {property.bedrooms}
            </div>
            <div className="flex items-center gap-1 text-nordic-muted text-xs">
              <span className="material-icons text-sm text-mosque/80">bathtub</span> {property.bathrooms}
            </div>
            <div className="flex items-center gap-1 text-nordic-muted text-xs">
              <span className="material-icons text-sm text-mosque/80">square_foot</span> {property.area}m²
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
};
