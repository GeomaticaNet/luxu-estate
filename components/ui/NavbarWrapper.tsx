"use client";

import { usePathname } from "next/navigation";

interface NavbarWrapperProps {
  children: React.ReactNode;
}

export function NavbarWrapper({ children }: NavbarWrapperProps) {
  const pathname = usePathname();
  
  // Don't show public navbar on admin or login routes
  if (pathname?.includes("/admin") || pathname?.includes("/login")) {
    return null;
  }
  
  return <>{children}</>;
}
