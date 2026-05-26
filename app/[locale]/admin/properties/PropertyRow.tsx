"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

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
    type: string;
  };
  mainImage: string | null;
  isLast: boolean;
}

function getStatusLabel(active: boolean, type: string) {
  if (!active) {
    if (type === "SOLD") return { text: "Sold", color: "bg-gray-200 text-gray-600" };
    if (type === "RENTED") return { text: "Rented", color: "bg-blue-900 text-blue-100" };
    return { text: "Inactive", color: "bg-gray-100 text-gray-500" };
  }
  return { text: "Active", color: "bg-hint-of-green text-mosque" };
}

function StatusBadge({ active, isFeatured, type }: { active: boolean; isFeatured: boolean; type: string }) {
  const status = getStatusLabel(active, type);

  return (
    <div className="flex flex-col gap-1">
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${active ? 'bg-mosque' : type === 'SOLD' ? 'bg-gray-500' : type === 'RENTED' ? 'bg-blue-300' : 'bg-gray-400'}`}></span>
        {status.text}
      </span>
      {type === "RENT" && active && (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5"></span>
          For Rent
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

export function PropertyRow({ property, mainImage, isLast }: PropertyRowProps) {
  const [isActive, setIsActive] = useState(property.active);
  const [propertyType, setPropertyType] = useState(property.type);
  const [isLoading, setIsLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const handleAction = async (action: string) => {
    setIsLoading(true);
    setMenuOpen(false);

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        alert("Not logged in");
        return;
      }

      const res = await fetch("/api/property/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: property.id,
          action,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        alert("Error: " + err);
        return;
      }

      // Update local state for immediate feedback
      if (action === "toggle") {
        setIsActive(!isActive);
      } else if (action === "forSale") {
        setPropertyType("SALE");
        setIsActive(true);
      } else if (action === "forRent") {
        setPropertyType("RENT");
        setIsActive(true);
      } else if (action === "sold") {
        setPropertyType("SOLD");
        setIsActive(false);
      } else if (action === "rented") {
        setPropertyType("RENTED");
        setIsActive(false);
      }

      router.refresh();
    } catch (err) {
      alert("Error: " + String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const menuItems = [
    { action: "toggle", label: isActive ? "Deactivate" : "Activate", icon: isActive ? "visibility_off" : "visibility" },
    { action: "forSale", label: "For Sale", icon: "home" },
    { action: "forRent", label: "For Rent", icon: "key" },
    { action: "sold", label: "Sold", icon: "check_circle" },
    { action: "rented", label: "Rented", icon: "handshake" },
  ];

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
                className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${!isActive ? 'grayscale opacity-50' : ''}`}
              />
              {!isActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                  <span className="material-icons text-white text-2xl">visibility_off</span>
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
        <StatusBadge active={isActive} isFeatured={property.is_featured} type={propertyType} />
      </div>

      {/* Actions - Menu */}
      <div className="col-span-12 md:col-span-2 flex items-center justify-end">
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            disabled={isLoading}
            className={`p-2 rounded-lg transition-all cursor-pointer text-gray-400 hover:text-nordic-dark hover:bg-gray-100 ${isLoading ? 'opacity-50' : ''}`}
            title="Actions"
          >
            <span className="material-icons text-xl">more_vert</span>
          </button>

          {menuOpen && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 z-40"
                onClick={() => setMenuOpen(false)}
              />
              {/* Menu */}
              <div className="absolute right-0 top-full mt-1 z-[60] w-40 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                {menuItems.map((item) => (
                  <button
                    key={item.action}
                    onClick={() => handleAction(item.action)}
                    className="w-full text-left px-3 py-1.5 text-xs text-nordic-dark hover:bg-background-light transition-colors flex items-center gap-2"
                  >
                    <span className="material-icons text-sm text-gray-400">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
