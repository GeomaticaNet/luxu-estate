"use client";

import { useState, useEffect, useRef, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { SearchFiltersModal } from "./SearchFiltersModal";
import { HeroVideoBackground } from "./HeroVideoBackground";

const DEBOUNCE_MS = 350;

const HERO_VIDEOS = ["/videos/1.mp4", "/videos/2.mp4", "/videos/4.mp4"];

const HeroContent = () => {
  const t = useTranslations("Hero");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const [searchQuery, setSearchQuery] = useState(searchParams?.get("q") ?? "");

  const hasFilters = Array.from(searchParams?.keys() || []).some(key => key !== "q" && key !== "page");
  const currentPropertyType = searchParams?.get("propertyType");

  const navigateWithQuery = useCallback((query: string) => {
    const params = new URLSearchParams(searchParams?.toString());
    if (query.trim()) {
      params.set("q", query.trim());
    } else {
      params.delete("q");
    }
    params.delete("page");
    router.push(`/?${params.toString()}`);
  }, [router, searchParams]);

  const handleSearch = () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    navigateWithQuery(searchQuery);
  };

  const handleQueryChange = (value: string) => {
    setSearchQuery(value);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      navigateWithQuery(value);
    }, DEBOUNCE_MS);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleClearFilters = () => {
    setSearchQuery("");
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
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
    <section className="relative py-20 md:py-28 min-h-[80vh] flex items-center">
      {/* Video + dark overlay: arrancan desde el top de la página (-80px = altura navbar) */}
      <div className="absolute left-0 right-0 bottom-0 z-0" style={{ top: '-80px' }}>
        <HeroVideoBackground videos={HERO_VIDEOS} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-transparent z-10" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-32 md:h-48 bg-gradient-to-t from-background-light to-transparent z-10" />
      <div className="relative z-20 max-w-3xl mx-auto text-center space-y-5 md:space-y-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-white leading-tight px-4">
          {t("title_prefix")} <span className="relative inline-block">
            <span className="relative z-10 font-medium">{t("title_highlight")}</span>
            <span className="absolute bottom-2 left-0 w-full h-3 bg-mosque/40 -rotate-1 z-0"></span>
          </span>{t("title_suffix")}
        </h1>
          <div className="relative group max-w-2xl mx-auto flex items-center">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
              <span className="material-icons text-white/60 text-2xl group-focus-within:text-mosque transition-colors">search</span>
            </div>
            <input
              value={searchQuery}
              onChange={(e) => handleQueryChange(e.target.value)}
              onKeyDown={handleKeyDown}
              className="block w-full pl-12 pr-24 md:pr-44 py-3 md:py-4 rounded-xl border border-white/20 bg-white/15 text-white shadow-soft placeholder-white/50 focus:ring-2 focus:ring-mosque focus:bg-white/25 backdrop-blur-md transition-all text-base md:text-lg"
              placeholder={t("search_placeholder")}
              type="text"
            />
            <div className="absolute inset-y-2 right-2 flex items-center gap-1 md:gap-2">
              {hasFilters && (
                <div className="flex items-center bg-white/15 backdrop-blur-sm text-white pl-2 md:pl-3 pr-1 py-1 rounded-md text-xs md:text-sm font-medium">
                  {t("filtered")}
                  <button
                    onClick={handleClearFilters}
                    className="ml-1 w-5 h-5 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                  >
                    <span className="material-icons text-[14px]">close</span>
                  </button>
                </div>
              )}
              <button
                onClick={handleSearch}
                className="px-4 md:px-6 h-full bg-mosque hover:bg-mosque/90 text-white font-medium rounded-lg transition-colors flex items-center justify-center shadow-lg shadow-mosque/20 text-sm md:text-base whitespace-nowrap"
              >
                {t("search")}
              </button>
            </div>
          </div>
        <div className="flex flex-wrap items-center justify-center gap-2 py-2 px-4">
          <button 
            onClick={() => {
              router.push("/");
            }}
            className={`whitespace-nowrap px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition-transform hover:-translate-y-0.5 ${
              !currentPropertyType 
                ? "bg-white text-nordic-dark shadow-lg" 
                : "bg-white/15 backdrop-blur-sm border border-white/20 text-white hover:bg-white/25"
            }`}
          >
            {t("all")}
          </button>
          {propertyTypes.map((type) => (
            <button 
              key={type}
              onClick={() => togglePropertyType(type)}
              className={`whitespace-nowrap px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                currentPropertyType === type
                  ? "bg-mosque text-white shadow-lg shadow-mosque/20"
                  : "bg-white/15 backdrop-blur-sm border border-white/20 text-white hover:bg-white/25"
              }`}
            >
              {t(`types.${type}`)}
            </button>
          ))}
          <div className="w-px h-5 bg-white/20 mx-1"></div>
          <button 
            onClick={() => setIsFiltersOpen(true)}
            className="whitespace-nowrap flex items-center gap-1 px-3 sm:px-4 py-2 rounded-full text-white text-xs sm:text-sm font-medium bg-white/15 backdrop-blur-sm border border-white/20 hover:bg-white/25 hover:ring-2 hover:ring-white/30 transition-all"
          >
            <span className="material-icons text-sm sm:text-base">tune</span> {t("filters")}
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
    <Suspense fallback={<div className="py-12 md:py-16 text-center text-white">{t("loading")}</div>}>
      <HeroContent />
    </Suspense>
  );
};
