"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { SearchFiltersModal } from "./SearchFiltersModal";

const HeroContent = () => {
  const t = useTranslations("Hero");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Read initial query from URL so input stays populated
  const [searchQuery, setSearchQuery] = useState(searchParams?.get("q") ?? "");

  const hasFilters = Array.from(searchParams?.keys() || []).some(key => key !== "q" && key !== "page");
  const currentPropertyType = searchParams?.get("propertyType");

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams?.toString());
    if (searchQuery.trim()) {
      params.set("q", searchQuery.trim());
    } else {
      params.delete("q");
    }
    
    // Always go back to page 1 on new search
    params.delete("page");
    
    router.push(`/?${params.toString()}`);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    router.push("/");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const togglePropertyType = (type: string) => {
    const params = new URLSearchParams(searchParams?.toString());
    if (currentPropertyType === type) {
      params.delete("propertyType");
    } else {
      params.set("propertyType", type);
    }
    params.delete("page");
    router.push(`/?${params.toString()}`);
  };

  const propertyTypes = ["House", "Apartment", "Villa", "Penthouse"];

  return (
    <section className="py-12 md:py-16">
      <div className="max-w-3xl mx-auto text-center space-y-8">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-nordic-dark leading-tight">
          {t("title_prefix")} <span className="relative inline-block">
            <span className="relative z-10 font-medium">{t("title_highlight")}</span>
            <span className="absolute bottom-2 left-0 w-full h-3 bg-mosque/20 -rotate-1 z-0"></span>
          </span>{t("title_suffix")}
        </h1>
        <div className="relative group max-w-2xl mx-auto flex items-center">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
            <span className="material-icons text-nordic-muted text-2xl group-focus-within:text-mosque transition-colors">search</span>
          </div>
          <input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="block w-full pl-12 pr-44 py-4 rounded-xl border-none bg-white text-nordic-dark shadow-soft placeholder-nordic-muted/60 focus:ring-2 focus:ring-mosque focus:bg-white:bg-white/10 transition-all text-lg" 
            placeholder={t("search_placeholder")} 
            type="text" 
          />
          <div className="absolute inset-y-2 right-2 flex items-center gap-2">
            {hasFilters && (
              <div className="flex items-center bg-mosque/10 text-mosque pl-3 pr-1 py-1 rounded-md text-sm font-medium">
                {t("filtered")}
                <button 
                  onClick={handleClearFilters}
                  className="ml-1 w-5 h-5 rounded-full flex items-center justify-center hover:bg-mosque/20 transition-colors"
                >
                  <span className="material-icons text-[14px]">close</span>
                </button>
              </div>
            )}
            <button 
              onClick={handleSearch}
              className="px-6 h-full bg-mosque hover:bg-mosque/90 text-white font-medium rounded-lg transition-colors flex items-center justify-center shadow-lg shadow-mosque/20"
            >
              {t("search")}
            </button>
          </div>
        </div>
        <div className="flex items-center justify-center gap-3 overflow-x-auto hide-scroll py-2 px-4 -mx-4">
          <button 
            onClick={() => {
              const params = new URLSearchParams(searchParams?.toString());
              params.delete("propertyType");
              params.delete("page");
              router.push(`/?${params.toString()}`);
            }}
            className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-transform hover:-translate-y-0.5 ${
              !currentPropertyType 
                ? "bg-nordic-dark text-white shadow-lg shadow-nordic-dark/10" 
                : "bg-white border border-nordic-dark/5 text-nordic-muted hover:text-nordic-dark hover:border-mosque/50 hover:bg-mosque/5"
            }`}
          >
            {t("all")}
          </button>
          {propertyTypes.map((type) => (
            <button 
              key={type}
              onClick={() => togglePropertyType(type)}
              className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-all ${
                currentPropertyType === type
                  ? "bg-mosque text-white shadow-lg shadow-mosque/20"
                  : "bg-white border border-nordic-dark/5 text-nordic-muted hover:text-nordic-dark hover:border-mosque/50 hover:bg-mosque/5"
              }`}
            >
              {t(`types.${type}`)}
            </button>
          ))}
          <div className="w-px h-6 bg-nordic-dark/10 mx-2"></div>
          <button 
            onClick={() => setIsFiltersOpen(true)}
            className="whitespace-nowrap flex items-center gap-1 px-4 py-2 rounded-full text-nordic-dark font-medium text-sm bg-white border border-nordic-dark/5 hover:border-mosque/50 hover:text-mosque hover:bg-mosque/5 hover:ring-2 hover:ring-mosque/20 hover:shadow-md transition-all"
          >
            <span className="material-icons text-base">tune</span> {t("filters")}
          </button>
        </div>
      </div>
      
      <SearchFiltersModal
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        initialFilters={{
          q: searchParams?.get('q') ?? undefined,
          beds: searchParams?.get('beds') ?? undefined,
          baths: searchParams?.get('baths') ?? undefined,
          price_min: searchParams?.get('price_min') ?? undefined,
          price_max: searchParams?.get('price_max') ?? undefined,
          propertyType: searchParams?.get('propertyType') ?? undefined,
        }}
      />
    </section>
  );
};

export const Hero = () => {
  const t = useTranslations("Hero");
  return (
    <Suspense fallback={<div className="py-12 md:py-16 text-center">{t("loading")}</div>}>
      <HeroContent />
    </Suspense>
  );
};
