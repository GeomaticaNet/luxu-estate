"use client";

import { PropertyRow } from "./PropertyRow";

interface Property {
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
  type: string;
}

interface PropertyListProps {
  properties: Property[];
  mainImages: Record<string, string>;
  totalListings: number;
  activeProperties: number;
  rentProperties: number;
  showingFrom: number;
  showingTo: number;
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

export function PropertyList(props: PropertyListProps) {
  const { properties, mainImages, totalListings, activeProperties, rentProperties, showingFrom, showingTo, totalCount, currentPage, totalPages } = props;

  const stats = [
    { label: "Total Listings", value: totalListings, icon: "apartment", color: "bg-mosque/10 text-mosque" },
    { label: "Active Properties", value: activeProperties, icon: "check_circle", color: "bg-hint-of-green text-mosque" },
    { label: "For Rent", value: rentProperties, icon: "home", color: "bg-blue-100 text-blue-600" },
  ];

  return (
    <>
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-5 rounded-lg border border-gray-200 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold text-nordic-dark mt-1">{stat.value}</p>
            </div>
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${stat.color}`}>
              <span className="material-icons">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Compact Pagination - Top */}
      <div className="flex items-center justify-between mb-3 px-2">
        <div className="text-xs text-gray-400">
          Showing <span className="font-medium text-gray-600">{showingFrom}</span> to <span className="font-medium text-gray-600">{showingTo}</span> of <span className="font-medium text-gray-600">{totalCount || 0}</span>
        </div>
        <div className="flex gap-1">
          <a
            href={currentPage > 1 ? `?page=${currentPage - 1}` : undefined}
            className={`px-2 py-1 text-xs border border-gray-200 rounded text-gray-500 hover:bg-white hover:text-nordic-dark transition-colors ${currentPage <= 1 ? 'opacity-40 pointer-events-none' : ''}`}
          >
            <span className="material-icons text-sm">chevron_left</span>
          </a>
          <a
            href={currentPage < totalPages ? `?page=${currentPage + 1}` : undefined}
            className={`px-2 py-1 text-xs border border-gray-200 rounded text-gray-500 hover:bg-white hover:text-nordic-dark transition-colors ${currentPage >= totalPages ? 'opacity-40 pointer-events-none' : ''}`}
          >
            <span className="material-icons text-sm">chevron_right</span>
          </a>
        </div>
      </div>

      {/* Property List Container */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50/50 border-b border-gray-100 text-sm font-semibold text-gray-500 uppercase tracking-wider">
          <div className="col-span-6">Property Details</div>
          <div className="col-span-2">Price</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {/* Properties */}
        {properties.map((property, index) => (
          <PropertyRow 
            key={property.id}
            property={property}
            mainImage={mainImages[property.id] || null}
            isLast={index === properties.length - 1}
          />
        ))}
      </div>
    </>
  );
}
