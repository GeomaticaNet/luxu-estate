"use client";

import { useState } from "react";
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
}

interface PropertyListProps {
  properties: Property[];
  mainImages: Record<string, string>;
  initialTotal: number;
  initialActive: number;
  initialRent: number;
}

export function PropertyList({ properties, mainImages, initialTotal, initialActive, initialRent }: PropertyListProps) {
  const [activeCount, setActiveCount] = useState(initialActive);

  const stats = [
    { label: "Total Listings", value: initialTotal, icon: "apartment", color: "bg-mosque/10 text-mosque" },
    { label: "Active Properties", value: activeCount, icon: "check_circle", color: "bg-hint-of-green text-mosque" },
    { label: "Pending Sale", value: initialRent, icon: "pending", color: "bg-orange-100 text-orange-600" },
  ];

  const handleToggle = (wasActive: boolean) => {
    setActiveCount(prev => wasActive ? prev - 1 : prev + 1);
  };

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
            onToggle={handleToggle}
          />
        ))}
      </div>
    </>
  );
}
