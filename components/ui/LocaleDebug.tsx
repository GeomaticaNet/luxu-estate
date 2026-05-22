"use client";

import { useLocale } from "next-intl";
import { useEffect } from "react";

export function LocaleDebug() {
  const locale = useLocale();

  useEffect(() => {
    const navigatorLangs = navigator.languages?.join(", ") || navigator.language;
    console.log("🌐 LuxeEstate - Locale Info:");
    console.log(`   Aplicado:       ${locale}`);
    console.log(`   Navegador:      ${navigatorLangs}`);
    console.log(`   Accept-Language: ${document.cookie.match(/(^|;\s*)NEXT_LOCALE=([^;]*)/)?.[2] || "sin cookie"}`);
    console.log(`   URL:            ${window.location.href}`);
  }, [locale]);

  return null;
}
