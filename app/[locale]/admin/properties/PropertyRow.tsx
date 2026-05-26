"use client";

import { togglePropertyActive } from "./actions";

interface PropertyRowProps {
  property: {
    id: string;
    title: string;
    price: number;
    price_label?: string;
    address: string;
    location: string;
    bedrooms: number;
    bathrooms: number;
    area: number;
    active: boolean;
    is_featured: boolean;
  };
  mainImage: string | null;
  isLast: boolean;
  currentPage: number;
}

function StatusBadge({ active, isFeatured }: { active: boolean; isFeatured: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      {active ? (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-hint-of-green text-mosque">
          <span className="w-1.5 h-1.5 rounded-full bg-mosque mr-1.5"></span>
          Active
        </span>
      ) : (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
          <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-1.5"></span>
          Inactive
        </span>
      )}
      {isFeatured && (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mr-1.5"></span>
          Featured
        </span>
      )}
    </div>
  );
}

export function PropertyRow({ property, mainImage, isLast, currentPage }: PropertyRowProps) {
  return (
    <div 
      className={`group grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-5 border-b border-gray-100 hover:bg-background-light transition-colors items-center ${
        isLast ? 'border-b-0' : ''
      }`}
    >
      {/* Property Details */}
      <div className="col-span-12 md:col-span-6 flex gap-4 items-center">
        <div className="relative h-20 w-28 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
          {mainImage && (
            <>
              <img 
                src={mainImage} 
                alt={property.title}
                className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${!property.active ? 'grayscale opacity-60' : ''}`}
              />
              {!property.active && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <span className="material-icons text-white/80 text-2xl">visibility_off</span>
                </div>
              )}
            </>
          )}
        </div>
        <div>
          <h3 className="text-lg font-bold text-nordic-dark group-hover:text-mosque transition-colors cursor-pointer">
            {property.title}
          </h3>
          <p className="text-sm text-gray-500">{property.address}, {property.location}</p>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <span className="material-icons text-[14px]">bed</span> {property.bedrooms} Beds
            </span>
            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
            <span className="flex items-center gap-1">
              <span className="material-icons text-[14px]">bathtub</span> {property.bathrooms} Baths
            </span>
            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
            <span>{property.area} sqft</span>
          </div>
        </div>
      </div>

      {/* Price */}
      <div className="col-span-6 md:col-span-2">
        <div className="text-base font-semibold text-nordic-dark">
          ${Number(property.price).toLocaleString()}
        </div>
        {property.price_label && (
          <div className="text-xs text-gray-400">Monthly: ${property.price_label}</div>
        )}
      </div>

      {/* Status */}
      <div className="col-span-6 md:col-span-2">
        <StatusBadge active={property.active} isFeatured={property.is_featured} />
      </div>

      {/* Actions */}
      <div className="col-span-12 md:col-span-2 flex items-center justify-end gap-2">
        <button className="p-2 rounded-lg text-gray-400 hover:text-mosque hover:bg-hint-of-green/30 transition-all" title="Edit Property">
          <span className="material-icons text-xl">edit</span>
        </button>
        <form action={togglePropertyActive}>
          <input type="hidden" name="propertyId" value={property.id} />
          <input type="hidden" name="currentActive" value={property.active ? "true" : "false"} />
          <input type="hidden" name="currentPage" value={currentPage} />
          <button 
            type="submit"
            className={`p-2 rounded-lg transition-all ${property.active ? 'text-mosque hover:bg-hint-of-green/30' : 'text-gray-400 hover:text-nordic-dark hover:bg-gray-100'}`}
            title={property.active ? 'Deactivate Property' : 'Activate Property'}
          >
            <span className="material-icons text-xl">
              {property.active ? 'visibility' : 'visibility_off'}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
