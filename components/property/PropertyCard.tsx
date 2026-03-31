import Image from "next/image";
import { Property } from "@/interfaces/property";

interface Props {
  property: Property;
  className?: string; // e.g. "hidden lg:flex" for responsive layouts
}

export const PropertyCard = ({ property, className = "" }: Props) => {
  return (
    <article className={`bg-white rounded-xl overflow-hidden shadow-card hover:shadow-soft transition-all duration-300 group cursor-pointer h-full flex flex-col ${className}`}>
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image 
          fill
          alt={property.imageAlt} 
          className="object-cover transition-transform duration-500 group-hover:scale-110" 
          src={property.imageUrl}
        />
        <button className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-mosque hover:text-white transition-colors text-nordic-dark">
          <span className="material-icons text-lg">favorite_border</span>
        </button>
        <div className={`absolute bottom-3 left-3 text-white text-xs font-bold px-2 py-1 rounded ${property.type === 'SALE' ? 'bg-nordic-dark/90' : 'bg-mosque/90'}`}>
          {property.type === 'SALE' ? 'FOR SALE' : 'FOR RENT'}
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
  );
};
