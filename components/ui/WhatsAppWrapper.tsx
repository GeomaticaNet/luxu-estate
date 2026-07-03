"use client";

import { usePathname } from "next/navigation";
import { WhatsAppButton } from "./WhatsAppButton";

export function WhatsAppWrapper() {
  const pathname = usePathname();

  // Don't show WhatsApp button on admin or login routes
  if (pathname?.includes("/admin") || pathname?.includes("/login")) {
    return null;
  }

  return <WhatsAppButton />;
}
