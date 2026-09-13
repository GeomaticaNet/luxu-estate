"use client";

import { createContext, useContext } from "react";
import type { AdminAuth } from "@/lib/admin-auth";

const AdminAuthContext = createContext<AdminAuth | null>(null);

export function AdminAuthProvider({ auth, children }: { auth: AdminAuth; children: React.ReactNode }) {
  return (
    <AdminAuthContext.Provider value={auth}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminAuth {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
