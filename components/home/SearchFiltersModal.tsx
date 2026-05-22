"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";


const PRICE_MIN = 0;
const PRICE_MAX = 10_000_000;

interface InitialFilters {

  q?: string;
  beds?: string;
  baths?: string;
  price_min?: string;
  price_max?: string;
  propertyType?: string;
}

interface SearchFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFilters?: InitialFilters;
}

export const SearchFiltersModal: React.FC<SearchFiltersModalProps> = ({
  isOpen,
  onClose,
  initialFilters = {},
}) => {
  const router = useRouter();
  const t = useTranslations("SearchFiltersModal");

  const [location, setLocation] = useState('');
  const [bedrooms, setBedrooms] = useState(0);
  const [bathrooms, setBathrooms] = useState(0);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [propertyType, setPropertyType] = useState('');

  // Sync state from parent whenever modal opens
  useEffect(() => {
    if (!isOpen) return;
    setLocation(initialFilters.q ?? '');
    setBedrooms(initialFilters.beds ? Number(initialFilters.beds) : 0);
    setBathrooms(initialFilters.baths ? Number(initialFilters.baths) : 0);
    setMinPrice(initialFilters.price_min ?? '');
    setMaxPrice(initialFilters.price_max ?? '');
    setPropertyType(initialFilters.propertyType ?? '');
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isOpen) return null;

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location.trim()) params.append('q', location.trim());
    if (bedrooms > 0) params.append('beds', bedrooms.toString());
    if (bathrooms > 0) params.append('baths', bathrooms.toString());
    if (minPrice) params.append('price_min', minPrice.replace(/[^0-9]/g, ''));
    if (maxPrice) params.append('price_max', maxPrice.replace(/[^0-9]/g, ''));
    if (propertyType) params.append('propertyType', propertyType);
    onClose();
    router.push(`/?${params.toString()}`);
  };

  const clearFilters = () => {
    setLocation('');
    setBedrooms(0);
    setBathrooms(0);
    setMinPrice('');
    setMaxPrice('');
    setPropertyType('');
    onClose();
    router.push('/');
  };

  return (
    <>
      {/* Overlay — click closes modal */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal panel */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <main
          className="relative w-full max-w-4xl bg-white/60 backdrop-blur-xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <header className="px-8 py-6 border-b border-white/10 flex justify-between items-center bg-white/40 backdrop-blur-xl sticky top-0 z-30">
            <h2 className="text-2xl font-semibold tracking-tight text-nordic-dark">{t("filters")}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-black/5 transition-colors text-nordic-muted"
            >
              <span className="material-icons">close</span>
            </button>
          </header>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto hide-scroll p-8 space-y-10">
            {/* Location */}
            <section>
              <label className="block text-xs font-semibold text-nordic-muted uppercase tracking-wider mb-3">
                {t("location")}
              </label>
              <div className="relative group">
                <span className="material-icons absolute left-4 top-3.5 text-nordic-muted group-focus-within:text-mosque transition-colors">
                  location_on
                </span>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-background-light border-0 rounded-lg text-nordic-dark placeholder-nordic-muted/60 focus:ring-2 focus:ring-mosque focus:bg-white transition-all shadow-sm"
                  placeholder={t("location_placeholder")}
                  type="text"
                />
              </div>
            </section>

            {/* Price Range */}
            <section>
              <label className="block text-xs font-semibold text-nordic-muted uppercase tracking-wider mb-4">
                {t("price_range")}
              </label>

              {/* Dual range slider */}
              <div className="relative mb-6">
                <div className="relative h-2 mx-3">
                  {/* Track background */}
                  <div className="absolute inset-0 bg-nordic-dark/10 rounded-full" />
                  {/* Active track */}
                  <div
                    className="absolute h-full bg-mosque rounded-full"
                    style={{
                      left: `${Math.min(
                        ((Number(minPrice.replace(/\D/g, '')) || PRICE_MIN) - PRICE_MIN) / (PRICE_MAX - PRICE_MIN) * 100,
                        ((Number(maxPrice.replace(/\D/g, '')) || PRICE_MAX) - PRICE_MIN) / (PRICE_MAX - PRICE_MIN) * 100
                      )}%`,
                      right: `${100 - Math.max(
                        ((Number(minPrice.replace(/\D/g, '')) || PRICE_MIN) - PRICE_MIN) / (PRICE_MAX - PRICE_MIN) * 100,
                        ((Number(maxPrice.replace(/\D/g, '')) || PRICE_MAX) - PRICE_MIN) / (PRICE_MAX - PRICE_MIN) * 100
                      )}%`,
                    }}
                  />
                  {/* Min thumb */}
                  <input
                    type="range"
                    min={PRICE_MIN}
                    max={PRICE_MAX}
                    step={50000}
                    value={Number(minPrice.replace(/\D/g, '')) || PRICE_MIN}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      const maxVal = Number(maxPrice.replace(/\D/g, '')) || PRICE_MAX;
                      setMinPrice(String(Math.min(val, maxVal - 50000)));
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    style={{ pointerEvents: 'auto' }}
                  />
                  {/* Max thumb */}
                  <input
                    type="range"
                    min={PRICE_MIN}
                    max={PRICE_MAX}
                    step={50000}
                    value={Number(maxPrice.replace(/\D/g, '')) || PRICE_MAX}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      const minVal = Number(minPrice.replace(/\D/g, '')) || PRICE_MIN;
                      setMaxPrice(String(Math.max(val, minVal + 50000)));
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    style={{ pointerEvents: 'auto' }}
                  />
                  {/* Visual thumbs */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 bg-white border-2 border-mosque rounded-full shadow-md z-10 pointer-events-none"
                    style={{
                      left: `${((Number(minPrice.replace(/\D/g, '')) || PRICE_MIN) - PRICE_MIN) / (PRICE_MAX - PRICE_MIN) * 100}%`,
                    }}
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 bg-white border-2 border-mosque rounded-full shadow-md z-10 pointer-events-none"
                    style={{
                      left: `${((Number(maxPrice.replace(/\D/g, '')) || PRICE_MAX) - PRICE_MIN) / (PRICE_MAX - PRICE_MIN) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background-light p-3 rounded-lg border border-transparent focus-within:border-mosque/30 transition-colors">
                  <label className="block text-[10px] text-nordic-muted uppercase font-medium mb-1">{t("min_price")}</label>
                  <div className="flex items-center">
                    <span className="text-nordic-muted mr-1">$</span>
                    <input
                      className="w-full bg-transparent border-0 p-0 text-nordic-dark font-medium focus:ring-0 text-sm outline-none"
                      type="text"
                      value={minPrice ? Number(minPrice).toLocaleString() : ''}
                      onChange={(e) => setMinPrice(e.target.value.replace(/\D/g, ''))}
                      placeholder={t("no_minimum")}
                    />
                  </div>
                </div>
                <div className="bg-background-light p-3 rounded-lg border border-transparent focus-within:border-mosque/30 transition-colors">
                  <label className="block text-[10px] text-nordic-muted uppercase font-medium mb-1">{t("max_price")}</label>
                  <div className="flex items-center">
                    <span className="text-nordic-muted mr-1">$</span>
                    <input
                      className="w-full bg-transparent border-0 p-0 text-nordic-dark font-medium focus:ring-0 text-sm outline-none"
                      type="text"
                      value={maxPrice ? Number(maxPrice).toLocaleString() : ''}
                      onChange={(e) => setMaxPrice(e.target.value.replace(/\D/g, ''))}
                      placeholder={t("no_maximum")}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Property Type + Rooms */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Property Type */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-nordic-muted uppercase tracking-wider">
                  {t("property_type")}
                </label>
                <div className="relative">
                  <select
                    className="w-full bg-background-light border-0 rounded-lg py-3 pl-4 pr-10 text-nordic-dark appearance-none focus:ring-2 focus:ring-mosque cursor-pointer outline-none"
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                  >
                    <option value="">{t("any_type")}</option>
                    <option value="House">{t("house")}</option>
                    <option value="Apartment">{t("apartment")}</option>
                    <option value="Villa">{t("villa")}</option>
                    <option value="Penthouse">{t("penthouse")}</option>
                    <option value="Condo">{t("condo")}</option>
                    <option value="Townhouse">{t("townhouse")}</option>
                  </select>
                  <span className="material-icons absolute right-3 top-3 text-nordic-muted pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Beds & Baths */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-nordic-dark">{t("bedrooms")}</span>
                  <div className="flex items-center space-x-3 bg-background-light rounded-full p-1">
                    <button
                      onClick={() => setBedrooms(Math.max(0, bedrooms - 1))}
                      disabled={bedrooms === 0}
                      className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-nordic-muted hover:text-mosque disabled:opacity-50 transition-colors"
                    >
                      <span className="material-icons text-base">remove</span>
                    </button>
                    <span className="text-sm font-semibold w-8 text-center">
                      {bedrooms === 0 ? t("any") : `${bedrooms}+`}
                    </span>
                    <button
                      onClick={() => setBedrooms(bedrooms + 1)}
                      className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-mosque hover:bg-mosque hover:text-white transition-colors"
                    >
                      <span className="material-icons text-base">add</span>
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-nordic-dark">{t("bathrooms")}</span>
                  <div className="flex items-center space-x-3 bg-background-light rounded-full p-1">
                    <button
                      onClick={() => setBathrooms(Math.max(0, bathrooms - 1))}
                      disabled={bathrooms === 0}
                      className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-nordic-muted hover:text-mosque disabled:opacity-50 transition-colors"
                    >
                      <span className="material-icons text-base">remove</span>
                    </button>
                    <span className="text-sm font-semibold w-8 text-center">
                      {bathrooms === 0 ? t("any") : `${bathrooms}+`}
                    </span>
                    <button
                      onClick={() => setBathrooms(bathrooms + 1)}
                      className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-mosque hover:bg-mosque hover:text-white transition-colors"
                    >
                      <span className="material-icons text-base">add</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Amenities */}
            <section>
              <label className="block text-xs font-semibold text-nordic-muted uppercase tracking-wider mb-4">
                {t("amenities_features")}
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { id: 'pool', icon: 'pool', labelKey: 'pool' },
                  { id: 'gym', icon: 'fitness_center', labelKey: 'gym' },
                  { id: 'parking', icon: 'local_parking', labelKey: 'parking' },
                  { id: 'ac', icon: 'ac_unit', labelKey: 'ac' },
                  { id: 'wifi', icon: 'wifi', labelKey: 'wifi' },
                  { id: 'patio', icon: 'deck', labelKey: 'patio' },
                ].map(({ id, icon, labelKey }) => (
                  <label key={id} className="cursor-pointer group">
                    <input className="peer sr-only" type="checkbox" />
                    <div className="h-full px-4 py-3 rounded-lg border border-nordic-dark/10 bg-white text-nordic-muted text-sm flex items-center justify-center gap-2 transition-all hover:border-mosque/40 peer-checked:border-mosque peer-checked:bg-mosque/5 peer-checked:text-mosque">
                      <span className="material-icons text-lg text-nordic-muted/50 group-hover:text-nordic-muted peer-checked:text-mosque">
                        {icon}
                      </span>
                      {t(labelKey as any)}
                    </div>
                  </label>
                ))}
              </div>
            </section>
          </div>

          {/* Footer */}
          <footer className="bg-white/40 backdrop-blur-xl border-t border-white/10 px-8 py-6 sticky bottom-0 z-30 flex items-center justify-between">
            <button
              onClick={clearFilters}
              className="text-sm font-medium text-nordic-muted hover:text-nordic-dark transition-colors underline decoration-nordic-muted/30 underline-offset-4"
            >
              {t("clear_all_filters")}
            </button>
            <button
              onClick={handleSearch}
              className="bg-mosque hover:bg-mosque/90 text-white px-8 py-3 rounded-lg font-medium shadow-lg shadow-mosque/30 transition-all hover:shadow-mosque/40 flex items-center gap-2 active:scale-95"
            >
              {t("show_homes")}
              <span className="material-icons text-sm">arrow_forward</span>
            </button>
          </footer>
        </main>
      </div>
    </>
  );
};
