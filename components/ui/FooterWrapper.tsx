"use client";

import { usePathname } from "next/navigation";
import { Footer } from "./Footer";

export function FooterWrapper() {
  const pathname = usePathname();

  if (pathname?.includes("/admin") || pathname?.includes("/login")) {
    return null;
  }

  return <Footer />;
}
