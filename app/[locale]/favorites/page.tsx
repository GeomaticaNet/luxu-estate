"use client";

import { useEffect, useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { PropertyCard } from "@/components/property/PropertyCard";
import { useFavoritesContext } from "@/hooks/FavoritesContext";
import { Property } from "@/interfaces/property";
import { BackButton } from "@/components/ui/BackButton";

export default function FavoritesPage() {
  const t = useTranslations("Favorites");
  const { favorites } = useFavoritesContext();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const prevSize = useRef(0);

  useEffect(() => {
    const slugs = Array.from(favorites);
    if (slugs.length === 0) {
      if (prevSize.current !== 0) setProperties([]);
      setLoading(false);
      prevSize.current = 0;
      return;
    }
    prevSize.current = slugs.length;
    setLoading(true);
    fetch("/api/properties/by-slugs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slugs }),
    })
      .then((res) => res.json())
      .then((data) => setProperties(data.properties ?? []))
      .catch(() => setProperties([]))
      .finally(() => setLoading(false));
  }, [favorites.size]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <BackButton />
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-nordic-dark">{t("title")}</h1>
        {favorites.size > 0 && (
          <p className="text-nordic-muted mt-2">
            {t("count", { count: favorites.size })}
          </p>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl overflow-hidden shadow-card animate-pulse">
              <div className="aspect-[4/3] bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-5 bg-gray-200 rounded w-1/3" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
                <div className="h-3 bg-gray-200 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-20">
          <span className="material-icons text-6xl text-gray-300 mb-4">favorite_border</span>
          <h2 className="text-xl font-semibold text-nordic-dark mb-2">{t("empty_title")}</h2>
          <p className="text-nordic-muted max-w-md mx-auto">{t("empty_description")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </main>
  );
}
