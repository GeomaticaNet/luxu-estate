"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { useState, useTransition, useRef, useEffect } from "react";

const locales = [
  { code: "es", label: "ES", flag: "🇪🇸" },
  { code: "en", label: "EN", flag: "🇺🇸" },
  { code: "pt", label: "PT", flag: "🇧🇷" },
];

export function LanguageSelector() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const currentLocale = locales.find((l) => l.code === locale) ?? locales[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(nextLocale: string) {
    setIsOpen(false);
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-full border border-gray-200/20 hover:bg-white/20 transition-colors"
      >
        <span className="text-sm font-medium">{currentLocale.flag} {currentLocale.label}</span>
        <span className={`material-symbols-outlined text-sm transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
          expand_more
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-24 rounded-xl bg-white/85 backdrop-blur-lg shadow-xl border border-gray-200/30 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {locales.map((l) => (
            <button
              key={l.code}
              onClick={() => handleSelect(l.code)}
              className={`w-full flex items-center gap-1 px-4 py-2.5 text-sm transition-colors ${
                l.code === locale
                  ? "bg-mosque/10 text-mosque font-semibold"
                  : "text-nordic-dark hover:bg-gray-50"
              }`}
            >
              <span className="text-base">{l.flag}</span>
              <span>{l.label}</span>
              {l.code === locale && (
                <span className="material-symbols-outlined text-sm text-mosque">check</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
