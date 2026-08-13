"use client";

import { useTranslations } from "next-intl";
import { PropertyRow } from "./PropertyRow";

export interface Property {
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
  property_type: string;
  agent_id?: string | null;
}

interface Agent {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface PropertyListProps {
  properties: Property[];
  mainImages: Record<string, string>;
  totalListings: number;
  activeProperties: number;
  forSaleCount: number;
  forRentCount: number;
  soldCount: number;
  rentedCount: number;
  showingFrom: number;
  showingTo: number;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  currentPropertyType?: string;
  isAdmin?: boolean;
  currentUserId?: string | null;
  agents?: Agent[];
}

export function PropertyList(props: PropertyListProps) {
  const t = useTranslations("Admin");
  const { properties, mainImages, totalListings, activeProperties, forSaleCount, forRentCount, soldCount, rentedCount, showingFrom, showingTo, totalCount, currentPage, totalPages, currentPropertyType, isAdmin = false, currentUserId = null, agents = [] } = props;

  function pageUrl(page: number) {
    const params = new URLSearchParams();
    params.set("page", String(page));
    if (currentPropertyType) params.set("property_type", currentPropertyType);
    return `?${params.toString()}`;
  }

  const stats = [
    { labelKey: "total_listings", value: totalListings, icon: "apartment", color: "bg-mosque/10 text-mosque" },
    { labelKey: "active_properties", value: activeProperties, icon: "check_circle", color: "bg-hint-of-green text-mosque" },
    { labelKey: "for_sale", value: forSaleCount, icon: "sell", color: "bg-green-100 text-green-700" },
    { labelKey: "sold", value: soldCount, icon: "domain_disabled", color: "bg-gray-200 text-gray-600" },
    { labelKey: "for_rent", value: forRentCount, icon: "home", color: "bg-blue-100 text-blue-600" },
    { labelKey: "rented", value: rentedCount, icon: "handshake", color: "bg-blue-900/20 text-blue-900" },
  ];

  return (
    <>
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.labelKey} className="bg-white p-5 rounded-lg border border-gray-200 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">{t(stat.labelKey)}</p>
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
          {t("showing_results", { from: showingFrom, to: showingTo, total: totalCount || 0 })}
        </div>
        <div className="flex gap-1">
          <a
            href={currentPage > 1 ? pageUrl(currentPage - 1) : undefined}
            className={`px-2 py-1 text-xs border border-gray-200 rounded text-gray-500 hover:bg-white hover:text-nordic-dark transition-colors ${currentPage <= 1 ? 'opacity-40 pointer-events-none' : ''}`}
          >
            <span className="material-icons text-sm">chevron_left</span>
          </a>
          <a
            href={currentPage < totalPages ? pageUrl(currentPage + 1) : undefined}
            className={`px-2 py-1 text-xs border border-gray-200 rounded text-gray-500 hover:bg-white hover:text-nordic-dark transition-colors ${currentPage >= totalPages ? 'opacity-40 pointer-events-none' : ''}`}
          >
            <span className="material-icons text-sm">chevron_right</span>
          </a>
        </div>
      </div>

      {/* Property List Container */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50/50 border-b border-gray-100 text-sm font-semibold text-gray-500 uppercase tracking-wider">
          <div className="col-span-4">{t("property_details")}</div>
          <div className="col-span-2">{t("price")}</div>
          <div className="col-span-2">{t("status")}</div>
          <div className="col-span-2">{t("assigned_to_col")}</div>
          <div className="col-span-2 text-right">{t("actions")}</div>
        </div>

        {/* Properties */}
        {properties.map((property, index) => (
          <PropertyRow 
            key={property.id}
            property={property}
            mainImage={mainImages[property.id] || null}
            isLast={index === properties.length - 1}
            isAdmin={isAdmin}
            currentUserId={currentUserId}
            agents={agents}
          />
        ))}
      </div>
    </>
  );
}
