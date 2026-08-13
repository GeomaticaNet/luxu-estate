"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { usePathname } from "@/i18n/routing";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { ContactModal } from "@/components/contact/ContactModal";
import { isAuthenticated, buildContactNext } from "@/lib/contact-gate";

export function NavLinks() {
  const tNavigation = useTranslations("Navigation");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentType = searchParams.get("type") === "rent" ? "rent" : "buy";
  const [sellOpen, setSellOpen] = useState(false);
  const handledContactRef = useRef(false);

  const handleSell = async () => {
    if (!(await isAuthenticated())) {
      router.push(`/login?next=${encodeURIComponent(buildContactNext(pathname, searchParams, "sell"))}`);
      return;
    }
    setSellOpen(true);
  };

  // Re-open the sell modal after login returns with ?contact=sell (desktop only)
  useEffect(() => {
    if (handledContactRef.current) return;
    if (searchParams.get("contact") !== "sell") return;
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(min-width: 768px)").matches) return;
    handledContactRef.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSellOpen(true);
    router.replace(pathname);
  }, [searchParams, pathname, router]);

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
          onClick={handleSell}
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