"use client";

import Image from "next/image";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { FeaturedProperty } from "@/interfaces/property";
import { FavoriteButton } from "@/components/ui/FavoriteButton";

interface Props {
  property: FeaturedProperty;
}

const BLUR_PLACEHOLDER = "data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoCAAEAAQAcJaQAA3AA/v+AEAA=";

export const FeaturedPropertyCard = ({ property }: Props) => {
  const t = useTranslations("PropertyCard");
  return (
    <Link href={`/propiedades/${property.slug}`} className="block group relative rounded-xl overflow-hidden shadow-soft bg-white cursor-pointer transition-all duration-500 hover:shadow-xl hover:-translate-y-1">
      <div className="aspect-[4/3] w-full overflow-hidden relative">
        <Image 
          fill
          priority
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          alt={property.imageAlt} 
          className="object-cover transition-transform duration-700 group-hover:scale-105" 
          src={property.imageUrl}
          placeholder="blur"
          blurDataURL={BLUR_PLACEHOLDER}
        />
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-nordic-dark">
          {property.featuredLabel === 'Exclusive' ? t('exclusive') : t('featured')}
        </div>
        <FavoriteButton
          slug={property.slug}
          className="absolute top-4 right-4 w-10 h-10 rounded-full backdrop-blur-sm"
          iconSize="text-xl"
        />
        {/* Gradient shadow for specific visual effect on some cards if needed, optionally mapping logic, but keeping standard as per design */}
        {property.featuredLabel === 'Exclusive' && <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>}
      </div>
      <div className={`p-6 ${property.featuredLabel === 'Exclusive' ? 'relative' : ''}`}>
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-xl font-medium text-nordic-dark group-hover:text-mosque transition-colors">{property.title}</h3>
            <p className="text-nordic-muted text-sm flex items-center gap-1 mt-1">
              <span className="material-icons text-sm">place</span> {property.address}
            </p>
          </div>
          <span className="text-xl font-semibold text-mosque flex-shrink-0">
            ${property.price.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center gap-6 mt-6 pt-6 border-t border-nordic-dark/5">
          <div className="flex items-center gap-2 text-nordic-muted text-sm">
            <span className="material-icons text-lg">king_bed</span> {property.bedrooms} {t("beds")}
          </div>
          <div className="flex items-center gap-2 text-nordic-muted text-sm">
            <span className="material-icons text-lg">bathtub</span> {property.bathrooms} {t("baths")}
          </div>
          <div className="flex items-center gap-2 text-nordic-muted text-sm">
            <span className="material-icons text-lg">square_foot</span> {property.area.toLocaleString()} m²
          </div>
        </div>
      </div>
    </Link>
  );
};
