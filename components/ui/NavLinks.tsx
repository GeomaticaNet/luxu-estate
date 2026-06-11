"use client";

import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export function NavLinks() {
  const t = useTranslations("Navigation");
  const searchParams = useSearchParams();
  const currentType = searchParams.get("type") === "rent" ? "rent" : "buy";

  return (
    <div className="flex items-center space-x-8">
      <Link
        href="/"
        className={`text-sm font-medium px-1 py-1 transition-all ${
          currentType === "buy"
            ? "text-mosque border-b-2 border-mosque"
            : "text-nordic-dark/70 hover:text-nordic-dark hover:border-b-2 hover:border-nordic-dark/20"
        }`}
      >
        {t("buy")}
      </Link>
      <Link
        href="/?type=rent"
        className={`text-sm font-medium px-1 py-1 transition-all ${
          currentType === "rent"
            ? "text-mosque border-b-2 border-mosque"
            : "text-nordic-dark/70 hover:text-nordic-dark hover:border-b-2 hover:border-nordic-dark/20"
        }`}
      >
        {t("rent")}
      </Link>
      <Link
        href="#"
        className="text-nordic-dark/70 hover:text-nordic-dark font-medium text-sm hover:border-b-2 hover:border-nordic-dark/20 px-1 py-1 transition-all"
      >
        {t("sell")}
      </Link>
    </div>
  );
}
