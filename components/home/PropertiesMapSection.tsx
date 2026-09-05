"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import type { Property } from "@/interfaces/property";

// Mapbox solo funciona en el navegador — carga diferida en cliente.
const PropertiesMapMapbox = dynamic(() => import("./PropertiesMapMapbox"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-slate-100 animate-pulse">
      <span className="material-icons text-4xl text-nordic-muted/40">map</span>
    </div>
  ),
});

const STORAGE_KEY = "luxe_map_collapsed";

export function PropertiesMapSection({ properties }: { properties: Property[] }) {
  const t = useTranslations("Map");
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (stored !== null) setCollapsed(stored === "1");
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  if (properties.length === 0) return null;

  return (
    <section id="map" className="relative scroll-mt-24 pt-12 md:pt-16 pb-10 md:pb-14">
      {/* Header (aligned to the content column like New In Market) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-light text-nordic-dark">
              {t("title")}
            </h2>
            <p className="text-sm text-nordic-muted mt-1">{t("subtitle")}</p>
          </div>
          <button
            onClick={toggle}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-mosque/25 bg-white text-mosque text-sm font-medium hover:bg-hint-of-green/40 transition-colors whitespace-nowrap"
            aria-expanded={!collapsed}
          >
            <span className="material-icons text-base">
              {collapsed ? "map" : "expand_less"}
            </span>
            {collapsed ? t("show") : t("hide")}
          </button>
        </div>
      </div>

      {/* Map — same width as the New In Market cards gallery, with a
          blinds (persiana) collapse animation */}
      {hydrated && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`rounded-2xl border border-black/5 shadow-[0_14px_40px_-8px_rgba(25,50,47,0.35),0_4px_12px_-4px_rgba(25,50,47,0.25)] overflow-hidden transition-[height,opacity] duration-500 ease-in-out ${
              collapsed ? "h-0 opacity-0" : "h-[380px] md:h-[500px] opacity-100"
            }`}
          >
            <div className="relative z-0 w-full h-full">
              <PropertiesMapMapbox properties={properties} />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}