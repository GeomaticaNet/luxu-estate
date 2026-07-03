"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { ContactModal } from "@/components/contact/ContactModal";

export function NavLinks() {
  const tNavigation = useTranslations("Navigation");
  const searchParams = useSearchParams();
  const currentType = searchParams.get("type") === "rent" ? "rent" : "buy";
  const [sellOpen, setSellOpen] = useState(false);

  return (
    <>
      <div className="flex items-center space-x-8">
        <Link
          href="/#new-in-market"
          className={`text-sm font-medium px-1 py-1 transition-all ${
            currentType === "buy"
              ? "text-mosque border-b-2 border-mosque"
              : "text-nordic-dark/70 hover:text-nordic-dark hover:border-b-2 hover:border-nordic-dark/20"
          }`}
        >
          {tNavigation("buy")}
        </Link>
        <Link
          href="/?type=rent#new-in-market"
          className={`text-sm font-medium px-1 py-1 transition-all ${
            currentType === "rent"
              ? "text-mosque border-b-2 border-mosque"
              : "text-nordic-dark/70 hover:text-nordic-dark hover:border-b-2 hover:border-nordic-dark/20"
          }`}
        >
          {tNavigation("rent")}
        </Link>
        <button
          onClick={() => setSellOpen(true)}
          className="text-nordic-dark/70 hover:text-nordic-dark font-medium text-sm hover:border-b-2 hover:border-nordic-dark/20 px-1 py-1 transition-all cursor-pointer"
        >
          {tNavigation("sell")}
        </button>
      </div>

      <ContactModal
        isOpen={sellOpen}
        onClose={() => setSellOpen(false)}
        leadType="sell"
      />
    </>
  );
}
